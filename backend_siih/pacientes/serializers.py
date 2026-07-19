"""Serializers para pacientes y registros de baja."""
from rest_framework import serializers
from .models import Paciente, RegistroBaja


class PacienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paciente
        fields = "__all__"
        read_only_fields = ["id_paciente", "estado_baja"]

    def validate_cedula_paciente(self, value):
        """Valida que la cédula sea única antes de llegar a la BD (→ 409)."""
        if value is None:
            return value
        qs = Paciente.objects.filter(cedula_paciente=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                "Ya existe un paciente con esta cédula.",
                code="unique",
            )
        return value


class PacienteListSerializer(serializers.ModelSerializer):
    """Serializer liviano para listados."""
    class Meta:
        model = Paciente
        fields = [
            "id_paciente", "cedula_paciente", "nombre", "apellido",
            "telefono", "estado_baja",
        ]


class RegistroBajaSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistroBaja
        fields = "__all__"
        read_only_fields = ["id_baja", "fecha_baja"]


class BajaCreateSerializer(serializers.Serializer):
    """Serializer para el endpoint de baja de paciente."""
    motivo_baja = serializers.CharField(required=False, allow_blank=True)
