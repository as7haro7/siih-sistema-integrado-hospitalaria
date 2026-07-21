"""Modelo EXAMEN_LABORATORIO."""
from django.db import models
from clinico.models import HistorialClinico


class ExamenLaboratorio(models.Model):
    ESTADO_CHOICES = [
        ("Pendiente", "Pendiente"),
        ("En Proceso", "En Proceso"),
        ("Completado", "Completado"),
    ]

    id_examen = models.AutoField(primary_key=True)
    id_historial = models.ForeignKey(
        HistorialClinico, on_delete=models.CASCADE, db_column="id_historial",
        related_name="examenes",
    )
    tipo_examen = models.CharField(max_length=100)
    resultado_texto = models.TextField(blank=True, null=True)
    estado_examen = models.CharField(
        max_length=10, choices=ESTADO_CHOICES, default="Pendiente",
    )
    indicaciones_medicas = models.TextField(blank=True, null=True)
    costo_examen = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        managed = False
        db_table = "EXAMEN_LABORATORIO"
        verbose_name = "Examen de laboratorio"
        verbose_name_plural = "Exámenes de laboratorio"

    def __str__(self):
        return f"Examen #{self.id_examen} - {self.tipo_examen} ({self.estado_examen})"
