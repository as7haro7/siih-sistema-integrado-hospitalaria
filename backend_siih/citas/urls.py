"""URLs de citas."""
from rest_framework.routers import DefaultRouter
from .views import CitaViewSet

router = DefaultRouter()
router.register("", CitaViewSet, basename="cita")

urlpatterns = router.urls
