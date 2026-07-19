"""Serializers para hospitalización y camas."""
from django.utils import timezone
from rest_framework import serializers
from .models import TarifaHabitacion, Cama, Hospitalizacion


class TarifaHabitacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TarifaHabitacion
        fields = "__all__"


class CamaSerializer(serializers.ModelSerializer):
    tipo_habitacion = serializers.CharField(
        source="id_tarifa.tipo_habitacion", read_only=True,
    )
    costo_por_dia = serializers.DecimalField(
        source="id_tarifa.costo_por_dia", max_digits=10, decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = Cama
        fields = [
            "id_cama", "nro_habitacion", "nro_cama", "id_tarifa",
            "tipo_habitacion", "costo_por_dia", "estado_cama",
        ]


class HospitalizacionSerializer(serializers.ModelSerializer):
    paciente_nombre = serializers.CharField(
        source="id_paciente.__str__", read_only=True,
    )
    medico_nombre = serializers.CharField(
        source="id_medico_responsable.nombre_medico", read_only=True,
    )
    cama_info = serializers.CharField(
        source="id_cama.__str__", read_only=True,
    )

    class Meta:
        model = Hospitalizacion
        fields = [
            "id_hospitalizacion", "id_cita", "id_emergencia",
            "id_paciente", "paciente_nombre",
            "id_medico_responsable", "medico_nombre",
            "id_cama", "cama_info",
            "fecha_ingreso", "fecha_egreso",
            "diagnostico_ingreso", "estado_internacion",
        ]
        read_only_fields = ["id_hospitalizacion", "fecha_egreso", "estado_internacion"]

    def validate_id_cama(self, value):
        """Valida que la cama esté disponible (regla de negocio 3)."""
        if value.estado_cama != "Disponible":
            raise serializers.ValidationError(
                f"La cama {value} no está disponible (estado actual: {value.estado_cama})."
            )
        return value


class AltaSerializer(serializers.Serializer):
    """Serializer para el alta de un paciente hospitalizado."""
    diagnostico_egreso = serializers.CharField(required=False, allow_blank=True)
