from django.contrib import admin
from .models import Cita


@admin.register(Cita)
class CitaAdmin(admin.ModelAdmin):
    list_display = ["id_cita", "id_paciente", "id_medico", "fecha_cita", "hora_cita", "estado_cita"]
    list_filter = ["estado_cita", "fecha_cita"]
    search_fields = ["id_paciente__nombre", "id_paciente__apellido"]
