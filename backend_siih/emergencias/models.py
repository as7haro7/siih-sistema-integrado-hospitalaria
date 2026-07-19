"""Modelo EMERGENCIA."""
from django.db import models
from pacientes.models import Paciente
from personal_medico.models import Medico


class Emergencia(models.Model):
    NIVEL_TRIAGE_CHOICES = [
        ("Rojo", "Rojo"),
        ("Naranja", "Naranja"),
        ("Amarillo", "Amarillo"),
        ("Verde", "Verde"),
        ("Azul", "Azul"),
    ]

    id_emergencia = models.AutoField(primary_key=True)
    id_paciente = models.ForeignKey(
        Paciente, on_delete=models.CASCADE, db_column="id_paciente",
        related_name="emergencias",
    )
    id_medico_guardia = models.ForeignKey(
        Medico, on_delete=models.CASCADE, db_column="id_medico_guardia",
        related_name="emergencias_atendidas",
    )
    fecha_hora_ingreso = models.DateTimeField()
    nivel_triage = models.CharField(max_length=8, choices=NIVEL_TRIAGE_CHOICES)
    descripcion_urgencia = models.TextField(blank=True, null=True)
    destino_paciente = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "EMERGENCIA"
        verbose_name = "Emergencia"
        verbose_name_plural = "Emergencias"

    def __str__(self):
        return f"Emergencia #{self.id_emergencia} - {self.nivel_triage}"
