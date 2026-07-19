"""Serializers para citas."""
from rest_framework import serializers
from .models import Cita


class CitaSerializer(serializers.ModelSerializer):
    paciente_nombre = serializers.CharField(
        source="id_paciente.__str__", read_only=True,
    )
    medico_nombre = serializers.CharField(
        source="id_medico.nombre_medico", read_only=True,
    )

    class Meta:
        model = Cita
        fields = [
            "id_cita", "id_paciente", "paciente_nombre",
            "id_medico", "medico_nombre",
            "fecha_cita", "hora_cita", "estado_cita",
        ]
        read_only_fields = ["id_cita"]

    def validate(self, data):
        """Valida que no haya solapamiento de citas (regla de negocio 1)."""
        id_medico = data.get("id_medico", getattr(self.instance, "id_medico", None))
        fecha_cita = data.get("fecha_cita", getattr(self.instance, "fecha_cita", None))
        hora_cita = data.get("hora_cita", getattr(self.instance, "hora_cita", None))

        if id_medico and fecha_cita and hora_cita:
            qs = Cita.objects.filter(
                id_medico=id_medico,
                fecha_cita=fecha_cita,
                hora_cita=hora_cita,
            ).exclude(
                estado_cita__in=["Cancelada", "No Asistio"],
            )
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    {
                        "non_field_errors": [
                            "El médico ya tiene una cita programada en esa fecha y hora."
                        ]
                    },
                )
        return data


class CitaUpdateSerializer(serializers.ModelSerializer):
    """Solo permite cambiar el estado de la cita."""
    class Meta:
        model = Cita
        fields = ["estado_cita"]
