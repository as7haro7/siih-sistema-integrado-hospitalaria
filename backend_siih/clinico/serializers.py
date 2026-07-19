"""Serializers para historial clínico."""
from rest_framework import serializers
from .models import HistorialClinico


class HistorialClinicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistorialClinico
        fields = "__all__"
        read_only_fields = ["id_historial", "fecha_registro"]

    def validate(self, data):
        """
        Regla de negocio 7: todo historial debe originarse en al menos
        un evento clínico (cita, hospitalización o emergencia).
        """
        id_cita = data.get("id_cita") or getattr(self.instance, "id_cita_id", None)
        id_hosp = data.get("id_hospitalizacion") or getattr(self.instance, "id_hospitalizacion_id", None)
        id_emerg = data.get("id_emergencia") or getattr(self.instance, "id_emergencia_id", None)

        if not any([id_cita, id_hosp, id_emerg]):
            raise serializers.ValidationError(
                "El historial debe estar asociado a al menos una cita, "
                "hospitalización o emergencia."
            )
        return data
