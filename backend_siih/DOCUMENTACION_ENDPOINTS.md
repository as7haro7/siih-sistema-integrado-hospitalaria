# Documentación de Endpoints (completa)

Este documento lista todos los endpoints implementados en la API v1 del backend SIIH, con descripción, formato de petición y ejemplos de todas las respuestas relevantes.

Nota: todas las rutas están bajo el prefijo base `/api/v1/` salvo indicación contraria. Las respuestas de error incluyen ejemplos representativos: `400 Bad Request` (validación), `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict` y `500 Internal Server Error`.

---

## 1) Autenticación

### POST /api/v1/auth/login/
- Descripción: Autentica al usuario y devuelve token(s) JWT.
- Request (application/json):

```json
{
  "username": "usuario",
  "password": "secreto"
}
```

- Respuestas:
  - 200 OK

```json
{
  "access": "<token_access>",
  "refresh": "<token_refresh>",
  "username": "usuario",
  "roles": ["Admin"]
}
```

  - 400 Bad Request (payload inválido)

```json
{ "detail": "Datos inválidos." }
```

  - 401 Unauthorized (credenciales incorrectas)

```json
{ "detail": "No se pudo autenticar con las credenciales proporcionadas." }
```

  - 500 Internal Server Error

```json
{ "detail": "Error interno del servidor." }
```

### POST /api/v1/auth/refresh/
- Descripción: Renueva el token `access` usando `refresh`.
- Request:

```json
{ "refresh": "<token_refresh>" }
```

- Respuestas:
  - 200 OK

```json
{ "access": "<nuevo_token_access>" }
```

  - 401 Unauthorized (refresh inválido/expirado)

```json
{ "detail": "Token inválido o expirado." }
```

---

## 2) Usuarios (accounts)
Prefijo: `/api/v1/usuarios/`

### GET /api/v1/usuarios/
- Listar usuarios (Admin).
- Respuestas: 200 OK (lista de usuarios), 401, 403, 500.

### POST /api/v1/usuarios/
- Crear usuario.
- Request ejemplo:

```json
{
  "username": "juan",
  "email": "juan@example.com",
  "password": "Secreto123",
  "first_name": "Juan",
  "last_name": "Perez"
}
```

- Respuestas:
  - 201 Created: devuelve representación del usuario creado.
  - 400 Bad Request: errores de validación.
  - 409 Conflict: usuario/email ya existe.

### GET /api/v1/usuarios/{id}/
- Obtener usuario.
- Respuestas: 200 OK, 404 Not Found, 401/403.

### PUT/PATCH /api/v1/usuarios/{id}/
- Actualizar usuario.
- Respuestas: 200 OK, 400, 401/403, 404, 409.

### DELETE /api/v1/usuarios/{id}/
- Eliminar usuario.
- Respuestas: 204 No Content, 401/403, 404.

### POST /api/v1/usuarios/{id}/roles/
- Asignar roles al usuario (Admin).
- Request ejemplo:

```json
{ "roles": ["Recepcionista", "Medico"] }
```

- Respuestas: 200 OK, 400, 401/403, 404.

---

## 3) Pacientes
Prefijo: `/api/v1/pacientes/`

Campos relevantes: `id_paciente`, `cedula_paciente`, `nombre`, `apellido`, `fecha_nacimiento`, `telefono`, `direccion`, `seguro_medico`, `alergias`, `estado_baja`.

### GET /api/v1/pacientes/
- Listar pacientes.
- Query params típicos: `?page=1`, `?search=nombre`.
- Respuestas: 200 OK (paginado), 401, 403.

### POST /api/v1/pacientes/
- Crear paciente.
- Request ejemplo:

```json
{
  "cedula_paciente": "0102030405",
  "nombre": "Maria",
  "apellido": "Gonzalez",
  "fecha_nacimiento": "1985-05-20",
  "telefono": "0991234567",
  "direccion": "Av. Siempre Viva 123",
  "seguro_medico": "SeguroX",
  "alergias": "Penicilina; Polen"
}
```

- Respuestas:
  - 201 Created: devuelve paciente creado.
  - 400 Bad Request: validación (campo requerido/formato).
  - 409 Conflict: `cedula_paciente` duplicada.
  - 401/403, 500.

### GET /api/v1/pacientes/{id}/
- Obtener paciente por `id_paciente`.
- Respuestas: 200 OK (incluye `alergias`), 404, 401/403.

### PUT/PATCH /api/v1/pacientes/{id}/
- Actualizar paciente (puede modificar `alergias`).
- Request ejemplo (PATCH parcial):

```json
{ "alergias": "Penicilina" }
```

- Respuestas: 200 OK, 400, 401/403, 404, 409.

