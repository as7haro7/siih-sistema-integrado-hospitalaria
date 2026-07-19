"""Serializers para exámenes de laboratorio."""
from rest_framework import serializers
from .models import ExamenLaboratorio


class ExamenLaboratorioSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamenLaboratorio
        fields = "__all__"
        read_only_fields = ["id_examen"]


class ExamenLaboratorioCreateSerializer(serializers.ModelSerializer):
    """Usado desde la acción anidada en historiales."""
    class Meta:
        model = ExamenLaboratorio
        fields = ["tipo_examen", "costo_examen"]


class ResultadoExamenSerializer(serializers.Serializer):
    """Para que el técnico cargue resultados."""
    resultado_texto = serializers.CharField()
    estado_examen = serializers.ChoiceField(
        choices=[("En Proceso", "En Proceso"), ("Completado", "Completado")],
        default="Completado",
    )
