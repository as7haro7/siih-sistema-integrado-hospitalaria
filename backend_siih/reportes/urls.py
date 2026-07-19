"""URLs de reportes."""
from django.urls import path
from . import views

urlpatterns = [
    path(
        "pacientes-por-especialidad/",
        views.pacientes_por_especialidad,
        name="reporte-pacientes-especialidad",
    ),
    path(
        "consumo-medicamentos/",
        views.consumo_medicamentos,
        name="reporte-consumo-medicamentos",
    ),
    path(
        "ingresos/",
        views.ingresos,
        name="reporte-ingresos",
    ),
]
