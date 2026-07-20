"""
Tests para reportes: acceso, formato JSON y exportación.
"""
from rest_framework import status
from accounts.tests import BaseTestCase


class ReportePacientesPorEspecialidadTests(BaseTestCase):
    """Pruebas del endpoint /api/v1/reportes/pacientes-por-especialidad/."""

    def test_director_puede_acceder(self):
        self._create_and_auth("dir_rep1", roles=["Director"])
        resp = self.client.get("/api/v1/reportes/pacientes-por-especialidad/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("reporte", resp.data)
        self.assertIn("datos", resp.data)

    def test_admin_puede_acceder(self):
        self._create_and_auth("admin_rep1", roles=["Administrador"])
        resp = self.client.get("/api/v1/reportes/pacientes-por-especialidad/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_medico_no_puede_acceder(self):
        self._create_and_auth("med_rep1", roles=["Médico"])
        resp = self.client.get("/api/v1/reportes/pacientes-por-especialidad/")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_exportar_csv(self):
        self._create_and_auth("dir_csv", roles=["Director"])
        resp = self.client.get(
            "/api/v1/reportes/pacientes-por-especialidad/?formato=csv",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("text/csv", resp["Content-Type"])

    def test_exportar_excel(self):
        self._create_and_auth("dir_excel", roles=["Director"])
        resp = self.client.get(
            "/api/v1/reportes/pacientes-por-especialidad/?formato=excel",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("spreadsheetml", resp["Content-Type"])


class ReporteConsumoMedicamentosTests(BaseTestCase):
    """Pruebas del endpoint /api/v1/reportes/consumo-medicamentos/."""

    def test_director_puede_acceder(self):
        self._create_and_auth("dir_rep2", roles=["Director"])
        resp = self.client.get("/api/v1/reportes/consumo-medicamentos/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_farmaceutico_no_puede_acceder(self):
        self._create_and_auth("farm_rep2", roles=["Farmacéutico"])
        resp = self.client.get("/api/v1/reportes/consumo-medicamentos/")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_con_filtro_de_fechas(self):
        self._create_and_auth("dir_fecha", roles=["Director"])
        resp = self.client.get(
            "/api/v1/reportes/consumo-medicamentos/"
            "?fecha_inicio=2026-01-01&fecha_fin=2026-12-31",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)


class ReporteIngresosTests(BaseTestCase):
    """Pruebas del endpoint /api/v1/reportes/ingresos/."""

    def test_director_puede_acceder(self):
        self._create_and_auth("dir_rep3", roles=["Director"])
        resp = self.client.get("/api/v1/reportes/ingresos/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("resumen", resp.data)

    def test_cajero_no_puede_acceder(self):
        self._create_and_auth("caj_rep3", roles=["Cajero"])
        resp = self.client.get("/api/v1/reportes/ingresos/")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_exportar_excel(self):
        self._create_and_auth("dir_excel3", roles=["Director"])
        resp = self.client.get("/api/v1/reportes/ingresos/?formato=excel")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
