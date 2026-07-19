"""
Permisos RBAC reutilizables basados en Groups de Django.

Cada clase verifica si el usuario autenticado pertenece al
Group correspondiente.  Se pueden combinar con el operador |
en las vistas:  permission_classes = [IsAdmin | IsMedico]
"""
from rest_framework.permissions import BasePermission


class _GroupPermission(BasePermission):
    """Clase base (no usar directamente)."""
    group_name: str = ""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        # Los superusuarios siempre pasan
        if request.user.is_superuser:
            return True
        return request.user.groups.filter(name=self.group_name).exists()


class IsAdmin(_GroupPermission):
    group_name = "Administrador"
    message = "Solo el Administrador puede realizar esta acción."


class IsRecepcionista(_GroupPermission):
    group_name = "Recepcionista"
    message = "Solo el Recepcionista puede realizar esta acción."


class IsMedico(_GroupPermission):
    group_name = "Médico"
    message = "Solo el Médico puede realizar esta acción."


class IsEnfermera(_GroupPermission):
    group_name = "Enfermera"
    message = "Solo la Enfermera puede realizar esta acción."


class IsTecnicoLab(_GroupPermission):
    group_name = "Técnico de Laboratorio"
    message = "Solo el Técnico de Laboratorio puede realizar esta acción."


class IsFarmaceutico(_GroupPermission):
    group_name = "Farmacéutico"
    message = "Solo el Farmacéutico puede realizar esta acción."


class IsCajero(_GroupPermission):
    group_name = "Cajero"
    message = "Solo el Cajero puede realizar esta acción."


class IsDirector(_GroupPermission):
    group_name = "Director"
    message = "Solo el Director puede realizar esta acción."
