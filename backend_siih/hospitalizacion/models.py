"""Modelos: TARIFA_HABITACION, CAMA, HOSPITALIZACION."""
from django.db import models
from pacientes.models import Paciente
from personal_medico.models import Medico
from citas.models import Cita
from emergencias.models import Emergencia


class TarifaHabitacion(models.Model):
    id_tarifa = models.AutoField(primary_key=True)
    tipo_habitacion = models.CharField(max_length=100)
    costo_por_dia = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        managed = False
        db_table = "TARIFA_HABITACION"
        verbose_name = "Tarifa de habitación"
        verbose_name_plural = "Tarifas de habitación"

    def __str__(self):
        return f"{self.tipo_habitacion} (Bs {self.costo_por_dia}/día)"


class Cama(models.Model):
    ESTADO_CHOICES = [
        ("Disponible", "Disponible"),
        ("Ocupada", "Ocupada"),
        ("Mantenimiento", "Mantenimiento"),
    ]

    id_cama = models.AutoField(primary_key=True)
    nro_habitacion = models.CharField(max_length=20)
    nro_cama = models.CharField(max_length=20)
    id_tarifa = models.ForeignKey(
        TarifaHabitacion, on_delete=models.PROTECT, db_column="id_tarifa",
        related_name="camas",
    )
    estado_cama = models.CharField(
        max_length=14, choices=ESTADO_CHOICES, default="Disponible",
    )

    class Meta:
        managed = False
        db_table = "CAMA"
        unique_together = [("nro_habitacion", "nro_cama")]
        verbose_name = "Cama"
        verbose_name_plural = "Camas"

    def __str__(self):
        return f"Hab. {self.nro_habitacion} - Cama {self.nro_cama} ({self.estado_cama})"


class Hospitalizacion(models.Model):
    ESTADO_CHOICES = [
        ("Activo", "Activo"),
        ("Alta", "Alta"),
        ("Trasladado", "Trasladado"),
    ]

    id_hospitalizacion = models.AutoField(primary_key=True)
    id_cita = models.ForeignKey(
        Cita, on_delete=models.SET_NULL, db_column="id_cita",
        null=True, blank=True, related_name="hospitalizaciones",
    )
    id_emergencia = models.ForeignKey(
        Emergencia, on_delete=models.SET_NULL, db_column="id_emergencia",
        null=True, blank=True, related_name="hospitalizaciones",
    )
    id_paciente = models.ForeignKey(
        Paciente, on_delete=models.CASCADE, db_column="id_paciente",
        related_name="hospitalizaciones",
    )
    id_medico_responsable = models.ForeignKey(
        Medico, on_delete=models.CASCADE, db_column="id_medico_responsable",
        related_name="hospitalizaciones",
    )
    id_cama = models.ForeignKey(
        Cama, on_delete=models.CASCADE, db_column="id_cama",
        related_name="hospitalizaciones",
    )
    fecha_ingreso = models.DateTimeField()
    fecha_egreso = models.DateTimeField(null=True, blank=True)
    diagnostico_ingreso = models.TextField(blank=True, null=True)
    estado_internacion = models.CharField(
        max_length=10, choices=ESTADO_CHOICES, default="Activo",
    )

    class Meta:
        managed = False
        db_table = "HOSPITALIZACION"
        verbose_name = "Hospitalización"
        verbose_name_plural = "Hospitalizaciones"

    def __str__(self):
        return f"Hosp. #{self.id_hospitalizacion} - {self.id_paciente}"
