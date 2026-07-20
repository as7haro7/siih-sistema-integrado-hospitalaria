"""
Tests para auditoría: solo lectura y filtros.
"""
from rest_framework import status
from accounts.tests import BaseTestCase


class AuditoriaSistemaTests(BaseTestCase):
    """Pruebas del endpoint /api/v1/auditoria/."""

    def test_admin_puede_listar_auditoria(self):
        self._create_and_auth("admin_aud", roles=["Administrador"])
        resp = self.client.get("/api/v1/auditoria/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_medico_no_puede_listar_auditoria(self):
        self._create_and_auth("med_aud", roles=["Médico"])
        resp = self.client.get("/api/v1/auditoria/")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_recepcionista_no_puede_listar_auditoria(self):
        self._create_and_auth("recep_aud", roles=["Recepcionista"])
        resp = self.client.get("/api/v1/auditoria/")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_no_se_puede_crear_registro_auditoria(self):
        """POST no está permitido (ReadOnlyModelViewSet)."""
        self._create_and_auth("admin_aud_post", roles=["Administrador"])
        resp = self.client.post("/api/v1/auditoria/", {
            "usuario_accion": "test",
            "tabla_afectada": "PACIENTE",
            "id_registro_afectado": 1,
            "tipo_operacion": "INSERCION",
        })
        self.assertEqual(resp.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_filtro_por_tabla_afectada(self):
        """El filtro por tabla_afectada no genera error."""
        self._create_and_auth("admin_aud_filter", roles=["Administrador"])
        resp = self.client.get("/api/v1/auditoria/?tabla_afectada=PACIENTE")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_filtro_por_tipo_operacion(self):
        self._create_and_auth("admin_aud_tipo", roles=["Administrador"])
        resp = self.client.get("/api/v1/auditoria/?tipo_operacion=INSERCION")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
