from django.contrib import admin
from .models import AuditoriaSistema


@admin.register(AuditoriaSistema)
class AuditoriaSistemaAdmin(admin.ModelAdmin):
    list_display = [
        "id_auditoria", "usuario_accion", "tabla_afectada",
        "tipo_operacion", "fecha_hora_evento",
    ]
    list_filter = ["tabla_afectada", "tipo_operacion"]
    search_fields = ["usuario_accion"]
    readonly_fields = [
        "id_auditoria", "usuario_accion", "tabla_afectada",
        "id_registro_afectado", "tipo_operacion",
        "valores_anteriores", "valores_nuevos",
        "fecha_hora_evento", "direccion_ip",
    ]
