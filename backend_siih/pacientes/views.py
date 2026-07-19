"""Vistas para gestión de pacientes."""
from django.db import models
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from accounts.permissions import IsAdmin, IsRecepcionista, IsMedico, IsEnfermera
from .models import Paciente, RegistroBaja
from .serializers import (
    PacienteSerializer,
    PacienteListSerializer,
    BajaCreateSerializer,
    RegistroBajaSerializer,
)


class PacienteViewSet(viewsets.ModelViewSet):
    """
    CRUD de pacientes.

    GET    /api/v1/pacientes/                → Listar
    POST   /api/v1/pacientes/                → Registrar
    GET    /api/v1/pacientes/{id}/            → Detalle
    PATCH  /api/v1/pacientes/{id}/            → Editar
    GET    /api/v1/pacientes/{id}/historial/  → Historial clínico completo
    POST   /api/v1/pacientes/{id}/baja/       → Dar de baja
    """
    queryset = Paciente.objects.all().order_by("-id_paciente")
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["estado_baja"]
    search_fields = ["nombre", "apellido", "cedula_paciente"]
    ordering_fields = ["nombre", "apellido", "id_paciente"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy", "baja"):
            return [(IsAdmin | IsRecepcionista)()]
        # Lectura: Recepcionista, Médico, Enfermera, Admin
        return [(IsAdmin | IsRecepcionista | IsMedico | IsEnfermera)()]

    def get_serializer_class(self):
        if self.action == "list":
            return PacienteListSerializer
        if self.action == "baja":
            return BajaCreateSerializer
        return PacienteSerializer

    @action(detail=True, methods=["get"], url_path="historial")
    def historial(self, request, pk=None):
        """Devuelve el historial clínico completo del paciente (RF-02)."""
        # Import aquí para evitar dependencia circular
        from clinico.serializers import HistorialClinicoSerializer
        from clinico.models import HistorialClinico

        paciente = self.get_object()
        historiales = HistorialClinico.objects.filter(
            models.Q(id_cita__id_paciente=paciente) |
            models.Q(id_hospitalizacion__id_paciente=paciente) |
            models.Q(id_emergencia__id_paciente=paciente)
        ).order_by("-fecha_registro")

        page = self.paginate_queryset(historiales)
        if page is not None:
            serializer = HistorialClinicoSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = HistorialClinicoSerializer(historiales, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="baja")
    def baja(self, request, pk=None):
        """Registra la baja de un paciente (crea REGISTRO_BAJA, trigger actualiza estado)."""
        paciente = self.get_object()

        if paciente.estado_baja == "Baja":
            return Response(
                {"detail": "El paciente ya se encuentra dado de baja."},
                status=status.HTTP_409_CONFLICT,
            )

        serializer = BajaCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        RegistroBaja.objects.create(
            id_paciente=paciente,
            motivo_baja=serializer.validated_data.get("motivo_baja", ""),
            usuario_autoriza=request.user.username,
        )

        # Refrescar para ver el estado actualizado por el trigger
        paciente.refresh_from_db()
        return Response(
            PacienteSerializer(paciente).data,
            status=status.HTTP_200_OK,
        )
