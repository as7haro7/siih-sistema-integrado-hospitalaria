"""
Tests para laboratorio: CRUD de exámenes y registro de resultados.
"""
from rest_framework import status
from accounts.tests import BaseTestCase
from pacientes.models import Paciente
from personal_medico.models import Especialidad, Medico
from citas.models import Cita
from clinico.models import HistorialClinico
from laboratorio.models import ExamenLaboratorio


class ExamenLaboratorioTests(BaseTestCase):
    """Pruebas del endpoint /api/v1/examenes/."""

    def setUp(self):
        super().setUp()
        esp = Especialidad.objects.create(nombre_especialidad="Lab Test")
        med = Medico.objects.create(nombre_medico="Dr. Lab", id_especialidad=esp)
        pac = Paciente.objects.create(nombre="Pac", apellido="Lab")
        cita = Cita.objects.create(
            id_paciente=pac, id_medico=med,
            fecha_cita="2026-08-05", hora_cita="10:00:00",
        )
        self.historial = HistorialClinico.objects.create(
            id_cita=cita, motivo_consulta="Chequeo",
            medico_tratante="Dr. Lab",
        )

    def test_medico_puede_crear_examen(self):
        self._create_and_auth("med_lab", roles=["Médico"])
        resp = self.client.post("/api/v1/examenes/", {
            "id_historial": self.historial.id_historial,
            "tipo_examen": "Glucosa en Sangre",
            "costo_examen": "80.00",
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_tecnico_puede_listar_examenes(self):
        self._create_and_auth("tec_lab", roles=["Técnico de Laboratorio"])
        resp = self.client.get("/api/v1/examenes/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_tecnico_puede_cargar_resultado(self):
        self._create_and_auth("tec_res", roles=["Técnico de Laboratorio"])
        examen = ExamenLaboratorio.objects.create(
            id_historial=self.historial,
            tipo_examen="Hemoglobina",
            costo_examen=50.00,
            estado_examen="Pendiente",
        )
        resp = self.client.patch(
            f"/api/v1/examenes/{examen.id_examen}/resultado/",
            {
                "resultado_texto": "Hemoglobina: 14.5 g/dL - Normal",
                "estado_examen": "Completado",
            },
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["estado_examen"], "Completado")

    def test_recepcionista_no_puede_acceder(self):
        self._create_and_auth("recep_lab", roles=["Recepcionista"])
        resp = self.client.get("/api/v1/examenes/")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
