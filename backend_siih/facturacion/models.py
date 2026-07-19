"""Modelos: CONFIG_IMPUESTO, FACTURA, FACTURA_DETALLE, PAGO."""
from django.db import models
from clinico.models import HistorialClinico
from hospitalizacion.models import Hospitalizacion


class ConfigImpuesto(models.Model):
    id_impuesto = models.AutoField(primary_key=True)
    descripcion = models.CharField(max_length=100)
    porcentaje = models.DecimalField(max_digits=5, decimal_places=2)

    class Meta:
        managed = False
        db_table = "CONFIG_IMPUESTO"
        verbose_name = "Configuración de impuesto"
        verbose_name_plural = "Configuraciones de impuesto"

    def __str__(self):
        return f"{self.descripcion} ({self.porcentaje}%)"


class Factura(models.Model):
    ESTADO_PAGO_CHOICES = [
        ("Pendiente", "Pendiente"),
        ("Parcial", "Parcial"),
        ("Pagado", "Pagado"),
        ("Anulado", "Anulado"),
    ]

    id_factura = models.AutoField(primary_key=True)
    id_historial = models.ForeignKey(
        HistorialClinico, on_delete=models.SET_NULL, db_column="id_historial",
        null=True, blank=True, related_name="facturas",
    )
    id_hospitalizacion = models.ForeignKey(
        Hospitalizacion, on_delete=models.SET_NULL, db_column="id_hospitalizacion",
        null=True, blank=True, related_name="facturas",
    )
    id_impuesto = models.ForeignKey(
        ConfigImpuesto, on_delete=models.PROTECT, db_column="id_impuesto",
        related_name="facturas",
    )
    nit_factura = models.CharField(max_length=50, blank=True, null=True)
    razon_social = models.CharField(max_length=150, blank=True, null=True)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    monto_impuesto = models.DecimalField(max_digits=10, decimal_places=2)
    # total_pagar es columna GENERATED — solo lectura
    total_pagar = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
    )
    estado_pago = models.CharField(
        max_length=10, choices=ESTADO_PAGO_CHOICES, default="Pendiente",
    )
    fecha_emision = models.DateTimeField(auto_now_add=True)
    cajero_responsable = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "FACTURA"
        verbose_name = "Factura"
        verbose_name_plural = "Facturas"

    def __str__(self):
        return f"Factura #{self.id_factura} - {self.estado_pago}"


class FacturaDetalle(models.Model):
    id_factura_detalle = models.AutoField(primary_key=True)
    id_factura = models.ForeignKey(
        Factura, on_delete=models.CASCADE, db_column="id_factura",
        related_name="detalles",
    )
    concepto = models.CharField(max_length=255)
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    # subtotal_linea es columna GENERATED — solo lectura
    subtotal_linea = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
    )

    class Meta:
        managed = False
        db_table = "FACTURA_DETALLE"
        verbose_name = "Detalle de factura"
        verbose_name_plural = "Detalles de factura"

    def __str__(self):
        return f"Detalle #{self.id_factura_detalle} - {self.concepto}"


class Pago(models.Model):
    METODO_PAGO_CHOICES = [
        ("Efectivo", "Efectivo"),
        ("Tarjeta", "Tarjeta"),
        ("Transferencia", "Transferencia"),
        ("Seguro", "Seguro"),
    ]

    id_pago = models.AutoField(primary_key=True)
    id_factura = models.ForeignKey(
        Factura, on_delete=models.CASCADE, db_column="id_factura",
        related_name="pagos",
    )
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    metodo_pago = models.CharField(max_length=14, choices=METODO_PAGO_CHOICES)
    fecha_pago = models.DateTimeField(auto_now_add=True)
    cajero_responsable = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "PAGO"
        verbose_name = "Pago"
        verbose_name_plural = "Pagos"

    def __str__(self):
        return f"Pago #{self.id_pago} - Bs {self.monto}"
