from django.contrib import admin
from .models import TarifaHabitacion, Cama, Hospitalizacion


@admin.register(TarifaHabitacion)
class TarifaHabitacionAdmin(admin.ModelAdmin):
    list_display = ["id_tarifa", "tipo_habitacion", "costo_por_dia"]


@admin.register(Cama)
class CamaAdmin(admin.ModelAdmin):
    list_display = ["id_cama", "nro_habitacion", "nro_cama", "estado_cama"]
    list_filter = ["estado_cama"]


@admin.register(Hospitalizacion)
class HospitalizacionAdmin(admin.ModelAdmin):
    list_display = [
        "id_hospitalizacion", "id_paciente", "id_medico_responsable",
        "id_cama", "fecha_ingreso", "fecha_egreso", "estado_internacion",
    ]
    list_filter = ["estado_internacion"]
