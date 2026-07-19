"""Vistas para auditoría (solo lectura, solo Admin)."""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from accounts.permissions import IsAdmin
from .models import AuditoriaSistema
from .serializers import AuditoriaSistemaSerializer


class AuditoriaSistemaViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Consulta de registros de auditoría (solo lectura, solo Admin).

    GET /api/v1/auditoria/ → Listar registros (filtrable por tabla, usuario, tipo)
    """
    queryset = AuditoriaSistema.objects.all()
    serializer_class = AuditoriaSistemaSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["tabla_afectada", "usuario_accion", "tipo_operacion"]
