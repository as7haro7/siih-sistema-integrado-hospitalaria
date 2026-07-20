"""
Tests para el módulo accounts: autenticación JWT, CRUD usuarios y RBAC.
"""
from django.contrib.auth.models import User, Group
from rest_framework import status
from rest_framework.test import APITestCase


class BaseTestCase(APITestCase):
    """
    Clase base con helpers para crear usuarios con roles y autenticarlos
    vía JWT. Todos los tests del proyecto heredan de esta clase.
    """

    @classmethod
    def setUpTestData(cls):
        """Crea los roles del sistema una sola vez para toda la clase."""
        roles = [
            "Administrador", "Recepcionista", "Médico", "Enfermera",
            "Técnico de Laboratorio", "Farmacéutico", "Cajero", "Director",
        ]
        for role in roles:
            Group.objects.get_or_create(name=role)

    def _create_user(self, username, password="TestPass123!", roles=None):
        """Crea un usuario y le asigna los roles especificados."""
        user = User.objects.create_user(
            username=username,
            password=password,
            email=f"{username}@test.com",
        )
        if roles:
            groups = Group.objects.filter(name__in=roles)
            user.groups.set(groups)
        return user

    def _auth(self, username, password="TestPass123!"):
        """Autentica un usuario vía JWT y configura el header Authorization."""
        resp = self.client.post("/api/v1/auth/login/", {
            "username": username,
            "password": password,
        })
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.data)
        token = resp.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        return token

    def _create_and_auth(self, username, roles=None, password="TestPass123!"):
        """Atajo: crea usuario, asigna roles y lo autentica."""
        self._create_user(username, password, roles)
        return self._auth(username, password)


# ══════════════════════════════════════════════════════════════════════
# Tests de Autenticación JWT
# ══════════════════════════════════════════════════════════════════════
class AuthJWTTests(BaseTestCase):
    """Pruebas del endpoint /api/v1/auth/login/ y /api/v1/auth/refresh/."""

    def test_login_exitoso(self):
        """Un usuario con credenciales válidas recibe access y refresh tokens."""
        self._create_user("auth_user")
        resp = self.client.post("/api/v1/auth/login/", {
            "username": "auth_user",
            "password": "TestPass123!",
        })
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("access", resp.data)
        self.assertIn("refresh", resp.data)

    def test_login_credenciales_invalidas(self):
        """Credenciales incorrectas devuelven 401."""
        self._create_user("auth_user2")
        resp = self.client.post("/api/v1/auth/login/", {
            "username": "auth_user2",
            "password": "WrongPass",
        })
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_token(self):
        """Un refresh token válido devuelve un nuevo access token."""
        self._create_user("auth_user3")
        login_resp = self.client.post("/api/v1/auth/login/", {
            "username": "auth_user3",
            "password": "TestPass123!",
        })
        refresh = login_resp.data["refresh"]
        resp = self.client.post("/api/v1/auth/refresh/", {"refresh": refresh})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("access", resp.data)

    def test_endpoint_protegido_sin_token(self):
        """Acceder a un endpoint protegido sin token devuelve 401."""
        resp = self.client.get("/api/v1/usuarios/")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


# ══════════════════════════════════════════════════════════════════════
# Tests de CRUD de Usuarios
# ══════════════════════════════════════════════════════════════════════
class UsuarioCRUDTests(BaseTestCase):
    """Pruebas del endpoint /api/v1/usuarios/."""

    def test_admin_puede_listar_usuarios(self):
        """Un Administrador puede listar usuarios."""
        self._create_and_auth("admin_list", roles=["Administrador"])
        resp = self.client.get("/api/v1/usuarios/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_no_admin_no_puede_listar_usuarios(self):
        """Un Recepcionista no puede listar usuarios (403)."""
        self._create_and_auth("recep_list", roles=["Recepcionista"])
        resp = self.client.get("/api/v1/usuarios/")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_puede_crear_usuario(self):
        """Un Admin puede crear un nuevo usuario."""
        self._create_and_auth("admin_create", roles=["Administrador"])
        resp = self.client.post("/api/v1/usuarios/", {
            "username": "nuevo_user",
            "password": "NuevoPass123!",
            "email": "nuevo@test.com",
            "first_name": "Nuevo",
            "last_name": "Usuario",
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_admin_puede_crear_usuario_con_roles(self):
        """Un Admin puede crear un usuario con roles."""
        self._create_and_auth("admin_roles", roles=["Administrador"])
        resp = self.client.post("/api/v1/usuarios/", {
            "username": "medico_user",
            "password": "MedicoPass123!",
            "email": "medico@test.com",
            "roles": ["Médico"],
        }, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_destroy_desactiva_usuario(self):
        """DELETE en un usuario lo desactiva en lugar de eliminarlo."""
        self._create_and_auth("admin_del", roles=["Administrador"])
        target = self._create_user("to_deactivate")
        resp = self.client.delete(f"/api/v1/usuarios/{target.id}/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        target.refresh_from_db()
        self.assertFalse(target.is_active)


# ══════════════════════════════════════════════════════════════════════
# Tests de Asignación de Roles
# ══════════════════════════════════════════════════════════════════════
class RolAssignTests(BaseTestCase):
    """Pruebas del endpoint /api/v1/usuarios/{id}/roles/."""

    def test_admin_puede_asignar_roles(self):
        """Un Admin puede asignar roles a un usuario."""
        self._create_and_auth("admin_assign", roles=["Administrador"])
        target = self._create_user("target_roles")
        resp = self.client.patch(
            f"/api/v1/usuarios/{target.id}/roles/",
            {"roles": ["Médico", "Administrador"]},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("Médico", resp.data["roles"])
        self.assertIn("Administrador", resp.data["roles"])

    def test_asignar_rol_inexistente_falla(self):
        """Asignar un rol que no existe devuelve error 400."""
        self._create_and_auth("admin_bad_role", roles=["Administrador"])
        target = self._create_user("target_bad")
        resp = self.client.patch(
            f"/api/v1/usuarios/{target.id}/roles/",
            {"roles": ["RolFantasma"]},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


# ══════════════════════════════════════════════════════════════════════
# Tests de Permisos RBAC
# ══════════════════════════════════════════════════════════════════════
class RBACPermissionTests(BaseTestCase):
    """Pruebas generales de acceso basado en roles."""

    def test_superuser_tiene_acceso_total(self):
        """Un superusuario puede acceder a cualquier endpoint."""
        su = User.objects.create_superuser(
            "superadmin", "super@test.com", "SuperPass123!",
        )
        self._auth("superadmin", "SuperPass123!")
        resp = self.client.get("/api/v1/usuarios/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_usuario_sin_roles_recibe_403(self):
        """Un usuario sin ningún rol recibe 403 en endpoints protegidos."""
        self._create_and_auth("no_role_user", roles=[])
        resp = self.client.get("/api/v1/usuarios/")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
