"""
Modelos: ESPECIALIDAD, MEDICO, HORARIO_MEDICO.
"""
from django.db import models


class Especialidad(models.Model):
    id_especialidad = models.AutoField(primary_key=True)
    nombre_especialidad = models.CharField(max_length=100, unique=True)

    class Meta:
        managed = False
        db_table = "ESPECIALIDAD"
        verbose_name = "Especialidad"
        verbose_name_plural = "Especialidades"

    def __str__(self):
        return self.nombre_especialidad


class Medico(models.Model):
    id_medico = models.AutoField(primary_key=True)
    nombre_medico = models.CharField(max_length=150)
    id_especialidad = models.ForeignKey(
        Especialidad, on_delete=models.PROTECT, db_column="id_especialidad",
        related_name="medicos",
    )
    telefono = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "MEDICO"
        verbose_name = "Médico"
        verbose_name_plural = "Médicos"

    def __str__(self):
        return self.nombre_medico


class HorarioMedico(models.Model):
    DIA_SEMANA_CHOICES = [
        ("Lunes", "Lunes"),
        ("Martes", "Martes"),
        ("Miercoles", "Miércoles"),
        ("Jueves", "Jueves"),
        ("Viernes", "Viernes"),
        ("Sabado", "Sábado"),
        ("Domingo", "Domingo"),
    ]
    ESTADO_TURNO_CHOICES = [
        ("Activo", "Activo"),
        ("Inactivo", "Inactivo"),
    ]

    id_horario = models.AutoField(primary_key=True)
    id_medico = models.ForeignKey(
        Medico, on_delete=models.CASCADE, db_column="id_medico",
        related_name="horarios",
    )
    dia_semana = models.CharField(max_length=9, choices=DIA_SEMANA_CHOICES)
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    estado_turno = models.CharField(
        max_length=8, choices=ESTADO_TURNO_CHOICES, default="Activo",
    )

    class Meta:
        managed = False
        db_table = "HORARIO_MEDICO"
        verbose_name = "Horario médico"
        verbose_name_plural = "Horarios médicos"

    def __str__(self):
        return f"{self.id_medico} - {self.dia_semana} {self.hora_inicio}-{self.hora_fin}"
