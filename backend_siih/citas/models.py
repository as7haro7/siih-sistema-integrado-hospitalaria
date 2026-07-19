"""Modelo CITA."""
from django.db import models
from pacientes.models import Paciente
from personal_medico.models import Medico


class Cita(models.Model):
    ESTADO_CHOICES = [
        ("Pendiente", "Pendiente"),
        ("Confirmada", "Confirmada"),
        ("Atendida", "Atendida"),
        ("Cancelada", "Cancelada"),
        ("No Asistio", "No Asistió"),
    ]

    id_cita = models.AutoField(primary_key=True)
    id_paciente = models.ForeignKey(
        Paciente, on_delete=models.CASCADE, db_column="id_paciente",
        related_name="citas",
    )
    id_medico = models.ForeignKey(
        Medico, on_delete=models.CASCADE, db_column="id_medico",
        related_name="citas",
    )
    fecha_cita = models.DateField()
    hora_cita = models.TimeField()
    estado_cita = models.CharField(
        max_length=11, choices=ESTADO_CHOICES, default="Pendiente",
    )

    class Meta:
        managed = False
        db_table = "CITA"
        unique_together = [("id_medico", "fecha_cita", "hora_cita")]
        verbose_name = "Cita"
        verbose_name_plural = "Citas"

    def __str__(self):
        return f"Cita #{self.id_cita} - {self.fecha_cita} {self.hora_cita}"
