"""URLs de auditoría."""
from rest_framework.routers import DefaultRouter
from .views import AuditoriaSistemaViewSet

router = DefaultRouter()
router.register("", AuditoriaSistemaViewSet, basename="auditoria")

urlpatterns = router.urls
