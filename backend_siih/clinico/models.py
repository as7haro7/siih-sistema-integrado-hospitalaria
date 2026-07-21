"""Modelos de HISTORIAL_CLINICO y CATALOGO_CIE10."""
from django.db import models
from citas.models import Cita
from hospitalizacion.models import Hospitalizacion
from emergencias.models import Emergencia


class CatalogoCIE10(models.Model):
    id_cie10 = models.AutoField(primary_key=True)
    codigo = models.CharField(max_length=10, unique=True)
    descripcion = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = "CATALOGO_CIE10"
        verbose_name = "Catálogo CIE-10"
        verbose_name_plural = "Catálogos CIE-10"

    def __str__(self):
        return f"{self.codigo} - {self.descripcion}"


class HistorialClinico(models.Model):
    id_historial = models.AutoField(primary_key=True)
    id_cita = models.ForeignKey(
        Cita, on_delete=models.SET_NULL, db_column="id_cita",
        null=True, blank=True, related_name="historiales",
    )
    id_hospitalizacion = models.ForeignKey(
        Hospitalizacion, on_delete=models.SET_NULL, db_column="id_hospitalizacion",
        null=True, blank=True, related_name="historiales",
    )
    id_emergencia = models.ForeignKey(
        Emergencia, on_delete=models.SET_NULL, db_column="id_emergencia",
        null=True, blank=True, related_name="historiales",
    )
    id_cie10 = models.ForeignKey(
        CatalogoCIE10, on_delete=models.SET_NULL, db_column="id_cie10",
        null=True, blank=True, related_name="historiales",
    )
    fecha_registro = models.DateTimeField(auto_now_add=True)
    motivo_consulta = models.TextField(blank=True, null=True)
    tratamiento = models.TextField(blank=True, null=True)
    diagnostico = models.TextField(blank=True, null=True)
    medico_tratante = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "HISTORIAL_CLINICO"
        verbose_name = "Historial clínico"
        verbose_name_plural = "Historiales clínicos"

    def __str__(self):
        return f"Historial #{self.id_historial}"
