from django.contrib import admin
from .models import HistorialClinico


@admin.register(HistorialClinico)
class HistorialClinicoAdmin(admin.ModelAdmin):
    list_display = ["id_historial", "id_cita", "id_hospitalizacion", "id_emergencia", "fecha_registro", "medico_tratante"]
    list_filter = ["fecha_registro"]
