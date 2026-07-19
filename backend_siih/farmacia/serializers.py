"""Serializers para farmacia."""
from datetime import date
from rest_framework import serializers
from .models import (
    Proveedor, Medicamento, LoteMedicamento,
    Compra, CompraDetalle, RecetaDetalle,
)


class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = "__all__"


class MedicamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicamento
        fields = "__all__"
        # stock_actual se actualiza solo por triggers, no manualmente
        read_only_fields = ["id_medicamento", "stock_actual"]


class LoteMedicamentoSerializer(serializers.ModelSerializer):
    medicamento_nombre = serializers.CharField(
        source="id_medicamento.nombre_comercial", read_only=True,
    )

    class Meta:
        model = LoteMedicamento
        fields = "__all__"
        read_only_fields = ["id_lote"]

    def validate(self, data):
        """Regla de negocio 5: fecha de vencimiento > fecha de ingreso."""
        fecha_ingreso = data.get("fecha_ingreso")
        fecha_vencimiento = data.get("fecha_vencimiento")
        if fecha_ingreso and fecha_vencimiento:
            if fecha_vencimiento <= fecha_ingreso:
                raise serializers.ValidationError(
                    "La fecha de vencimiento debe ser posterior a la fecha de ingreso."
                )
        return data


class CompraDetalleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompraDetalle
        fields = ["id_compra_detalle", "id_lote", "cantidad", "precio_unitario", "subtotal_linea"]
        read_only_fields = ["id_compra_detalle", "subtotal_linea"]


class CompraSerializer(serializers.ModelSerializer):
    detalles = CompraDetalleSerializer(many=True, read_only=True)
    proveedor_nombre = serializers.CharField(
        source="id_proveedor.nombre_proveedor", read_only=True,
    )

    class Meta:
        model = Compra
        fields = [
            "id_compra", "id_proveedor", "proveedor_nombre",
            "fecha_compra", "numero_factura_compra", "total_compra",
            "detalles",
        ]
        read_only_fields = ["id_compra"]


class CompraCreateSerializer(serializers.Serializer):
    """
    Serializer para registrar una compra con su lote asociado.
    Crea: COMPRA + LOTE_MEDICAMENTO + COMPRA_DETALLE en una sola operación.
    """
    # Datos de la compra
    id_proveedor = serializers.IntegerField()
    fecha_compra = serializers.DateField()
    numero_factura_compra = serializers.CharField(required=False, allow_blank=True)

    # Datos del lote
    id_medicamento = serializers.IntegerField()
    numero_lote = serializers.CharField(required=False, allow_blank=True)
    cantidad = serializers.IntegerField(min_value=1)
    precio_compra_unitario = serializers.DecimalField(max_digits=10, decimal_places=2)
    fecha_vencimiento = serializers.DateField()

    def validate(self, data):
        if data["fecha_vencimiento"] <= data["fecha_compra"]:
            raise serializers.ValidationError(
                "La fecha de vencimiento debe ser posterior a la fecha de compra."
            )
        return data


class RecetaDetalleSerializer(serializers.ModelSerializer):
    medicamento_nombre = serializers.CharField(
        source="id_medicamento.nombre_comercial", read_only=True,
    )

    class Meta:
        model = RecetaDetalle
        fields = [
            "id_detalle_receta", "id_historial", "id_medicamento",
            "medicamento_nombre", "cantidad_recetada",
            "dosis", "frecuencia", "duracion", "estado_despacho",
        ]
        read_only_fields = ["id_detalle_receta", "estado_despacho"]


class RecetaDetalleCreateSerializer(serializers.ModelSerializer):
    """Usado desde la acción anidada en historiales."""
    class Meta:
        model = RecetaDetalle
        fields = [
            "id_medicamento", "cantidad_recetada",
            "dosis", "frecuencia", "duracion",
        ]
