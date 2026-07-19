"""URLs de laboratorio."""
from rest_framework.routers import DefaultRouter
from .views import ExamenLaboratorioViewSet

router = DefaultRouter()
router.register("", ExamenLaboratorioViewSet, basename="examen")

urlpatterns = router.urls
