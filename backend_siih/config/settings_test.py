"""
Settings para ejecución de pruebas.
Hereda de la configuración principal y ajusta lo necesario
para que los tests funcionen con la BD MySQL existente.

Uso:
    python manage.py test --settings=config.settings_test -v 2
"""
from config.settings import *  # noqa: F401, F403


# ─── Test Runner personalizado ──────────────────────────────────────
# Usa la BD existente directamente, sin intentar crear/destruir una BD de test.
# Esto es obligatorio porque las tablas managed=False tienen FKs a auth_user
# y Django no puede resolver el orden de creación en una BD vacía.
TEST_RUNNER = "config.test_runner.ExistingDBTestRunner"

# ─── Ajustes de rendimiento para tests ──────────────────────────────
# Desactivar el hashing lento de contraseñas para tests más rápidos
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]

# Desactivar paginación en tests para simplificar las aserciones
REST_FRAMEWORK["DEFAULT_PAGINATION_CLASS"] = None
REST_FRAMEWORK["PAGE_SIZE"] = None

# Desactivar el browsable API en tests
REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] = (
    "rest_framework.renderers.JSONRenderer",
)
