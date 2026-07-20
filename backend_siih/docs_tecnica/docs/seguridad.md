# Seguridad, Autenticación y Autorización

La seguridad del sistema se divide fundamentalmente en tres pilares: autenticación basada en tokens sin estado (JWT), perfiles de usuario extendidos de Django, y Control de Acceso Basado en Roles (RBAC).

## Autenticación mediante JWT

El acceso a la API requiere autenticación en casi todos sus endpoints. Se ha implementado **JSON Web Tokens (JWT)** mediante la librería `djangorestframework-simplejwt`.

**Flujo de Autenticación:**
1. El cliente envía sus credenciales (`username` y `password`) mediante un `POST` al endpoint `/api/v1/auth/login/`.
2. El servidor valida las credenciales y devuelve un par de tokens:
   - **Access Token:** Corta duración (ej. 1 hora). Es el que debe enviarse en el header `Authorization: Bearer <token>` en las subsecuentes peticiones.
   - **Refresh Token:** Larga duración (ej. 1 día). Permite obtener un nuevo Access Token.
3. Para renovar el Access Token, el cliente hace `POST` a `/api/v1/auth/refresh/` proporcionando el Refresh Token.

## Perfiles de Usuario

Django gestiona usuarios a través de su modelo nativo `User`. Para expandir su uso, se utiliza un modelo `PerfilUsuario` (relación `OneToOneField`) dentro del módulo `accounts`, que permite asociar un **cargo** y **teléfono** a cada usuario, manteniendo intacto el flujo interno del administrador de Django.

## Control de Acceso Basado en Roles (RBAC)

Para que un médico no modifique las facturas o el cajero no asigne camas, se utiliza un sistema estricto de roles. Cada usuario en Django puede pertenecer a ciertos "Grupos", que en la clínica actúan como **Roles**.

### Clases de Permisos

En `accounts/permissions.py` existen clases personalizadas derivadas de `BasePermission` de DRF:

- `IsAdmin`: Verifica si el usuario pertenece al grupo "Admin".
- `IsMedico`: Verifica el grupo "Medico".
- `IsRecepcionista`: Verifica el grupo "Recepcionista".
- `IsFarmaceutico`, `IsCajero`, `IsEnfermera`, `IsTecnicoLab`.

**Uso en las Vistas (ViewSets):**
Estas clases se inyectan en el atributo `permission_classes` de los ViewSets:

```python
class PacienteViewSet(viewsets.ModelViewSet):
    # Solo el recepcionista puede crear, editar o dar de baja a pacientes
    permission_classes = [IsRecepcionista]
```

En algunos casos se combinan (utilizando operadores lógicos `|`):
```python
class CamaViewSet(viewsets.ModelViewSet):
    # Tanto médicos como enfermeras tienen acceso al control de camas
    permission_classes = [IsMedico | IsEnfermera]
```

Este esquema garantiza que cualquier endpoint esté inherentemente protegido, a menos que especifique lo contrario (como los de login público).
