"""URLs de facturación."""
from rest_framework.routers import DefaultRouter
from .views import ConfigImpuestoViewSet, FacturaViewSet

router = DefaultRouter()
router.register("config-impuesto", ConfigImpuestoViewSet, basename="config-impuesto")
router.register("", FacturaViewSet, basename="factura")

urlpatterns = router.urls
