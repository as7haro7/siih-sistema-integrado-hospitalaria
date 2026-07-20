"""
Tests para facturación: config impuesto, facturas, consolidación y pagos.
"""
from rest_framework import status
from accounts.tests import BaseTestCase
from facturacion.models import ConfigImpuesto, Factura


class ConfigImpuestoTests(BaseTestCase):
    """Pruebas del endpoint /api/v1/facturas/config-impuesto/."""

    def test_admin_puede_crear_impuesto(self):
        self._create_and_auth("admin_imp", roles=["Administrador"])
        resp = self.client.post("/api/v1/facturas/config-impuesto/", {
            "descripcion": "IVA 13%",
            "porcentaje": "13.00",
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_cajero_puede_listar_impuestos(self):
        self._create_and_auth("caj_imp", roles=["Cajero"])
        resp = self.client.get("/api/v1/facturas/config-impuesto/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_medico_no_puede_acceder_impuestos(self):
        self._create_and_auth("med_imp", roles=["Médico"])
        resp = self.client.get("/api/v1/facturas/config-impuesto/")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)


class FacturaCRUDTests(BaseTestCase):
    """Pruebas del endpoint /api/v1/facturas/."""

    def _create_impuesto(self):
        return ConfigImpuesto.objects.create(
            descripcion="IVA Test", porcentaje=13.00,
        )

    def test_cajero_puede_listar_facturas(self):
        self._create_and_auth("caj_fact", roles=["Cajero"])
        resp = self.client.get("/api/v1/facturas/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_cajero_puede_crear_factura(self):
        self._create_and_auth("caj_fact_c", roles=["Cajero"])
        imp = self._create_impuesto()
        resp = self.client.post("/api/v1/facturas/", {
            "id_impuesto": imp.id_impuesto,
            "nit_factura": "9876543",
            "razon_social": "Test S.R.L.",
            "subtotal": "1000.00",
            "monto_impuesto": "130.00",
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_medico_no_puede_crear_factura(self):
        self._create_and_auth("med_fact", roles=["Médico"])
        imp = self._create_impuesto()
        resp = self.client.post("/api/v1/facturas/", {
            "id_impuesto": imp.id_impuesto,
            "subtotal": "500.00",
            "monto_impuesto": "65.00",
        })
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)


class PagoTests(BaseTestCase):
    """Pruebas del endpoint /api/v1/facturas/{id}/pagos/."""

    def test_cajero_puede_registrar_pago(self):
        self._create_and_auth("caj_pago", roles=["Cajero"])
        imp = ConfigImpuesto.objects.create(
            descripcion="IVA Pago", porcentaje=13.00,
        )
        factura = Factura.objects.create(
            id_impuesto=imp,
            subtotal=1000.00,
            monto_impuesto=130.00,
            estado_pago="Pendiente",
        )
        resp = self.client.post(
            f"/api/v1/facturas/{factura.id_factura}/pagos/",
            {"monto": "500.00", "metodo_pago": "Efectivo"},
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_pago_factura_pagada_rechazado(self):
        """Registrar pago en factura ya pagada devuelve 409."""
        self._create_and_auth("caj_pago2", roles=["Cajero"])
        imp = ConfigImpuesto.objects.create(
            descripcion="IVA Pago2", porcentaje=13.00,
        )
        factura = Factura.objects.create(
            id_impuesto=imp,
            subtotal=500.00,
            monto_impuesto=65.00,
            estado_pago="Pagado",
        )
        resp = self.client.post(
            f"/api/v1/facturas/{factura.id_factura}/pagos/",
            {"monto": "100.00", "metodo_pago": "Tarjeta"},
        )
        self.assertEqual(resp.status_code, status.HTTP_409_CONFLICT)

    def test_cajero_puede_listar_pagos(self):
        self._create_and_auth("caj_pagos_list", roles=["Cajero"])
        imp = ConfigImpuesto.objects.create(
            descripcion="IVA List", porcentaje=13.00,
        )
        factura = Factura.objects.create(
            id_impuesto=imp,
            subtotal=300.00,
            monto_impuesto=39.00,
            estado_pago="Pendiente",
        )
        resp = self.client.get(f"/api/v1/facturas/{factura.id_factura}/pagos-lista/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
