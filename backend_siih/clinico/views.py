"""Vistas para historial clínico con acciones anidadas para recetas y exámenes."""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import IsAdmin, IsMedico, IsEnfermera
from .models import HistorialClinico
from .serializers import HistorialClinicoSerializer


class HistorialClinicoViewSet(viewsets.ModelViewSet):
    """
    Gestión de historiales clínicos.

    POST /api/v1/historiales/                 → Crear historial
    POST /api/v1/historiales/{id}/recetas/    → Emitir receta
    POST /api/v1/historiales/{id}/examenes/   → Solicitar examen
    """
    queryset = (
        HistorialClinico.objects
        .select_related("id_cita", "id_hospitalizacion", "id_emergencia")
        .all()
        .order_by("-fecha_registro")
    )
    serializer_class = HistorialClinicoSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [(IsAdmin | IsMedico | IsEnfermera)()]
        return [(IsAdmin | IsMedico)()]

    def perform_create(self, serializer):
        """Asigna automáticamente el médico tratante al usuario autenticado."""
        serializer.save(medico_tratante=self.request.user.username)

    @action(detail=True, methods=["post"], url_path="recetas")
    def recetas(self, request, pk=None):
        """Emite una receta médica (RECETA_DETALLE) asociada a este historial."""
        from farmacia.serializers import RecetaDetalleCreateSerializer

        historial = self.get_object()
        serializer = RecetaDetalleCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(id_historial=historial)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="examenes")
    def examenes(self, request, pk=None):
        """Solicita un examen de laboratorio asociado a este historial."""
        from laboratorio.serializers import ExamenLaboratorioCreateSerializer

        historial = self.get_object()
        serializer = ExamenLaboratorioCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(id_historial=historial)

        return Response(serializer.data, status=status.HTTP_201_CREATED)
