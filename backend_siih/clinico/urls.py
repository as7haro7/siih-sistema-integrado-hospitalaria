"""URLs de historial clínico y catálogo CIE-10."""
from rest_framework.routers import DefaultRouter
from .views import HistorialClinicoViewSet, CatalogoCIE10ViewSet

router = DefaultRouter()
router.register("historiales", HistorialClinicoViewSet, basename="historial")
router.register("catalogo-cie10", CatalogoCIE10ViewSet, basename="catalogo-cie10")

urlpatterns = router.urls
