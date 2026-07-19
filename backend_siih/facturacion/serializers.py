"""Serializers para facturación."""
from rest_framework import serializers
from .models import ConfigImpuesto, Factura, FacturaDetalle, Pago


class ConfigImpuestoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConfigImpuesto
        fields = "__all__"


class FacturaDetalleSerializer(serializers.ModelSerializer):
    class Meta:
        model = FacturaDetalle
        fields = [
            "id_factura_detalle", "concepto", "cantidad",
            "precio_unitario", "subtotal_linea",
        ]
        read_only_fields = ["id_factura_detalle", "subtotal_linea"]


class FacturaSerializer(serializers.ModelSerializer):
    detalles = FacturaDetalleSerializer(many=True, read_only=True)
    impuesto_descripcion = serializers.CharField(
        source="id_impuesto.descripcion", read_only=True,
    )

    class Meta:
        model = Factura
        fields = [
            "id_factura", "id_historial", "id_hospitalizacion",
            "id_impuesto", "impuesto_descripcion",
            "nit_factura", "razon_social",
            "subtotal", "monto_impuesto", "total_pagar",
            "estado_pago", "fecha_emision", "cajero_responsable",
            "detalles",
        ]
        read_only_fields = [
            "id_factura", "subtotal", "monto_impuesto", "total_pagar",
            "estado_pago", "fecha_emision",
        ]


class ConsolidarFacturaSerializer(serializers.Serializer):
    """Datos necesarios para consolidar una factura."""
    id_historial = serializers.IntegerField(required=False, allow_null=True)
    id_hospitalizacion = serializers.IntegerField(required=False, allow_null=True)
    id_impuesto = serializers.IntegerField()
    nit_factura = serializers.CharField(required=False, allow_blank=True, default="")
    razon_social = serializers.CharField(required=False, allow_blank=True, default="")

    def validate(self, data):
        if not data.get("id_historial") and not data.get("id_hospitalizacion"):
            raise serializers.ValidationError(
                "Debe especificar al menos un id_historial o id_hospitalizacion."
            )
        return data


class PagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pago
        fields = "__all__"
        read_only_fields = ["id_pago", "fecha_pago"]


class PagoCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pago
        fields = ["monto", "metodo_pago"]

    def validate_monto(self, value):
        if value <= 0:
            raise serializers.ValidationError("El monto debe ser mayor a 0.")
        return value
