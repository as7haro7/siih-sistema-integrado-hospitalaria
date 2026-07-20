"""
Test runner personalizado que reutiliza la BD existente de desarrollo.

Necesario porque la BD tiene tablas managed=False con FKs a auth_user.
Django no puede crear estas tablas en una BD de test vacía, por lo que
usamos directamente la BD de desarrollo envuelta en transacciones que
se deshacen al final de cada test (TransactionTestCase / TestCase).
"""
from django.test.runner import DiscoverRunner


class ExistingDBTestRunner(DiscoverRunner):
    """
    Test runner que no crea ni destruye la base de datos de test.
    Utiliza la BD existente configurada en DATABASES['default'].
    """

    def setup_databases(self, **kwargs):
        """No crear BD: usamos la existente."""
        # Retornar lista vacía indica que no hay BDs que restaurar después
        return []

    def teardown_databases(self, old_config, **kwargs):
        """No destruir BD: la dejamos intacta."""
        pass
