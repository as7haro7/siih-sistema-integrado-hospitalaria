"""Vistas para emergencias."""
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend

from accounts.permissions import IsAdmin, IsRecepcionista, IsMedico
from .models import Emergencia
from .serializers import EmergenciaSerializer


class EmergenciaViewSet(viewsets.ModelViewSet):
    """
    CRUD de emergencias.

    GET  /api/v1/emergencias/   → Listar
    POST /api/v1/emergencias/   → Registrar ingreso + triage
    """
    queryset = (
        Emergencia.objects
        .select_related("id_paciente", "id_medico_guardia")
        .all()
        .order_by("-fecha_hora_ingreso")
    )
    serializer_class = EmergenciaSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["nivel_triage", "id_medico_guardia"]
    ordering_fields = ["fecha_hora_ingreso"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [(IsAdmin | IsRecepcionista | IsMedico)()]
        return [(IsAdmin | IsRecepcionista | IsMedico)()]
