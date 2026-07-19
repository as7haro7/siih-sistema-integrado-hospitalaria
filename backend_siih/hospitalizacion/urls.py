"""URLs de hospitalización."""
from rest_framework.routers import DefaultRouter
from .views import TarifaHabitacionViewSet, CamaViewSet, HospitalizacionViewSet

router = DefaultRouter()
router.register("tarifas-habitacion", TarifaHabitacionViewSet, basename="tarifa-habitacion")
router.register("camas", CamaViewSet, basename="cama")
router.register("hospitalizaciones", HospitalizacionViewSet, basename="hospitalizacion")

urlpatterns = router.urls
