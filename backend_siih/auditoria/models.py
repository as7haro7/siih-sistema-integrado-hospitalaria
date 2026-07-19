"""Modelo AUDITORIA_SISTEMA (solo lectura)."""
from django.db import models


class AuditoriaSistema(models.Model):
    TIPO_OPERACION_CHOICES = [
        ("INSERCION", "Inserción"),
        ("LECTURA", "Lectura"),
        ("EDICION", "Edición"),
        ("ELIMINACION", "Eliminación"),
    ]

    id_auditoria = models.AutoField(primary_key=True)
    usuario_accion = models.CharField(max_length=100)
    tabla_afectada = models.CharField(max_length=50)
    id_registro_afectado = models.IntegerField()
    tipo_operacion = models.CharField(max_length=11, choices=TIPO_OPERACION_CHOICES)
    valores_anteriores = models.TextField(blank=True, null=True)
    valores_nuevos = models.TextField(blank=True, null=True)
    fecha_hora_evento = models.DateTimeField(auto_now_add=True)
    direccion_ip = models.CharField(max_length=45, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "AUDITORIA_SISTEMA"
        verbose_name = "Registro de auditoría"
        verbose_name_plural = "Registros de auditoría"
        ordering = ["-fecha_hora_evento"]

    def __str__(self):
        return f"[{self.tipo_operacion}] {self.tabla_afectada}:{self.id_registro_afectado} por {self.usuario_accion}"
