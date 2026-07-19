"""URLs de emergencias."""
from rest_framework.routers import DefaultRouter
from .views import EmergenciaViewSet

router = DefaultRouter()
router.register("", EmergenciaViewSet, basename="emergencia")

urlpatterns = router.urls
