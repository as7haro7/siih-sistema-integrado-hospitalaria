"""
Modelos que mapean las tablas PACIENTE y REGISTRO_BAJA
del esquema db_clinica_siih.  managed = False.
"""
from django.db import models


class Paciente(models.Model):
    id_paciente = models.AutoField(primary_key=True)
    cedula_paciente = models.CharField(
        max_length=20, unique=True, null=True, blank=True,
    )
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    direccion = models.CharField(max_length=255, blank=True, null=True)
    seguro_medico = models.CharField(max_length=100, blank=True, null=True)
    alergias = models.TextField(blank=True, null=True)
    estado_baja = models.CharField(
        max_length=6,
        choices=[("Activo", "Activo"), ("Baja", "Baja")],
        default="Activo",
    )

    class Meta:
        managed = False
        db_table = "PACIENTE"
        verbose_name = "Paciente"
        verbose_name_plural = "Pacientes"

    def __str__(self):
        return f"{self.nombre} {self.apellido}"


class RegistroBaja(models.Model):
    id_baja = models.AutoField(primary_key=True)
    id_paciente = models.ForeignKey(
        Paciente, on_delete=models.CASCADE, db_column="id_paciente",
        related_name="bajas",
    )
    fecha_baja = models.DateTimeField(auto_now_add=True)
    motivo_baja = models.TextField(blank=True, null=True)
    usuario_autoriza = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = "REGISTRO_BAJA"
        verbose_name = "Registro de baja"
        verbose_name_plural = "Registros de baja"

    def __str__(self):
        return f"Baja #{self.id_baja} - Paciente {self.id_paciente}"
