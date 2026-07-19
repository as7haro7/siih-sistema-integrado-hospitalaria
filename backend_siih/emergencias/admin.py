from django.contrib import admin
from .models import Emergencia


@admin.register(Emergencia)
class EmergenciaAdmin(admin.ModelAdmin):
    list_display = ["id_emergencia", "id_paciente", "nivel_triage", "fecha_hora_ingreso", "destino_paciente"]
    list_filter = ["nivel_triage"]
