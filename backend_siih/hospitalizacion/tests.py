"""
Tests para hospitalización: tarifas, camas, hospitalizaciones y alta.
"""
from rest_framework import status
from accounts.tests import BaseTestCase
from pacientes.models import Paciente
from personal_medico.models import Especialidad, Medico
from hospitalizacion.models import TarifaHabitacion, Cama, Hospitalizacion


class TarifaHabitacionTests(BaseTestCase):
    """Pruebas del endpoint /api/v1/tarifas-habitacion/."""

    def test_admin_puede_crear_tarifa(self):
        self._create_and_auth("admin_tarifa", roles=["Administrador"])
        resp = self.client.post("/api/v1/tarifas-habitacion/", {
            "tipo_habitacion": "Suite Premium",
            "costo_por_dia": "500.00",
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_medico_puede_listar_tarifas(self):
        self._create_and_auth("med_tarifa", roles=["Médico"])
        resp = self.client.get("/api/v1/tarifas-habitacion/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_medico_no_puede_crear_tarifa(self):
        self._create_and_auth("med_tarifa_c", roles=["Médico"])
        resp = self.client.post("/api/v1/tarifas-habitacion/", {
            "tipo_habitacion": "No Autorizada",
            "costo_por_dia": "100.00",
        })
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)


class CamaTests(BaseTestCase):
    """Pruebas del endpoint /api/v1/camas/."""

    def _create_tarifa(self):
        return TarifaHabitacion.objects.create(
            tipo_habitacion="General Test", costo_por_dia=150.00,
        )

    def test_admin_puede_crear_cama(self):
        self._create_and_auth("admin_cama", roles=["Administrador"])
        tarifa = self._create_tarifa()
        resp = self.client.post("/api/v1/camas/", {
            "nro_habitacion": "101",
            "nro_cama": "A",
            "id_tarifa": tarifa.id_tarifa,
            "estado_cama": "Disponible",
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_listar_camas_disponibles(self):
        self._create_and_auth("med_disp", roles=["Médico"])
        tarifa = self._create_tarifa()
        Cama.objects.create(
            nro_habitacion="200", nro_cama="B",
            id_tarifa=tarifa, estado_cama="Disponible",
        )
        Cama.objects.create(
            nro_habitacion="200", nro_cama="C",
            id_tarifa=tarifa, estado_cama="Ocupada",
        )
        resp = self.client.get("/api/v1/camas/disponibles/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        # Todas las camas devueltas deben ser Disponible
        for cama in resp.data:
            self.assertEqual(cama["estado_cama"], "Disponible")


class HospitalizacionTests(BaseTestCase):
    """Pruebas del endpoint /api/v1/hospitalizaciones/."""

    def _setup_hospitalizacion_data(self):
        esp = Especialidad.objects.create(nombre_especialidad="Cirugía Hosp")
        med = Medico.objects.create(nombre_medico="Dr. Hosp", id_especialidad=esp)
        pac = Paciente.objects.create(nombre="Pac", apellido="Hosp")
        tarifa = TarifaHabitacion.objects.create(
            tipo_habitacion="Doble Hosp", costo_por_dia=200.00,
        )
        cama = Cama.objects.create(
            nro_habitacion="300", nro_cama="A",
            id_tarifa=tarifa, estado_cama="Disponible",
        )
        return med, pac, cama

    def test_medico_puede_crear_hospitalizacion(self):
        self._create_and_auth("med_hosp", roles=["Médico"])
        med, pac, cama = self._setup_hospitalizacion_data()
        resp = self.client.post("/api/v1/hospitalizaciones/", {
            "id_paciente": pac.id_paciente,
            "id_medico_responsable": med.id_medico,
            "id_cama": cama.id_cama,
            "fecha_ingreso": "2026-08-01T10:00:00",
            "diagnostico_ingreso": "Apendicitis aguda",
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_medico_puede_dar_alta(self):
        self._create_and_auth("med_alta", roles=["Médico"])
        med, pac, cama = self._setup_hospitalizacion_data()
        hosp = Hospitalizacion.objects.create(
            id_paciente=pac,
            id_medico_responsable=med,
            id_cama=cama,
            fecha_ingreso="2026-08-01T10:00:00",
            estado_internacion="Activo",
        )
        resp = self.client.post(f"/api/v1/hospitalizaciones/{hosp.id_hospitalizacion}/alta/", {})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_alta_hospitalizacion_ya_dada_de_alta(self):
        """Dar de alta una hospitalización que ya no está activa devuelve 409."""
        self._create_and_auth("med_alta2", roles=["Médico"])
        med, pac, cama = self._setup_hospitalizacion_data()
        hosp = Hospitalizacion.objects.create(
            id_paciente=pac,
            id_medico_responsable=med,
            id_cama=cama,
            fecha_ingreso="2026-08-01T10:00:00",
            estado_internacion="Alta",
        )
        resp = self.client.post(f"/api/v1/hospitalizaciones/{hosp.id_hospitalizacion}/alta/", {})
        self.assertEqual(resp.status_code, status.HTTP_409_CONFLICT)

    def test_medico_puede_listar_hospitalizaciones(self):
        self._create_and_auth("med_hosp_list", roles=["Médico"])
        resp = self.client.get("/api/v1/hospitalizaciones/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