### DELETE /api/v1/pacientes/{id}/
- Elimina o marca baja (según comportamiento de la API).
- Respuestas: 204 No Content o 200 con estado, 401/403, 404.

### POST /api/v1/pacientes/{id}/baja/
- Registra la baja del paciente.
- Request ejemplo:

```json
{ "motivo_baja": "Traslado" }
```

- Respuestas: 201 Created (registro de baja), 400, 401/403.

### GET /api/v1/pacientes/{id}/historial/
- Obtiene historiales clínicos asociados al paciente (si existe relación en el modelo).
- Respuestas: 200 OK, 401/403, 404.

---

## 4) Especialidades
Prefijo: `/api/v1/especialidades/` (CRUD)
- Standard CRUD: listar (200), crear (201), retrieve (200), update (200), delete (204).
- Errores: 400, 401, 403, 404.

---

## 5) Médicos
Prefijo: `/api/v1/medicos/`
- Endpoints: CRUD y `/{id}/disponibilidad/`.
- `/{id}/disponibilidad/` devuelve horarios/disponibilidad del médico.
- Errores: 400, 401, 403, 404.

---

## 6) Horarios Médicos
Prefijo: `/api/v1/horarios-medicos/` (CRUD).
- Respuestas: estándar CRUD y errores comunes.

---

## 7) Citas
Prefijo: `/api/v1/citas/`
- CRUD y validación anti-solapamiento al crear/actualizar.

### POST /api/v1/citas/
- Request ejemplo:

```json
{
  "id_paciente": 12,
  "id_medico": 5,
  "fecha_hora_inicio": "2026-07-21T10:00:00Z",
  "fecha_hora_fin": "2026-07-21T10:30:00Z",
  "motivo": "Consulta general"
}
```

- Respuestas:
  - 201 Created
  - 400 Bad Request (validación, solapamiento)
  - 409 Conflict (si ya existe reserva conflictiva)

---

## 8) Emergencias
Prefijo: `/api/v1/emergencias/`
- CRUD con triage.
- Al crear se puede incluir nivel de triage y datos del paciente/evento.

---

## 9) Tarifas de Habitación
Prefijo: `/api/v1/tarifas-habitacion/` (CRUD)

---

## 10) Camas
Prefijo: `/api/v1/camas/`
- CRUD + `/disponibles/` → lista camas libres.

---

## 11) Hospitalizaciones
Prefijo: `/api/v1/hospitalizaciones/`
- CRUD + `/{id}/alta/` para dar de alta.

---

## 12) Historiales Clínicos
Prefijo: `/api/v1/historiales/`

Campos relevantes: `id_historial`, `id_cita`, `id_hospitalizacion`, `id_emergencia`, `id_cie10` (FK a catálogo CIE-10), `fecha_registro`, `motivo_consulta`, `tratamiento`, `diagnostico`, `medico_tratante`.

### GET /api/v1/historiales/
- Listado de historiales (filtrable por paciente/cita/fecha/medico).
- Respuestas: 200, 401, 403.

### POST /api/v1/historiales/
- Crear historial clínico.
- Request ejemplo (incluye `id_cie10` opcional):

```json
{
  "id_cita": 23,
  "id_cie10": 5,
  "motivo_consulta": "Cefalea persistente",
  "diagnostico": "Migraña",
  "tratamiento": "Paracetamol 500 mg"
}
```

- Respuestas:
  - 201 Created
  - 400 Bad Request (si no está asociado a al menos un evento clínico: regla de negocio)
  - 401/403, 404 (si referencias inexistentes)

### POST /api/v1/historiales/{id}/recetas/
- Emitir receta asociada (ver farmacia).
- Request/Responses: 201 Created / errores habituales.

### POST /api/v1/historiales/{id}/examenes/
- Solicitar examen de laboratorio asociado a este historial. Se puede incluir `tipo_examen`, `costo_examen` y `indicaciones_medicas` (si se acepta desde el serializer anidado).
- Request ejemplo:

```json
{
  "tipo_examen": "Hemograma",
  "costo_examen": "12.50",
  "indicaciones_medicas": "Ayuno 8 horas"
}
```

- Respuestas: 201 Created, 400, 401/403, 404.

---

## 13) Catálogo CIE-10
Prefijo: `/api/v1/catalogo-cie10/` (ReadOnly)
- GET /api/v1/catalogo-cie10/
  - Listado de códigos CIE-10.
  - Response 200: lista de objetos `{ "id_cie10": 1, "codigo": "A00", "descripcion": "Cólera" }`.
  - Posibles errores: 401, 403, 500.

