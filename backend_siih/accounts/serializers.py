"""Serializers para autenticación y gestión de usuarios."""
from django.contrib.auth.models import User, Group
from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from .models import PerfilUsuario


class PerfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilUsuario
        fields = ["cargo", "telefono"]


class UserSerializer(serializers.ModelSerializer):
    """Serializer de lectura para usuarios existentes."""
    perfil = PerfilSerializer(read_only=True)
    roles = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name",
            "is_active", "perfil", "roles",
        ]

    @extend_schema_field(serializers.ListField(child=serializers.CharField()))
    def get_roles(self, obj):
        return list(obj.groups.values_list("name", flat=True))


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear usuarios nuevos (solo Admin)."""
    password = serializers.CharField(write_only=True, min_length=8)
    cargo = serializers.CharField(required=False, allow_blank=True)
    telefono = serializers.CharField(required=False, allow_blank=True)
    roles = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        help_text="Lista de nombres de roles (Groups) a asignar.",
    )

    class Meta:
        model = User
        fields = [
            "username", "password", "email", "first_name", "last_name",
            "cargo", "telefono", "roles",
        ]

    def validate_roles(self, value):
        for role_name in value:
            if not Group.objects.filter(name=role_name).exists():
                raise serializers.ValidationError(
                    f"El rol '{role_name}' no existe. "
                    "Roles válidos: Administrador, Recepcionista, Médico, "
                    "Enfermera, Técnico de Laboratorio, Farmacéutico, Cajero, Director."
                )
        return value

    def create(self, validated_data):
        cargo = validated_data.pop("cargo", "")
        telefono = validated_data.pop("telefono", "")
        roles = validated_data.pop("roles", [])
        password = validated_data.pop("password")

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        PerfilUsuario.objects.create(user=user, cargo=cargo, telefono=telefono)

        if roles:
            groups = Group.objects.filter(name__in=roles)
            user.groups.set(groups)

        return user


class RolAssignSerializer(serializers.Serializer):
    """Serializer para asignar/desasignar roles a un usuario."""
    roles = serializers.ListField(
        child=serializers.CharField(),
        help_text="Lista de nombres de roles a asignar (reemplaza los anteriores).",
    )

    def validate_roles(self, value):
        for role_name in value:
            if not Group.objects.filter(name=role_name).exists():
                raise serializers.ValidationError(
                    f"El rol '{role_name}' no existe."
                )
        return value
