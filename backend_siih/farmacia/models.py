"""
Modelos de farmacia: MEDICAMENTO, LOTE_MEDICAMENTO, RECETA_DETALLE,
PROVEEDOR, COMPRA, COMPRA_DETALLE.
"""
from django.db import models
from clinico.models import HistorialClinico


class Proveedor(models.Model):
    id_proveedor = models.AutoField(primary_key=True)
    nombre_proveedor = models.CharField(max_length=150)
    nit_proveedor = models.CharField(max_length=50, blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    direccion = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "PROVEEDOR"
        verbose_name = "Proveedor"
        verbose_name_plural = "Proveedores"

    def __str__(self):
        return self.nombre_proveedor


class Medicamento(models.Model):
    id_medicamento = models.AutoField(primary_key=True)
    nombre_comercial = models.CharField(max_length=150)
    stock_actual = models.IntegerField(default=0)
    stock_minimo = models.IntegerField(default=0)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        managed = False
        db_table = "MEDICAMENTO"
        verbose_name = "Medicamento"
        verbose_name_plural = "Medicamentos"

    def __str__(self):
        return self.nombre_comercial


class Compra(models.Model):
    id_compra = models.AutoField(primary_key=True)
    id_proveedor = models.ForeignKey(
        Proveedor, on_delete=models.PROTECT, db_column="id_proveedor",
        related_name="compras",
    )
    fecha_compra = models.DateField()
    numero_factura_compra = models.CharField(max_length=50, blank=True, null=True)
    total_compra = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        managed = False
        db_table = "COMPRA"
        verbose_name = "Compra"
        verbose_name_plural = "Compras"

    def __str__(self):
        return f"Compra #{self.id_compra} - {self.fecha_compra}"


class LoteMedicamento(models.Model):
    id_lote = models.AutoField(primary_key=True)
    id_medicamento = models.ForeignKey(
        Medicamento, on_delete=models.CASCADE, db_column="id_medicamento",
        related_name="lotes",
    )
    id_compra = models.ForeignKey(
        Compra, on_delete=models.SET_NULL, db_column="id_compra",
        null=True, blank=True, related_name="lotes",
    )
    numero_lote = models.CharField(max_length=50, blank=True, null=True)
    cantidad_inicial = models.IntegerField()
    cantidad_actual = models.IntegerField()
    precio_compra_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_ingreso = models.DateField()
    fecha_vencimiento = models.DateField()

    class Meta:
        managed = False
        db_table = "LOTE_MEDICAMENTO"
        verbose_name = "Lote de medicamento"
        verbose_name_plural = "Lotes de medicamentos"

    def __str__(self):
        return f"Lote {self.numero_lote} - {self.id_medicamento} (disp: {self.cantidad_actual})"


class CompraDetalle(models.Model):
    id_compra_detalle = models.AutoField(primary_key=True)
    id_compra = models.ForeignKey(
        Compra, on_delete=models.CASCADE, db_column="id_compra",
        related_name="detalles",
    )
    id_lote = models.ForeignKey(
        LoteMedicamento, on_delete=models.CASCADE, db_column="id_lote",
        related_name="detalles_compra",
    )
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    # subtotal_linea es columna GENERATED en la BD — solo lectura
    subtotal_linea = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
    )

    class Meta:
        managed = False
        db_table = "COMPRA_DETALLE"
        verbose_name = "Detalle de compra"
        verbose_name_plural = "Detalles de compra"

    def __str__(self):
        return f"Detalle compra #{self.id_compra_detalle}"


class RecetaDetalle(models.Model):
    ESTADO_CHOICES = [
        ("Pendiente", "Pendiente"),
        ("Entregado", "Entregado"),
        ("Sin Stock", "Sin Stock"),
    ]

    id_detalle_receta = models.AutoField(primary_key=True)
    id_historial = models.ForeignKey(
        HistorialClinico, on_delete=models.CASCADE, db_column="id_historial",
        related_name="recetas",
    )
    id_medicamento = models.ForeignKey(
        Medicamento, on_delete=models.CASCADE, db_column="id_medicamento",
        related_name="recetas",
    )
    cantidad_recetada = models.IntegerField()
    dosis = models.CharField(max_length=100, blank=True, null=True)
    frecuencia = models.CharField(max_length=100, blank=True, null=True)
    duracion = models.CharField(max_length=100, blank=True, null=True)
    estado_despacho = models.CharField(
        max_length=9, choices=ESTADO_CHOICES, default="Pendiente",
    )

    class Meta:
        managed = False
        db_table = "RECETA_DETALLE"
        verbose_name = "Detalle de receta"
        verbose_name_plural = "Detalles de receta"

    def __str__(self):
        return f"Receta #{self.id_detalle_receta} - {self.id_medicamento}"
