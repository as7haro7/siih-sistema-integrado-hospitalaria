"""Serializers para historial clínico y catálogo CIE-10."""
from rest_framework import serializers
from .models import HistorialClinico, CatalogoCIE10


class CatalogoCIE10Serializer(serializers.ModelSerializer):
    """Serializer para el catálogo CIE-10 (lectura principalmente)."""
    class Meta:
        model = CatalogoCIE10
        fields = ["id_cie10", "codigo", "descripcion"]
        read_only_fields = ["id_cie10"]


class HistorialClinicoSerializer(serializers.ModelSerializer):
    """Serializer para el historial clínico con referencia al código CIE-10."""
    codigo_cie10 = serializers.CharField(
        source="id_cie10.codigo", read_only=True, required=False,
    )
    descripcion_cie10 = serializers.CharField(
        source="id_cie10.descripcion", read_only=True, required=False,
    )

    class Meta:
        model = HistorialClinico
        fields = [
            "id_historial", "id_cita", "id_hospitalizacion", "id_emergencia",
            "id_cie10", "codigo_cie10", "descripcion_cie10", "fecha_registro",
            "motivo_consulta", "tratamiento", "diagnostico", "medico_tratante",
        ]
        read_only_fields = ["id_historial", "fecha_registro", "codigo_cie10", "descripcion_cie10"]

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
