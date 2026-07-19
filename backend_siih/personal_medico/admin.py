from django.contrib import admin
from .models import Especialidad, Medico, HorarioMedico


@admin.register(Especialidad)
class EspecialidadAdmin(admin.ModelAdmin):
    list_display = ["id_especialidad", "nombre_especialidad"]


@admin.register(Medico)
class MedicoAdmin(admin.ModelAdmin):
    list_display = ["id_medico", "nombre_medico", "id_especialidad", "telefono"]
    list_filter = ["id_especialidad"]


@admin.register(HorarioMedico)
class HorarioMedicoAdmin(admin.ModelAdmin):
    list_display = ["id_horario", "id_medico", "dia_semana", "hora_inicio", "hora_fin", "estado_turno"]
    list_filter = ["dia_semana", "estado_turno"]
