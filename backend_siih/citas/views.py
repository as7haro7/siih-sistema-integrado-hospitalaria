"""Vistas para citas médicas."""
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend

from accounts.permissions import IsAdmin, IsRecepcionista, IsMedico
from .models import Cita
from .serializers import CitaSerializer, CitaUpdateSerializer


class CitaViewSet(viewsets.ModelViewSet):
    """
    CRUD de citas.

    GET  /api/v1/citas/        → Listar (filtrable por fecha, médico, estado)
    POST /api/v1/citas/        → Crear cita (valida solapamiento)
    PATCH /api/v1/citas/{id}/  → Cambiar estado
    """
    queryset = (
        Cita.objects
        .select_related("id_paciente", "id_medico")
        .all()
        .order_by("-fecha_cita", "-hora_cita")
    )
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["estado_cita", "id_medico", "id_paciente", "fecha_cita"]
    ordering_fields = ["fecha_cita", "hora_cita"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [(IsAdmin | IsRecepcionista | IsMedico)()]
        return [(IsAdmin | IsRecepcionista)()]

    def get_serializer_class(self):
        if self.action in ("partial_update", "update"):
            return CitaUpdateSerializer
        return CitaSerializer
