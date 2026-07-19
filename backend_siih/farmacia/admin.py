from django.contrib import admin
from .models import (
    Proveedor, Medicamento, LoteMedicamento,
    Compra, CompraDetalle, RecetaDetalle,
)


@admin.register(Proveedor)
class ProveedorAdmin(admin.ModelAdmin):
    list_display = ["id_proveedor", "nombre_proveedor", "nit_proveedor", "telefono"]
    search_fields = ["nombre_proveedor"]


@admin.register(Medicamento)
class MedicamentoAdmin(admin.ModelAdmin):
    list_display = ["id_medicamento", "nombre_comercial", "stock_actual", "stock_minimo", "precio_unitario"]
    search_fields = ["nombre_comercial"]


@admin.register(LoteMedicamento)
class LoteMedicamentoAdmin(admin.ModelAdmin):
    list_display = ["id_lote", "id_medicamento", "numero_lote", "cantidad_actual", "fecha_vencimiento"]
    list_filter = ["fecha_vencimiento"]


@admin.register(Compra)
class CompraAdmin(admin.ModelAdmin):
    list_display = ["id_compra", "id_proveedor", "fecha_compra", "total_compra"]


@admin.register(CompraDetalle)
class CompraDetalleAdmin(admin.ModelAdmin):
    list_display = ["id_compra_detalle", "id_compra", "id_lote", "cantidad", "precio_unitario"]


@admin.register(RecetaDetalle)
class RecetaDetalleAdmin(admin.ModelAdmin):
    list_display = ["id_detalle_receta", "id_historial", "id_medicamento", "cantidad_recetada", "estado_despacho"]
    list_filter = ["estado_despacho"]
