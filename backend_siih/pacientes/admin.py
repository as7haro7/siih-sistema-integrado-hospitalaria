from django.contrib import admin
from .models import Paciente, RegistroBaja


@admin.register(Paciente)
class PacienteAdmin(admin.ModelAdmin):
    list_display = ["id_paciente", "cedula_paciente", "nombre", "apellido", "estado_baja"]
    search_fields = ["nombre", "apellido", "cedula_paciente"]
    list_filter = ["estado_baja"]


@admin.register(RegistroBaja)
class RegistroBajaAdmin(admin.ModelAdmin):
    list_display = ["id_baja", "id_paciente", "fecha_baja", "usuario_autoriza"]
