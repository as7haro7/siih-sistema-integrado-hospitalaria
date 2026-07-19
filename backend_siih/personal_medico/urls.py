"""URLs de personal médico: especialidades, médicos y horarios."""
from rest_framework.routers import DefaultRouter
from .views import EspecialidadViewSet, MedicoViewSet, HorarioMedicoViewSet

router = DefaultRouter()
router.register("especialidades", EspecialidadViewSet, basename="especialidad")
router.register("medicos", MedicoViewSet, basename="medico")
router.register("horarios-medicos", HorarioMedicoViewSet, basename="horario-medico")

urlpatterns = router.urls
