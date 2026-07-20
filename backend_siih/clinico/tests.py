"""
Tests para el módulo clínico: historiales, recetas y exámenes.
"""
from rest_framework import status
from accounts.tests import BaseTestCase
from pacientes.models import Paciente
from personal_medico.models import Especialidad, Medico
from citas.models import Cita
from clinico.models import HistorialClinico


class HistorialClinicoTests(BaseTestCase):
    """Pruebas del endpoint /api/v1/historiales/."""

    def setUp(self):
        super().setUp()
        self.esp = Especialidad.objects.create(nombre_especialidad="General Clinico")
        self.med = Medico.objects.create(
            nombre_medico="Dr. Clinico", id_especialidad=self.esp,
        )
        self.pac = Paciente.objects.create(nombre="Pac", apellido="Clinico")
        self.cita = Cita.objects.create(
            id_paciente=self.pac,
            id_medico=self.med,
            fecha_cita="2026-08-01",
            hora_cita="09:00:00",
        )

    def test_medico_puede_crear_historial(self):
        self._create_and_auth("med_hist_c", roles=["Médico"])
        resp = self.client.post("/api/v1/historiales/", {
            "id_cita": self.cita.id_cita,
            "motivo_consulta": "Dolor de cabeza persistente",
            "diagnostico": "Migraña",
            "tratamiento": "Reposo y analgésicos",
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_enfermera_puede_listar_historiales(self):
        self._create_and_auth("enf_hist", roles=["Enfermera"])
        resp = self.client.get("/api/v1/historiales/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_cajero_no_puede_ver_historiales(self):
        self._create_and_auth("caj_hist", roles=["Cajero"])
        resp = self.client.get("/api/v1/historiales/")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_medico_puede_emitir_receta(self):
        """POST /api/v1/historiales/{id}/recetas/ crea una receta."""
        self._create_and_auth("med_receta", roles=["Médico"])
        from farmacia.models import Medicamento
        med_obj = Medicamento.objects.create(
            nombre_comercial="Ibuprofeno Test",
            stock_actual=100,
            stock_minimo=10,
            precio_unitario=5.00,
        )
        historial = HistorialClinico.objects.create(
            id_cita=self.cita,
            motivo_consulta="Dolor",
            medico_tratante="med_receta",
        )
        resp = self.client.post(
            f"/api/v1/historiales/{historial.id_historial}/recetas/",
            {
                "id_medicamento": med_obj.id_medicamento,
                "cantidad_recetada": 2,
                "dosis": "1 cada 8 horas",
                "frecuencia": "Cada 8 horas",
                "duracion": "5 días",
            },
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_medico_puede_solicitar_examen(self):
        """POST /api/v1/historiales/{id}/examenes/ solicita un examen."""
        self._create_and_auth("med_exam", roles=["Médico"])
        historial = HistorialClinico.objects.create(
            id_cita=self.cita,
            motivo_consulta="Revisión",
            medico_tratante="med_exam",
        )
        resp = self.client.post(
            f"/api/v1/historiales/{historial.id_historial}/examenes/",
            {
                "tipo_examen": "Hemograma Completo",
                "costo_examen": "150.00",
            },
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
