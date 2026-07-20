"""
Tests para citas: CRUD y validación de solapamiento.
"""
from rest_framework import status
from accounts.tests import BaseTestCase
from pacientes.models import Paciente
from personal_medico.models import Especialidad, Medico


class CitaCRUDTests(BaseTestCase):
    """Pruebas del endpoint /api/v1/citas/."""

    def setUp(self):
        super().setUp()
        self.esp = Especialidad.objects.create(nombre_especialidad="General Cita")
        self.med = Medico.objects.create(
            nombre_medico="Dr. Cita", id_especialidad=self.esp,
        )
        self.pac = Paciente.objects.create(nombre="Pac", apellido="Cita")

    def test_recepcionista_puede_crear_cita(self):
        self._create_and_auth("recep_cita", roles=["Recepcionista"])
        resp = self.client.post("/api/v1/citas/", {
            "id_paciente": self.pac.id_paciente,
            "id_medico": self.med.id_medico,
            "fecha_cita": "2026-08-01",
            "hora_cita": "09:00:00",
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_solapamiento_cita_rechazado(self):
        """Crear dos citas para el mismo médico en la misma fecha/hora devuelve 400."""
        self._create_and_auth("recep_solap", roles=["Recepcionista"])
        # Primera cita
        self.client.post("/api/v1/citas/", {
            "id_paciente": self.pac.id_paciente,
            "id_medico": self.med.id_medico,
            "fecha_cita": "2026-08-02",
            "hora_cita": "10:00:00",
        })
        # Segunda cita misma hora → solapamiento
        pac2 = Paciente.objects.create(nombre="Otro", apellido="Pac")
        resp = self.client.post("/api/v1/citas/", {
            "id_paciente": pac2.id_paciente,
            "id_medico": self.med.id_medico,
            "fecha_cita": "2026-08-02",
            "hora_cita": "10:00:00",
        })
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_medico_puede_listar_citas(self):
        self._create_and_auth("med_cita_list", roles=["Médico"])
        resp = self.client.get("/api/v1/citas/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_farmaceutico_no_puede_listar_citas(self):
        self._create_and_auth("farm_cita", roles=["Farmacéutico"])
        resp = self.client.get("/api/v1/citas/")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_recepcionista_puede_cambiar_estado(self):
        self._create_and_auth("recep_estado", roles=["Recepcionista"])
        resp = self.client.post("/api/v1/citas/", {
            "id_paciente": self.pac.id_paciente,
            "id_medico": self.med.id_medico,
            "fecha_cita": "2026-08-03",
            "hora_cita": "11:00:00",
        })
        cita_id = resp.data["id_cita"]
        resp2 = self.client.patch(
            f"/api/v1/citas/{cita_id}/",
            {"estado_cita": "Confirmada"},
        )
        self.assertEqual(resp2.status_code, status.HTTP_200_OK)
