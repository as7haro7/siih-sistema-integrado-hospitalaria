"""URLs de farmacia."""
from rest_framework.routers import DefaultRouter
from .views import (
    ProveedorViewSet, MedicamentoViewSet, LoteMedicamentoViewSet,
    CompraViewSet, RecetaDetalleViewSet,
)

router = DefaultRouter()
router.register("proveedores", ProveedorViewSet, basename="proveedor")
router.register("medicamentos", MedicamentoViewSet, basename="medicamento")
router.register("lotes-medicamentos", LoteMedicamentoViewSet, basename="lote-medicamento")
router.register("compras", CompraViewSet, basename="compra")
router.register("recetas", RecetaDetalleViewSet, basename="receta")

urlpatterns = router.urls
