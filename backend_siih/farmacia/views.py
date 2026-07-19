"""
Vistas para farmacia: medicamentos, recetas, compras, alertas.
"""
from datetime import date, timedelta

from django.db import models, transaction
from django.db.models import Q, F
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from accounts.permissions import IsAdmin, IsFarmaceutico, IsMedico, IsDirector
from .models import (
    Proveedor, Medicamento, LoteMedicamento,
    Compra, CompraDetalle, RecetaDetalle,
)
from .serializers import (
    ProveedorSerializer,
    MedicamentoSerializer,
    LoteMedicamentoSerializer,
    CompraSerializer,
    CompraCreateSerializer,
    RecetaDetalleSerializer,
)
from .services import descontar_stock_fifo


class ProveedorViewSet(viewsets.ModelViewSet):
    """CRUD de proveedores."""
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [(IsAdmin | IsFarmaceutico)()]
        return [(IsAdmin | IsFarmaceutico)()]


class MedicamentoViewSet(viewsets.ModelViewSet):
    """
    CRUD de medicamentos.

    GET /api/v1/medicamentos/alertas/ → Stock bajo + lotes por vencer
    """
    queryset = Medicamento.objects.all().order_by("nombre_comercial")
    serializer_class = MedicamentoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ["nombre_comercial"]

    def get_permissions(self):
        if self.action in ("list", "retrieve", "alertas"):
            return [(IsAdmin | IsFarmaceutico | IsDirector)()]
        return [(IsAdmin | IsFarmaceutico)()]

    @action(detail=False, methods=["get"], url_path="alertas")
    def alertas(self, request):
        """
        Devuelve medicamentos con stock bajo y lotes próximos a vencer.
        RF-06: alertas de inventario.
        """
        # Medicamentos con stock <= stock_minimo
        stock_bajo = Medicamento.objects.filter(
            stock_actual__lte=F("stock_minimo")
        ).values("id_medicamento", "nombre_comercial", "stock_actual", "stock_minimo")

        # Lotes que vencen en los próximos 90 días
        fecha_limite = date.today() + timedelta(days=90)
        lotes_por_vencer = (
            LoteMedicamento.objects
            .filter(
                fecha_vencimiento__lte=fecha_limite,
                cantidad_actual__gt=0,
            )
            .select_related("id_medicamento")
            .values(
                "id_lote", "numero_lote",
                "id_medicamento__nombre_comercial",
                "cantidad_actual", "fecha_vencimiento",
            )
            .order_by("fecha_vencimiento")
        )

        return Response({
            "stock_bajo": list(stock_bajo),
            "lotes_proximos_a_vencer": list(lotes_por_vencer),
        })


class LoteMedicamentoViewSet(viewsets.ModelViewSet):
    """CRUD de lotes de medicamentos."""
    queryset = LoteMedicamento.objects.select_related("id_medicamento", "id_compra").all()
    serializer_class = LoteMedicamentoSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["id_medicamento"]

    def get_permissions(self):
        return [(IsAdmin | IsFarmaceutico)()]


class CompraViewSet(viewsets.ModelViewSet):
    """
    Gestión de compras.

    POST /api/v1/compras/ → Registra compra + lote + detalle en una operación.
    """
    queryset = Compra.objects.select_related("id_proveedor").prefetch_related("detalles", "lotes").all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["id_proveedor"]

    def get_permissions(self):
        return [(IsAdmin | IsFarmaceutico)()]

    def get_serializer_class(self):
        if self.action == "create":
            return CompraCreateSerializer
        return CompraSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """
        Crea COMPRA + LOTE_MEDICAMENTO + COMPRA_DETALLE en una transacción.
        El trigger trg_lote_incrementa_stock se encarga de actualizar stock_actual.
        """
        serializer = CompraCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # 1. Crear la compra
        compra = Compra.objects.create(
            id_proveedor_id=data["id_proveedor"],
            fecha_compra=data["fecha_compra"],
            numero_factura_compra=data.get("numero_factura_compra", ""),
            total_compra=data["cantidad"] * data["precio_compra_unitario"],
        )

        # 2. Crear el lote (dispara trigger que incrementa stock)
        lote = LoteMedicamento.objects.create(
            id_medicamento_id=data["id_medicamento"],
            id_compra=compra,
            numero_lote=data.get("numero_lote", ""),
            cantidad_inicial=data["cantidad"],
            cantidad_actual=data["cantidad"],
            precio_compra_unitario=data["precio_compra_unitario"],
            fecha_ingreso=data["fecha_compra"],
            fecha_vencimiento=data["fecha_vencimiento"],
        )

        # 3. Crear el detalle de compra
        CompraDetalle.objects.create(
            id_compra=compra,
            id_lote=lote,
            cantidad=data["cantidad"],
            precio_unitario=data["precio_compra_unitario"],
        )

        compra.refresh_from_db()
        return Response(
            CompraSerializer(compra).data,
            status=status.HTTP_201_CREATED,
        )


class RecetaDetalleViewSet(viewsets.ModelViewSet):
    """
    Gestión de recetas médicas / despacho.

    GET  /api/v1/recetas/pendientes/     → Cola de despacho
    POST /api/v1/recetas/{id}/despachar/ → Despachar receta (FIFO)
    """
    queryset = (
        RecetaDetalle.objects
        .select_related("id_historial", "id_medicamento")
        .all()
        .order_by("-id_detalle_receta")
    )
    serializer_class = RecetaDetalleSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["estado_despacho", "id_historial"]

    def get_permissions(self):
        if self.action in ("list", "retrieve", "pendientes"):
            return [(IsAdmin | IsFarmaceutico | IsMedico)()]
        return [(IsAdmin | IsFarmaceutico)()]

    @action(detail=False, methods=["get"], url_path="pendientes")
    def pendientes(self, request):
        """Cola de despacho: recetas con estado 'Pendiente'."""
        pendientes = (
            RecetaDetalle.objects
            .filter(estado_despacho="Pendiente")
            .select_related("id_historial", "id_medicamento")
            .order_by("id_detalle_receta")
        )
        serializer = RecetaDetalleSerializer(pendientes, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="despachar")
    def despachar(self, request, pk=None):
        """
        Despacha una receta: valida stock FIFO y cambia estado a 'Entregado'.
        El trigger trg_receta_descuenta_stock hace el descuento real en la BD.
        """
        receta = self.get_object()

        if receta.estado_despacho == "Entregado":
            return Response(
                {"detail": "Esta receta ya fue despachada."},
                status=status.HTTP_409_CONFLICT,
            )

        # Validar stock antes de que el trigger lo rechace
        info_despacho = descontar_stock_fifo(
            receta.id_medicamento_id,
            receta.cantidad_recetada,
        )

        # Cambiar estado → el trigger de la BD descuenta stock
        receta.estado_despacho = "Entregado"
        receta.save(update_fields=["estado_despacho"])

        return Response({
            "detail": "Receta despachada exitosamente.",
            "receta": RecetaDetalleSerializer(receta).data,
            "despacho_info": info_despacho,
        })
