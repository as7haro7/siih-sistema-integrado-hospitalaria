"""
Tests para personal_medico: especialidades, médicos y horarios.
"""
from rest_framework import status
from accounts.tests import BaseTestCase
from personal_medico.models import Especialidad, Medico


class EspecialidadTests(BaseTestCase):
    """Pruebas del endpoint /api/v1/especialidades/."""

    def test_admin_puede_crear_especialidad(self):
        self._create_and_auth("admin_esp", roles=["Administrador"])
        resp = self.client.post("/api/v1/especialidades/", {
            "nombre_especialidad": "Cardiología",
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_recepcionista_no_puede_crear_especialidad(self):
        self._create_and_auth("recep_esp", roles=["Recepcionista"])
        resp = self.client.post("/api/v1/especialidades/", {
            "nombre_especialidad": "Neurología",
        })
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_puede_listar_especialidades(self):
        self._create_and_auth("admin_esp_list", roles=["Administrador"])
        resp = self.client.get("/api/v1/especialidades/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)


class MedicoTests(BaseTestCase):
    """Pruebas del endpoint /api/v1/medicos/."""

    def _create_especialidad(self):
        return Especialidad.objects.create(nombre_especialidad="Pediatría Test")

    def test_recepcionista_puede_listar_medicos(self):
        self._create_and_auth("recep_med", roles=["Recepcionista"])
        resp = self.client.get("/api/v1/medicos/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_recepcionista_no_puede_crear_medico(self):
        self._create_and_auth("recep_med_c", roles=["Recepcionista"])
        esp = self._create_especialidad()
        resp = self.client.post("/api/v1/medicos/", {
            "nombre_medico": "Dr. García",
            "id_especialidad": esp.id_especialidad,
            "telefono": "71111111",
        })
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_disponibilidad_medico(self):
        self._create_and_auth("recep_disp", roles=["Recepcionista"])
        esp = self._create_especialidad()
        med = Medico.objects.create(
            nombre_medico="Dr. Disponible",
            id_especialidad=esp,
        )
        resp = self.client.get(f"/api/v1/medicos/{med.id_medico}/disponibilidad/?fecha=2023-10-10")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)


class HorarioMedicoTests(BaseTestCase):
    """Pruebas del endpoint /api/v1/horarios-medicos/."""

    def test_admin_puede_crear_horario(self):
        self._create_and_auth("admin_hor", roles=["Administrador"])
        esp = Especialidad.objects.create(nombre_especialidad="Traumatología Test")
        med = Medico.objects.create(nombre_medico="Dr. Horario", id_especialidad=esp)
        resp = self.client.post("/api/v1/horarios-medicos/", {
            "id_medico": med.id_medico,
            "dia_semana": "Lunes",
            "hora_inicio": "08:00:00",
            "hora_fin": "12:00:00",
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_admin_puede_listar_horarios(self):
        self._create_and_auth("admin_hor_list", roles=["Administrador"])
        resp = self.client.get("/api/v1/horarios-medicos/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
