"""URLs de historial clínico."""
from rest_framework.routers import DefaultRouter
from .views import HistorialClinicoViewSet

router = DefaultRouter()
router.register("", HistorialClinicoViewSet, basename="historial")

urlpatterns = router.urls
