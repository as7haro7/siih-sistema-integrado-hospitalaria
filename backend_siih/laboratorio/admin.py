from django.contrib import admin
from .models import ExamenLaboratorio


@admin.register(ExamenLaboratorio)
class ExamenLaboratorioAdmin(admin.ModelAdmin):
    list_display = ["id_examen", "id_historial", "tipo_examen", "estado_examen", "costo_examen"]
    list_filter = ["estado_examen"]
