"""Serializers para personal médico."""
from rest_framework import serializers
from .models import Especialidad, Medico, HorarioMedico


class EspecialidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Especialidad
        fields = "__all__"


class HorarioMedicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = HorarioMedico
        fields = "__all__"

    def validate(self, data):
        if data.get("hora_fin") and data.get("hora_inicio"):
            if data["hora_fin"] <= data["hora_inicio"]:
                raise serializers.ValidationError(
                    "La hora de fin debe ser posterior a la hora de inicio."
                )
        return data


class MedicoSerializer(serializers.ModelSerializer):
    especialidad_nombre = serializers.CharField(
        source="id_especialidad.nombre_especialidad", read_only=True,
    )
    horarios = HorarioMedicoSerializer(many=True, read_only=True)

    class Meta:
        model = Medico
        fields = [
            "id_medico", "nombre_medico", "id_especialidad",
            "especialidad_nombre", "telefono", "horarios",
        ]


class MedicoListSerializer(serializers.ModelSerializer):
    especialidad_nombre = serializers.CharField(
        source="id_especialidad.nombre_especialidad", read_only=True,
    )

    class Meta:
        model = Medico
        fields = [
            "id_medico", "nombre_medico", "id_especialidad",
            "especialidad_nombre", "telefono",
        ]
