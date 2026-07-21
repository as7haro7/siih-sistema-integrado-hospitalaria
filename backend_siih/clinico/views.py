"""Vistas para historial clínico con acciones anidadas para recetas y exámenes."""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import IsAdmin, IsMedico, IsEnfermera
from .models import HistorialClinico, CatalogoCIE10
from .serializers import HistorialClinicoSerializer, CatalogoCIE10Serializer


class HistorialClinicoViewSet(viewsets.ModelViewSet):
    """
    Gestión de historiales clínicos.

    POST /api/v1/historiales/                 → Crear historial
    POST /api/v1/historiales/{id}/recetas/    → Emitir receta
    POST /api/v1/historiales/{id}/examenes/   → Solicitar examen
    """
    queryset = (
        HistorialClinico.objects
        .select_related("id_cita", "id_hospitalizacion", "id_emergencia", "id_cie10")
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


class CatalogoCIE10ViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet de solo lectura para el catálogo CIE-10.
    
    GET /api/v1/catalogo-cie10/           → Listar códigos CIE-10
    GET /api/v1/catalogo-cie10/{id}/      → Obtener un código CIE-10
    """
    queryset = CatalogoCIE10.objects.all().order_by("codigo")
    serializer_class = CatalogoCIE10Serializer

    def get_permissions(self):
        """Todos los usuarios autenticados pueden acceder al catálogo."""
        return [(IsAdmin | IsMedico | IsEnfermera)()]
