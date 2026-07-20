"""
Tests para el módulo pacientes: CRUD, historial y baja.
"""
from rest_framework import status
from accounts.tests import BaseTestCase
from pacientes.models import Paciente


class PacienteCRUDTests(BaseTestCase):
    """Pruebas del endpoint /api/v1/pacientes/."""

    def _create_paciente(self):
        """Helper: crea un paciente directamente en la BD."""
        return Paciente.objects.create(
            nombre="Juan",
            apellido="Pérez",
            cedula_paciente="1234567",
            telefono="70000001",
            direccion="Calle Falsa 123",
        )

    def test_recepcionista_puede_listar(self):
        self._create_and_auth("recep_pac_list", roles=["Recepcionista"])
        resp = self.client.get("/api/v1/pacientes/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_medico_puede_listar(self):
        self._create_and_auth("med_pac_list", roles=["Médico"])
        resp = self.client.get("/api/v1/pacientes/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_cajero_no_puede_listar(self):
        self._create_and_auth("caj_pac_list", roles=["Cajero"])
        resp = self.client.get("/api/v1/pacientes/")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_recepcionista_puede_crear(self):
        self._create_and_auth("recep_pac_create", roles=["Recepcionista"])
        resp = self.client.post("/api/v1/pacientes/", {
            "nombre": "María",
            "apellido": "López",
            "cedula_paciente": "7654321",
            "telefono": "70000002",
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["nombre"], "María")

    def test_crear_paciente_cedula_duplicada(self):
        """Crear un paciente con cédula ya existente devuelve 400."""
        self._create_and_auth("recep_dup", roles=["Recepcionista"])
        self._create_paciente()
        resp = self.client.post("/api/v1/pacientes/", {
            "nombre": "Otro",
            "apellido": "Paciente",
            "cedula_paciente": "1234567",  # Duplicada
        })
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_recepcionista_puede_ver_detalle(self):
        self._create_and_auth("recep_pac_det", roles=["Recepcionista"])
        pac = self._create_paciente()
        resp = self.client.get(f"/api/v1/pacientes/{pac.id_paciente}/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["nombre"], "Juan")

    def test_recepcionista_puede_actualizar(self):
        self._create_and_auth("recep_pac_upd", roles=["Recepcionista"])
        pac = self._create_paciente()
        resp = self.client.patch(
            f"/api/v1/pacientes/{pac.id_paciente}/",
            {"telefono": "79999999"},
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["telefono"], "79999999")


class PacienteBajaTests(BaseTestCase):
    """Pruebas del endpoint /api/v1/pacientes/{id}/baja/."""

    def test_baja_paciente(self):
        self._create_and_auth("recep_baja", roles=["Recepcionista"])
        pac = Paciente.objects.create(nombre="Ana", apellido="Baja")
        resp = self.client.post(
            f"/api/v1/pacientes/{pac.id_paciente}/baja/",
            {"motivo_baja": "Transferencia a otra clínica"},
        )
        self.assertIn(resp.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])

    def test_baja_paciente_ya_dado_de_baja(self):
        """Dar de baja a un paciente que ya está de baja devuelve 409."""
        self._create_and_auth("recep_baja2", roles=["Recepcionista"])
        pac = Paciente.objects.create(
            nombre="Pedro", apellido="DobleBaja", estado_baja="Baja",
        )
        resp = self.client.post(
            f"/api/v1/pacientes/{pac.id_paciente}/baja/",
            {"motivo_baja": "Test"},
        )
        self.assertEqual(resp.status_code, status.HTTP_409_CONFLICT)


class PacienteHistorialTests(BaseTestCase):
    """Pruebas del endpoint /api/v1/pacientes/{id}/historial/."""

    def test_historial_paciente(self):
        self._create_and_auth("recep_hist", roles=["Recepcionista"])
        pac = Paciente.objects.create(nombre="Luis", apellido="Historial")
        resp = self.client.get(f"/api/v1/pacientes/{pac.id_paciente}/historial/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
