from django.contrib import admin
from .models import ConfigImpuesto, Factura, FacturaDetalle, Pago


@admin.register(ConfigImpuesto)
class ConfigImpuestoAdmin(admin.ModelAdmin):
    list_display = ["id_impuesto", "descripcion", "porcentaje"]


@admin.register(Factura)
class FacturaAdmin(admin.ModelAdmin):
    list_display = ["id_factura", "subtotal", "monto_impuesto", "total_pagar", "estado_pago", "fecha_emision"]
    list_filter = ["estado_pago"]


@admin.register(FacturaDetalle)
class FacturaDetalleAdmin(admin.ModelAdmin):
    list_display = ["id_factura_detalle", "id_factura", "concepto", "cantidad", "precio_unitario", "subtotal_linea"]


@admin.register(Pago)
class PagoAdmin(admin.ModelAdmin):
    list_display = ["id_pago", "id_factura", "monto", "metodo_pago", "fecha_pago"]
    list_filter = ["metodo_pago"]
