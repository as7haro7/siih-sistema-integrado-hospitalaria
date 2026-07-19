"""Vistas para exámenes de laboratorio."""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from accounts.permissions import IsAdmin, IsMedico, IsTecnicoLab
from .models import ExamenLaboratorio
from .serializers import (
    ExamenLaboratorioSerializer,
    ResultadoExamenSerializer,
)


class ExamenLaboratorioViewSet(viewsets.ModelViewSet):
    """
    Gestión de exámenes de laboratorio.

    PATCH /api/v1/examenes/{id}/resultado/ → Cargar resultado (Técnico Lab)
    """
    queryset = ExamenLaboratorio.objects.select_related("id_historial").all().order_by("-id_examen")
    serializer_class = ExamenLaboratorioSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["estado_examen", "id_historial"]

    def get_permissions(self):
        if self.action == "resultado":
            return [(IsAdmin | IsTecnicoLab)()]
        if self.action in ("list", "retrieve"):
            return [(IsAdmin | IsMedico | IsTecnicoLab)()]
        return [(IsAdmin | IsMedico)()]

    @action(detail=True, methods=["patch"], url_path="resultado")
    def resultado(self, request, pk=None):
        """
        Carga resultado y cambia estado del examen.
        Solo para Técnico de Laboratorio.
        """
        examen = self.get_object()
        serializer = ResultadoExamenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        examen.resultado_texto = serializer.validated_data["resultado_texto"]
        examen.estado_examen = serializer.validated_data["estado_examen"]
        examen.save(update_fields=["resultado_texto", "estado_examen"])

        return Response(
            ExamenLaboratorioSerializer(examen).data,
            status=status.HTTP_200_OK,
        )