- GET /api/v1/catalogo-cie10/{id}/
  - Obtener entrada específica.
  - Response 200/404.

---

## 14) Exámenes de Laboratorio
Prefijo: `/api/v1/examenes/`

Campos: `id_examen`, `id_historial`, `tipo_examen`, `resultado_texto`, `estado_examen`, `indicaciones_medicas`, `costo_examen`.

### GET /api/v1/examenes/
- Listar exámenes.
- 200 OK, 401/403.

### POST /api/v1/examenes/
- Crear/solicitar examen (puede usarse también action anidada desde historial). Campo nuevo: `indicaciones_medicas`.
- Request ejemplo:

```json
{
  "id_historial": 10,
  "tipo_examen": "Perfil Lipídico",
  "costo_examen": "20.00",
  "indicaciones_medicas": "Ayuno 12 horas"
}
```

- Respuestas: 201 Created, 400, 401/403, 404.

### POST /api/v1/examenes/{id}/resultado/
- Cargar resultado y cambiar estado.
- Request ejemplo:

```json
{
  "resultado_texto": "LDL: 120 mg/dL",
  "estado_examen": "Completado"
}
```

- Respuestas: 200 OK, 400, 401/403, 404.

---

## 15) Proveedores
Prefijo: `/api/v1/proveedores/` (CRUD)
- Respuestas: estándar CRUD y errores comunes.

---

## 16) Medicamentos
Prefijo: `/api/v1/medicamentos/`
- CRUD + `alertas/` para stock cercano a vencimiento o bajo.
- Respuestas: estándar CRUD.

---

## 17) Lotes de Medicamentos
Prefijo: `/api/v1/lotes-medicamentos/` (CRUD)

---

## 18) Recetas
Prefijo: `/api/v1/recetas/`
- GET lista, GET `{id}/`, acciones: `pendientes/`, `{id}/despachar/`.
- Errores: 400, 401, 403, 404.

---

## 19) Compras
Prefijo: `/api/v1/compras/`
- CRUD atómico (compra + lote + detalle) – crear ejecuta toda la transacción.
- Respuestas: 201 Created, 400, 401/403.

---

## 20) Facturación
Prefijos: `/api/v1/facturas/config-impuesto/`, `/api/v1/facturas/`
- `config-impuesto` CRUD (Admin)
- `facturas` CRUD + `consolidar/` + pagos endpoints.
- Respuestas: estándar + errores específicos (ej. 409 si duplicado).

---

## 21) Auditoría
Prefijo: `/api/v1/auditoria/`
- Solo lectura (filtrable). Respuestas: 200, 401, 403.

---

## 22) Reportes
Prefijo: `/api/v1/reportes/`
- Endpoints para export CSV/Excel.
- Respuestas: 200 con archivo, 400 si parámetros inválidos.

---

## Errores comunes y formato de respuesta
- 200 OK: `{ ... recurso ... }` o lista paginada `{ "count": X, "results": [...] }`.
- 201 Created: objeto creado.
- 204 No Content: eliminación exitosa sin contenido.
- 400 Bad Request: `{ "field_name": ["error message"] }` o `{ "detail": "..." }`.
- 401 Unauthorized: `{ "detail": "Authentication credentials were not provided." }`.
- 403 Forbidden: `{ "detail": "You do not have permission to perform this action." }`.
- 404 Not Found: `{ "detail": "Not found." }`.
- 409 Conflict: `{ "detail": "Resource conflict: ..." }`.
- 500 Internal Server Error: `{ "detail": "Internal server error" }`.

---

## Notas específicas sobre nuevos campos / integraciones
- `pacientes.alergias`: campo `TEXT` — puede enviarse vacío o nulo; disponible en list/retrieve/create/update.
- `laboratorio.indicaciones_medicas`: campo `TEXT` — enviado al crear/solicitar examen.
- `clinico.CATALOGO_CIE10`: tabla de solo lectura; se usa `id_cie10` en `HistorialClinico` para referenciar el diagnóstico codificado.
- `clinico.HISTORIAL_CLINICO` ahora acepta `id_cie10` como FK (nullable). Al listar un historial, el serializer incluye `codigo_cie10` y `descripcion_cie10` de lectura.

---

## Cómo usar estas rutas localmente
1. Activar entorno virtual y dependencias.

```bash
source .venv/bin/activate
pip install -r requirements.txt
python manage.py runserver
```

2. Usar los endpoints con `Authorization: Bearer <access_token>` cuando sea necesario.

---

Si necesitas que exporte esta documentación a OpenAPI/Swagger completa (con ejemplos JSON automáticos) puedo generar un archivo OpenAPI YAML/JSON a partir de los serializers y viewsets del proyecto. Indica si lo deseas.
