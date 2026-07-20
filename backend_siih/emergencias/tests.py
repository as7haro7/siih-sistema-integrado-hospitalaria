"""
Tests para emergencias: CRUD con triage.
"""
from rest_framework import status
from accounts.tests import BaseTestCase
from pacientes.models import Paciente
from personal_medico.models import Especialidad, Medico


class EmergenciaCRUDTests(BaseTestCase):
    """Pruebas del endpoint /api/v1/emergencias/."""

    def setUp(self):
        super().setUp()
        self.esp = Especialidad.objects.create(nombre_especialidad="Urgencias Test")
        self.med = Medico.objects.create(
            nombre_medico="Dr. Guardia", id_especialidad=self.esp,
        )
        self.pac = Paciente.objects.create(nombre="Pac", apellido="Urgente")

    def test_recepcionista_puede_crear_emergencia(self):
        self._create_and_auth("recep_emer", roles=["Recepcionista"])
        resp = self.client.post("/api/v1/emergencias/", {
            "id_paciente": self.pac.id_paciente,
            "id_medico_guardia": self.med.id_medico,
            "fecha_hora_ingreso": "2026-08-01T14:30:00",
            "nivel_triage": "Rojo",
            "descripcion_urgencia": "Dolor torácico severo",
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["nivel_triage"], "Rojo")

    def test_medico_puede_crear_emergencia(self):
        self._create_and_auth("med_emer", roles=["Médico"])
        resp = self.client.post("/api/v1/emergencias/", {
            "id_paciente": self.pac.id_paciente,
            "id_medico_guardia": self.med.id_medico,
            "fecha_hora_ingreso": "2026-08-01T15:00:00",
            "nivel_triage": "Amarillo",
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_medico_puede_listar_emergencias(self):
        self._create_and_auth("med_emer_list", roles=["Médico"])
        resp = self.client.get("/api/v1/emergencias/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_cajero_no_puede_acceder(self):
        self._create_and_auth("caj_emer", roles=["Cajero"])
        resp = self.client.get("/api/v1/emergencias/")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
