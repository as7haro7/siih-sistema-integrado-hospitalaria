"""Vistas para hospitalización y camas."""
from django.utils import timezone
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from accounts.permissions import IsAdmin, IsMedico, IsEnfermera, IsRecepcionista
from .models import TarifaHabitacion, Cama, Hospitalizacion
from .serializers import (
    TarifaHabitacionSerializer,
    CamaSerializer,
    HospitalizacionSerializer,
    AltaSerializer,
)


class TarifaHabitacionViewSet(viewsets.ModelViewSet):
    """CRUD de tarifas de habitación (Admin)."""
    queryset = TarifaHabitacion.objects.all()
    serializer_class = TarifaHabitacionSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [(IsAdmin | IsMedico | IsRecepcionista)()]
        return [IsAdmin()]


class CamaViewSet(viewsets.ModelViewSet):
    """
    CRUD de camas.

    GET /api/v1/camas/disponibles/ → Camas con estado 'Disponible'
    """
    queryset = Cama.objects.select_related("id_tarifa").all()
    serializer_class = CamaSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["estado_cama", "nro_habitacion"]

    def get_permissions(self):
        if self.action in ("list", "retrieve", "disponibles"):
            return [(IsAdmin | IsMedico | IsEnfermera | IsRecepcionista)()]
        return [IsAdmin()]

    @action(detail=False, methods=["get"], url_path="disponibles")
    def disponibles(self, request):
        """Lista camas disponibles."""
        camas = Cama.objects.filter(estado_cama="Disponible").select_related("id_tarifa")
        serializer = CamaSerializer(camas, many=True)
        return Response(serializer.data)


class HospitalizacionViewSet(viewsets.ModelViewSet):
    """
    Gestión de hospitalizaciones.

    POST /api/v1/hospitalizaciones/         → Crear internación
    POST /api/v1/hospitalizaciones/{id}/alta/ → Dar de alta
    """
    queryset = (
        Hospitalizacion.objects
        .select_related("id_paciente", "id_medico_responsable", "id_cama")
        .all()
        .order_by("-fecha_ingreso")
    )
    serializer_class = HospitalizacionSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["estado_internacion", "id_medico_responsable", "id_paciente"]
    ordering_fields = ["fecha_ingreso"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [(IsAdmin | IsMedico | IsEnfermera)()]
        return [(IsAdmin | IsMedico)()]

    @action(detail=True, methods=["post"], url_path="alta")
    def alta(self, request, pk=None):
        """
        Da de alta al paciente: registra fecha_egreso, cambia estado
        a 'Alta'. El trigger de la BD libera la cama automáticamente.
        """
        hospitalizacion = self.get_object()

        if hospitalizacion.estado_internacion != "Activo":
            return Response(
                {"detail": "Esta hospitalización ya no está activa."},
                status=status.HTTP_409_CONFLICT,
            )

        serializer = AltaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        hospitalizacion.fecha_egreso = timezone.now()
        hospitalizacion.estado_internacion = "Alta"
        hospitalizacion.save(update_fields=["fecha_egreso", "estado_internacion"])

        # Refrescar para reflejar cambios del trigger
        hospitalizacion.refresh_from_db()

        return Response(
            HospitalizacionSerializer(hospitalizacion).data,
            status=status.HTTP_200_OK,
        )
