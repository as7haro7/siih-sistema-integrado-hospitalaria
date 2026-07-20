"""Vistas para gestión de usuarios y asignación de roles."""
from django.contrib.auth.models import User, Group
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .serializers import UserSerializer, UserCreateSerializer, RolAssignSerializer
from .permissions import IsAdmin
from rest_framework.permissions import IsAuthenticated


class UsuarioViewSet(viewsets.ModelViewSet):
    """
    CRUD de usuarios del sistema (solo Admin).

    GET    /api/v1/usuarios/          → Listar usuarios
    POST   /api/v1/usuarios/          → Crear usuario
    GET    /api/v1/usuarios/{id}/     → Detalle
    PATCH  /api/v1/usuarios/{id}/     → Editar
    DELETE /api/v1/usuarios/{id}/     → Desactivar
    PATCH  /api/v1/usuarios/{id}/roles/ → Asignar roles
    """
    queryset = User.objects.all().select_related("perfil").prefetch_related("groups")
    
    # Todos deben estar autenticados, Admin puede todo, usuarios pueden ver su propio detalle
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['retrieve', 'update', 'partial_update']:
            # Permitiremos que los usuarios vean/editen su propio perfil o que sea Admin
            return [IsAuthenticated()]
        return [IsAdmin()]

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        return UserSerializer

    def retrieve(self, request, *args, **kwargs):
        user = self.get_object()
        if not request.user.is_superuser and not request.user.groups.filter(name="Administrador").exists():
            if request.user.id != user.id:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("No tienes permiso para ver este perfil.")
        return super().retrieve(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        if not request.user.is_superuser and not request.user.groups.filter(name="Administrador").exists():
            if request.user.id != user.id:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("No tienes permiso para editar este perfil.")
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """En vez de eliminar, desactiva al usuario."""
        user = self.get_object()
        user.is_active = False
        user.save(update_fields=["is_active"])
        return Response(
            {"detail": f"Usuario '{user.username}' desactivado."},
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["patch"], url_path="roles")
    def asignar_roles(self, request, pk=None):
        """Asigna roles (Groups) al usuario, reemplazando los anteriores."""
        user = self.get_object()
        serializer = RolAssignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        groups = Group.objects.filter(name__in=serializer.validated_data["roles"])
        user.groups.set(groups)

        return Response(
            {
                "detail": "Roles actualizados.",
                "roles": list(user.groups.values_list("name", flat=True)),
            },
            status=status.HTTP_200_OK,
        )
