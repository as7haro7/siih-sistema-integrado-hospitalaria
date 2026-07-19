"""Vistas para facturación: facturas, pagos, consolidación."""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from accounts.permissions import IsAdmin, IsCajero
from .models import ConfigImpuesto, Factura, FacturaDetalle, Pago
from .serializers import (
    ConfigImpuestoSerializer,
    FacturaSerializer,
    ConsolidarFacturaSerializer,
    PagoSerializer,
    PagoCreateSerializer,
)
from .services import consolidar_factura


class ConfigImpuestoViewSet(viewsets.ModelViewSet):
    """CRUD de configuraciones de impuesto (Admin)."""
    queryset = ConfigImpuesto.objects.all()
    serializer_class = ConfigImpuestoSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [(IsAdmin | IsCajero)()]
        return [IsAdmin()]


class FacturaViewSet(viewsets.ModelViewSet):
    """
    Gestión de facturas.

    POST /api/v1/facturas/consolidar/ → Consolida cargos en una factura
    POST /api/v1/facturas/{id}/pagos/ → Registra un pago
    """
    queryset = (
        Factura.objects
        .select_related("id_impuesto", "id_historial", "id_hospitalizacion")
        .prefetch_related("detalles", "pagos")
        .all()
        .order_by("-fecha_emision")
    )
    serializer_class = FacturaSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["estado_pago"]

    def get_permissions(self):
        return [(IsAdmin | IsCajero)()]

    @action(detail=False, methods=["post"], url_path="consolidar")
    def consolidar(self, request):
        """
        Consolida todos los cargos de un historial/hospitalización
        en una factura (RF-08).
        """
        serializer = ConsolidarFacturaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        factura = consolidar_factura(
            id_historial=serializer.validated_data.get("id_historial"),
            id_hospitalizacion=serializer.validated_data.get("id_hospitalizacion"),
            id_impuesto=serializer.validated_data["id_impuesto"],
            nit_factura=serializer.validated_data.get("nit_factura", ""),
            razon_social=serializer.validated_data.get("razon_social", ""),
            cajero=request.user.username,
        )

        return Response(
            FacturaSerializer(factura).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"], url_path="pagos")
    def registrar_pago(self, request, pk=None):
        """
        Registra un pago parcial o total.
        El trigger trg_pago_actualiza_factura recalcula el estado automáticamente.
        """
        factura = self.get_object()

        if factura.estado_pago in ("Pagado", "Anulado"):
            return Response(
                {"detail": f"La factura está en estado '{factura.estado_pago}' y no acepta pagos."},
                status=status.HTTP_409_CONFLICT,
            )

        serializer = PagoCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        Pago.objects.create(
            id_factura=factura,
            monto=serializer.validated_data["monto"],
            metodo_pago=serializer.validated_data["metodo_pago"],
            cajero_responsable=request.user.username,
        )

        # Refrescar para ver el estado actualizado por el trigger
        factura.refresh_from_db()

        return Response(
            FacturaSerializer(factura).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["get"], url_path="pagos-lista")
    def listar_pagos(self, request, pk=None):
        """Lista todos los pagos de una factura."""
        factura = self.get_object()
        pagos = Pago.objects.filter(id_factura=factura).order_by("-fecha_pago")
        serializer = PagoSerializer(pagos, many=True)
        return Response(serializer.data)
