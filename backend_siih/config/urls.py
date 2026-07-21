"""
URL configuration for SIIH project.
Todas las rutas de API bajo /api/v1/.
"""
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    # Django Admin
    path("admin/", admin.site.urls),

    # Rutas OpenAPI y Swagger
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),

    # ── API v1 ─────────────────────────────────────────────────────
    path("api/v1/auth/", include("accounts.urls_auth")),
    path("api/v1/usuarios/", include("accounts.urls_users")),
    path("api/v1/pacientes/", include("pacientes.urls")),
    path("api/v1/", include("personal_medico.urls")),
    path("api/v1/citas/", include("citas.urls")),
    path("api/v1/emergencias/", include("emergencias.urls")),
    path("api/v1/", include("hospitalizacion.urls")),
    path("api/v1/", include("clinico.urls")),
    path("api/v1/examenes/", include("laboratorio.urls")),
    path("api/v1/", include("farmacia.urls")),
    path("api/v1/facturas/", include("facturacion.urls")),
    path("api/v1/auditoria/", include("auditoria.urls")),
    path("api/v1/reportes/", include("reportes.urls")),
]
