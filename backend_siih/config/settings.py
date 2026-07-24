"""
Django settings for SIIH — Sistema Integrado de Información Hospitalaria.
Hospital Universitario San Andrés — UMSA / Inf-266
"""

import os
from pathlib import Path
from datetime import timedelta

import dj_database_url
from dotenv import load_dotenv

# ─── Paths ──────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent

# Cargar variables de entorno desde backend_siih/.env (desarrollo local)
load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.environ.get(
    "DJANGO_SECRET_KEY",
    "super_secreto_erick",
)

DEBUG = os.environ.get("DJANGO_DEBUG", "True").lower() in ("true", "1", "yes")

ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")

# ─── Applications ──────────────────────────────────────────────────
INSTALLED_APPS = [
    # Django built-in
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "django_filters",
    "drf_spectacular",
    # Project apps
    "accounts",
    "pacientes",
    "personal_medico",
    "citas",
    "emergencias",
    "hospitalizacion",
    "clinico",
    "laboratorio",
    "farmacia",
    "facturacion",
    "auditoria",
    "reportes",
]

# ─── Middleware ─────────────────────────────────────────────────────
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",          # Serve static on Render
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# ─── Database ──────────────────────────────────────────────────────
# Producción (Aiven): usa DATABASE_URL si existe.
# Desarrollo local: usa la config MySQL local.
_DATABASE_URL = os.environ.get("DATABASE_URL")

if _DATABASE_URL:
    # Limpiar "ssl-mode" de la URL antes de parsear (Aiven lo incluye pero
    # mysqlclient no lo reconoce con guion; espera "ssl_mode" con guion bajo).
    import re
    _clean_url = re.sub(r'[?&]ssl-mode=[^&]*', '', _DATABASE_URL)

    # Parsear la URL limpia con dj-database-url
    _db_config = dj_database_url.config(
        default=_clean_url,
        conn_max_age=600,
    )
    # Limpiar cualquier residuo de ssl-mode en el config y OPTIONS
    _db_config.pop("ssl-mode", None)
    _db_config.setdefault("OPTIONS", {})
    _db_config["OPTIONS"].pop("ssl-mode", None)
    _db_config["OPTIONS"]["ssl_mode"] = "REQUIRED"
    _db_config["OPTIONS"]["charset"] = "utf8mb4"
    DATABASES = {"default": _db_config}
    _db_host = _db_config.get("HOST", "desconocido")
    print(f"\n[NUBE] SIIH Backend: Conectado a BD en la NUBE (Aiven) -> {_db_host}\n")
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.mysql",
            "NAME": os.environ.get("DB_NAME", "db_clinica_siih"),
            "USER": os.environ.get("DB_USER", "root"),
            "PASSWORD": os.environ.get("DB_PASSWORD", "123456"),
            "HOST": os.environ.get("DB_HOST", "localhost"),
            "PORT": os.environ.get("DB_PORT", "3306"),
            "OPTIONS": {
                "charset": "utf8mb4",
                "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
            },
        }
    }
    print(f"\n[LOCAL] SIIH Backend: Conectado a BD LOCAL -> {DATABASES['default']['HOST']}:{DATABASES['default']['PORT']}\n")

# ─── Password validation ──────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ─── i18n ──────────────────────────────────────────────────────────
LANGUAGE_CODE = "es-bo"
TIME_ZONE = "America/La_Paz"
USE_I18N = True
USE_TZ = True

# ─── Static files ─────────────────────────────────────────────────
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# ─── Default PK ───────────────────────────────────────────────────
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ─── Django REST Framework ────────────────────────────────────────
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_RENDERER_CLASSES": (
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ),
}

# ─── SimpleJWT ────────────────────────────────────────────────────
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(hours=24),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# ─── CORS & CSRF ──────────────────────────────────────────────────
# Mantiene la flexibilidad para desarrollo local o variables de entorno
DEFAULT_ALLOWED_ORIGINS = (
    "http://localhost:3000,"
    "http://localhost:5173,"
    "https://siih-sistema-integrado-hospitalaria.vercel.app"
)

CORS_ALLOW_ALL_ORIGINS = True

CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get("CORS_ALLOWED_ORIGINS", DEFAULT_ALLOWED_ORIGINS).split(",")
    if origin.strip()
]

CSRF_TRUSTED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get("CSRF_TRUSTED_ORIGINS", DEFAULT_ALLOWED_ORIGINS).split(",")
    if origin.strip()
]

# ─── drf-spectacular Settings ──────────────────────────────────────
SPECTACULAR_SETTINGS = {
    "TITLE": "SIIH API",
    "DESCRIPTION": "API del Sistema Integrado de Información Hospitalaria (SIIH)",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "COMPONENT_SPLIT_REQUEST": True,
}

# ─── Custom Test Runner ───────────────────────────────────────────
TEST_RUNNER = "config.test_runner.ExistingDBTestRunner"
