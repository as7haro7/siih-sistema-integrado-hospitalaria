"""Vistas para especialidades, médicos y disponibilidad."""
from datetime import datetime, timedelta

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from accounts.permissions import IsAdmin, IsRecepcionista, IsMedico
from .models import Especialidad, Medico, HorarioMedico
from .serializers import (
    EspecialidadSerializer,
    MedicoSerializer,
    MedicoListSerializer,
    HorarioMedicoSerializer,
)


class EspecialidadViewSet(viewsets.ModelViewSet):
    """CRUD de especialidades (Admin)."""
    queryset = Especialidad.objects.all().order_by("nombre_especialidad")
    serializer_class = EspecialidadSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [(IsAdmin | IsRecepcionista | IsMedico)()]
        return [IsAdmin()]


class MedicoViewSet(viewsets.ModelViewSet):
    """
    CRUD de médicos.

    GET /api/v1/medicos/{id}/disponibilidad/?fecha=YYYY-MM-DD
    """
    queryset = Medico.objects.select_related("id_especialidad").prefetch_related("horarios").all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["id_especialidad"]

    def get_permissions(self):
        if self.action in ("list", "retrieve", "disponibilidad"):
            return [(IsAdmin | IsRecepcionista | IsMedico)()]
        return [IsAdmin()]

    def get_serializer_class(self):
        if self.action == "list":
            return MedicoListSerializer
        return MedicoSerializer

    @action(detail=True, methods=["get"], url_path="disponibilidad")
    def disponibilidad(self, request, pk=None):
        """
        Consulta horarios libres del médico para una fecha dada.
        Cruza HORARIO_MEDICO con CITA existentes para esa fecha.

        Query params:
            fecha (str): Fecha en formato YYYY-MM-DD (obligatorio).
        """
        from citas.models import Cita

        fecha_str = request.query_params.get("fecha")
        if not fecha_str:
            return Response(
                {"detail": "El parámetro 'fecha' es obligatorio (YYYY-MM-DD)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date()
        except ValueError:
            return Response(
                {"detail": "Formato de fecha inválido. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        medico = self.get_object()

        # Nombre del día en español para el ENUM de la BD
        dias_map = {
            0: "Lunes", 1: "Martes", 2: "Miercoles", 3: "Jueves",
            4: "Viernes", 5: "Sabado", 6: "Domingo",
        }
        dia_semana = dias_map[fecha.weekday()]

        # Horarios activos del médico para ese día
        horarios = HorarioMedico.objects.filter(
            id_medico=medico,
            dia_semana=dia_semana,
            estado_turno="Activo",
        )

        if not horarios.exists():
            return Response({
                "medico": medico.nombre_medico,
                "fecha": fecha_str,
                "dia_semana": dia_semana,
                "horarios_disponibles": [],
                "mensaje": "El médico no tiene horario activo para este día.",
            })

        # Citas ya reservadas para esa fecha
        citas_reservadas = set(
            Cita.objects.filter(
                id_medico=medico,
                fecha_cita=fecha,
            ).exclude(
                estado_cita__in=["Cancelada", "No Asistio"],
            ).values_list("hora_cita", flat=True)
        )

        # Generar slots de 30 minutos dentro de cada bloque de horario
        slots_libres = []
        for horario in horarios:
            current = datetime.combine(fecha, horario.hora_inicio)
            end = datetime.combine(fecha, horario.hora_fin)
            while current < end:
                hora_slot = current.time()
                if hora_slot not in citas_reservadas:
                    slots_libres.append(hora_slot.strftime("%H:%M"))
                current += timedelta(minutes=30)

        return Response({
            "medico": medico.nombre_medico,
            "fecha": fecha_str,
            "dia_semana": dia_semana,
            "horarios_disponibles": slots_libres,
        })


class HorarioMedicoViewSet(viewsets.ModelViewSet):
    """CRUD de horarios médicos."""
    queryset = HorarioMedico.objects.select_related("id_medico").all()
    serializer_class = HorarioMedicoSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [(IsAdmin | IsRecepcionista | IsMedico)()]
        return [IsAdmin()]
