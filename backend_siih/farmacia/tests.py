"""
Tests para farmacia: medicamentos, proveedores, lotes, compras,
alertas de stock y despacho de recetas.
"""
from rest_framework import status
from accounts.tests import BaseTestCase
from farmacia.models import Medicamento, Proveedor


class ProveedorTests(BaseTestCase):
    """Pruebas del endpoint /api/v1/proveedores/."""

    def test_farmaceutico_puede_crear_proveedor(self):
        self._create_and_auth("farm_prov", roles=["Farmacéutico"])
        resp = self.client.post("/api/v1/proveedores/", {
            "nombre_proveedor": "Pharma Bolivia SA",
            "nit_proveedor": "123456789",
            "telefono": "22223333",
            "direccion": "Av. Principal 100",
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_farmaceutico_puede_listar_proveedores(self):
        self._create_and_auth("farm_prov_list", roles=["Farmacéutico"])
        resp = self.client.get("/api/v1/proveedores/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)


class MedicamentoTests(BaseTestCase):
    """Pruebas del endpoint /api/v1/medicamentos/."""

    def test_farmaceutico_puede_crear_medicamento(self):
        self._create_and_auth("farm_med", roles=["Farmacéutico"])
        resp = self.client.post("/api/v1/medicamentos/", {
            "nombre_comercial": "Paracetamol 500mg",
            "stock_actual": 200,
            "stock_minimo": 50,
            "precio_unitario": "3.50",
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_alertas_stock_bajo(self):
        """GET /api/v1/medicamentos/alertas/ devuelve medicamentos con stock bajo."""
        self._create_and_auth("farm_alerta", roles=["Farmacéutico"])
        Medicamento.objects.create(
            nombre_comercial="Bajo Stock",
            stock_actual=5,
            stock_minimo=10,
            precio_unitario=10.00,
        )
        Medicamento.objects.create(
            nombre_comercial="Stock Normal",
            stock_actual=100,
            stock_minimo=10,
            precio_unitario=10.00,
        )
        resp = self.client.get("/api/v1/medicamentos/alertas/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("stock_bajo", resp.data)
        # Al menos "Bajo Stock" debe aparecer
        nombres = [m["nombre_comercial"] for m in resp.data["stock_bajo"]]
        self.assertIn("Bajo Stock", nombres)

    def test_medico_no_puede_crear_medicamento(self):
        self._create_and_auth("med_med", roles=["Médico"])
        resp = self.client.post("/api/v1/medicamentos/", {
            "nombre_comercial": "No Autorizado",
            "stock_actual": 10,
            "stock_minimo": 5,
            "precio_unitario": "2.00",
        })
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)


class CompraTests(BaseTestCase):
    """Pruebas del endpoint /api/v1/compras/."""

    def test_farmaceutico_puede_crear_compra_atomica(self):
        """POST /api/v1/compras/ crea compra + lote + detalle en una transacción."""
        self._create_and_auth("farm_compra", roles=["Farmacéutico"])
        prov = Proveedor.objects.create(nombre_proveedor="Proveedor Test")
        med = Medicamento.objects.create(
            nombre_comercial="Amoxicilina Test",
            stock_actual=0,
            stock_minimo=20,
            precio_unitario=8.00,
        )
        resp = self.client.post("/api/v1/compras/", {
            "id_proveedor": prov.id_proveedor,
            "id_medicamento": med.id_medicamento,
            "fecha_compra": "2026-08-01",
            "numero_factura_compra": "F-001",
            "numero_lote": "LOT-001",
            "cantidad": 100,
            "precio_compra_unitario": "7.50",
            "fecha_vencimiento": "2028-08-01",
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)


class RecetaDespachoTests(BaseTestCase):
    """Pruebas del endpoint /api/v1/recetas/."""

    def test_farmaceutico_puede_listar_recetas(self):
        self._create_and_auth("farm_rec", roles=["Farmacéutico"])
        resp = self.client.get("/api/v1/recetas/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_farmaceutico_puede_ver_pendientes(self):
        self._create_and_auth("farm_pend", roles=["Farmacéutico"])
        resp = self.client.get("/api/v1/recetas/pendientes/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
