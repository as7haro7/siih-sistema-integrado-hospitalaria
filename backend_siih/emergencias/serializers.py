"""Serializers para emergencias."""
from rest_framework import serializers
from .models import Emergencia


class EmergenciaSerializer(serializers.ModelSerializer):
    paciente_nombre = serializers.CharField(
        source="id_paciente.__str__", read_only=True,
    )
    medico_nombre = serializers.CharField(
        source="id_medico_guardia.nombre_medico", read_only=True,
    )

    class Meta:
        model = Emergencia
        fields = [
            "id_emergencia", "id_paciente", "paciente_nombre",
            "id_medico_guardia", "medico_nombre",
            "fecha_hora_ingreso", "nivel_triage",
            "descripcion_urgencia", "destino_paciente",
        ]
        read_only_fields = ["id_emergencia"]
