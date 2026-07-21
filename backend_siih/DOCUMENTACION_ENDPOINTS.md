# Documentación de Endpoints (detallada)

Este documento describe de forma pormenorizada TODOS los endpoints de la API v1 del backend SIIH: ruta, método HTTP, autorización requerida, propósito, formato de la petición (payload), parámetros URL/query importantes y todas las respuestas posibles con ejemplos.

Base URL: `/api/v1/`.

Convenciones de respuestas mostradas:
- `200 OK`: operación exitosa (lectura/actualización).
- `201 Created`: recurso creado correctamente.
- `204 No Content`: eliminación exitosa sin contenido.
- `400 Bad Request`: errores de validación o payload mal formado.
- `401 Unauthorized`: credenciales ausentes o inválidas.
- `403 Forbidden`: sin permisos para la acción.
- `404 Not Found`: recurso no encontrado.
- `409 Conflict`: conflicto de recursos (p. ej. duplicados).
- `500 Internal Server Error`: error inesperado del servidor.

NOTA: donde se muestre `Authorization: Bearer <access_token>` significa que el endpoint requiere autenticación JWT.

---

## 1. Autenticación

### POST /auth/login/
- Autorización: no
- Descripción: autentica usuario y devuelve `access` y `refresh` JWT.
- Request (application/json):

```json
{
  "username": "string",
  "password": "string"
}
```
- Respuestas:
  - 200 OK

```json
{
  "access": "<token_access>",
  "refresh": "<token_refresh>",
  "username": "user",
  "roles": ["Admin"]
}
```
  - 400 Bad Request

```json
{ "username": ["This field is required."] }
```
  - 401 Unauthorized

```json
{ "detail": "No se pudo autenticar con las credenciales proporcionadas." }
```
  - 500 Internal Server Error

```json
{ "detail": "Internal server error" }
```

### POST /auth/refresh/
- Autorización: no
- Descripción: renueva `access` usando `refresh`.
- Request:

```json
{ "refresh": "<token_refresh>" }
```
- Respuestas:
  - 200 OK

```json
{ "access": "<nuevo_token_access>" }
```
  - 401 Unauthorized

```json
{ "detail": "Token inválido o expirado." }
```

---

## 2. Usuarios
Prefijo: `/usuarios/`

### GET /usuarios/
- Autorización: `Authorization: Bearer <access_token>` (Admin)
- Descripción: lista usuarios (paginado).
- Query params: `?page=1&search=<texto>`
- Respuestas:
  - 200 OK

```json
{
  "count": 123,
  "next": "...",
  "previous": null,
  "results": [ {"id":1,"username":"juan","email":"..."}, ... ]
}
```
  - 401, 403, 500

### POST /usuarios/
- Autorización: Admin
- Descripción: crea un usuario.
- Request:

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
  - 201 Created

```json
{ "id": 45, "username": "juan", "email": "juan@example.com" }
```
  - 400 Bad Request (ej. contraseña inválida)
  - 409 Conflict (usuario/email duplicado)
  - 401/403

### GET /usuarios/{id}/
- Autorización: Admin
- Descripción: obtener usuario por id.
- Respuestas: 200 OK, 404 Not Found, 401/403.

### PUT /usuarios/{id}/
- Autorización: Admin
- Descripción: reemplaza todos los campos del usuario.
- Request: idem a POST.
- Respuestas: 200 OK, 400, 401/403, 404, 409.

### PATCH /usuarios/{id}/
- Autorización: Admin
- Descripción: actualiza parcialmente.
- Request ejemplo:

```json
{ "first_name": "Juan Carlos" }
```
- Respuestas: 200, 400, 401/403, 404, 409.

### DELETE /usuarios/{id}/
- Autorización: Admin
- Descripción: elimina usuario.
- Respuestas: 204 No Content, 401/403, 404.

### POST /usuarios/{id}/roles/
- Autorización: Admin
- Descripción: asigna/quita roles.
- Request:

```json
{ "roles": ["Recepcionista","Medico"] }
```
- Respuestas: 200 OK (lista actualizada), 400, 401/403, 404.

---

## 3. Pacientes
Prefijo: `/pacientes/`

Campos clave: `id_paciente` (PK), `cedula_paciente` (unique), `nombre`, `apellido`, `fecha_nacimiento` (YYYY-MM-DD), `telefono`, `direccion`, `seguro_medico`, `alergias` (TEXT, null/blank), `estado_baja`.

### GET /pacientes/
- Autorización: `Bearer` (Recepcionista / Admin / Médico según políticas)
- Descripción: lista paginada de pacientes, con búsqueda por nombre/cedula.
- Query params: `?page=1&search=<texto>&ordering=nombre`
- Respuestas: 200 OK (paginado), 401, 403.

### POST /pacientes/
- Autorización: Recepcionista o Admin
- Descripción: crea nuevo paciente.
- Request:

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
  - 201 Created

```json
{
  "id_paciente": 123,
  "cedula_paciente": "0102030405",
  "nombre": "Maria",
  "apellido": "Gonzalez",
  "alergias": "Penicilina; Polen",
  "estado_baja": "Activo"
}
```
  - 400 Bad Request (validación), 409 Conflict (cedula duplicada), 401/403.

### GET /pacientes/{id}/
- Autorización: Authenticated
- Descripción: obtiene detalles de paciente (incluye `alergias`).
- Respuestas: 200 OK, 401/403, 404 Not Found.

### PUT/PATCH /pacientes/{id}/
- Autorización: Recepcionista/Admin
- Descripción: actualiza paciente; `alergias` puede quedar en blanco o null.
- Request ejemplo (PATCH):

```json
{ "alergias": "Penicilina" }
```
- Respuestas: 200 OK (objeto actualizado), 400 Bad Request, 401/403, 404, 409.

### DELETE /pacientes/{id}/
- Autorización: Admin
- Descripción: elimina o marca baja según implementación.
- Respuestas:
  - 204 No Content (eliminado)
  - 200 OK (si marca estado de baja en lugar de eliminar físicamente)
  - 401/403, 404.

### POST /pacientes/{id}/baja/
- Autorización: Admin/Recepcionista
- Descripción: registra razón de baja para el paciente.
- Request:

```json
{ "motivo_baja": "Traslado" }
```
- Respuestas:
  - 201 Created

```json
{ "id_baja": 55, "id_paciente": 123, "fecha_baja": "2026-07-20T12:00:00Z", "motivo_baja": "Traslado" }
```
  - 400, 401/403, 404.

### GET /pacientes/{id}/historial/
- Autorización: Authenticated (Médico/Enfermera/Recepción según permisos)
- Descripción: lista historiales clínicos asociados al paciente.
- Respuestas: 200 OK (lista), 401/403, 404.

---

## 4. Especialidades
Prefijo: `/especialidades/` (CRUD)

Endpoints estándar:
- GET /especialidades/ (listar)
- POST /especialidades/ (crear)
- GET /especialidades/{id}/ (detalle)
- PUT/PATCH /especialidades/{id}/ (actualizar)
- DELETE /especialidades/{id}/ (eliminar)

Respuestas típicas: 200, 201, 204, 400, 401, 403, 404.

---

## 5. Médicos
Prefijo: `/medicos/`

Endpoints:
- GET /medicos/ (listar)
- POST /medicos/ (crear)
- GET /medicos/{id}/ (detalle)
- PUT/PATCH /medicos/{id}/ (actualizar)
- DELETE /medicos/{id}/ (eliminar)
- GET /medicos/{id}/disponibilidad/ (horarios)

`/{id}/disponibilidad/` - Respuestas: 200 OK con lista de franjas horarias, 404 si no existe.

Errores comunes: 400, 401, 403, 404.

---

## 6. Horarios Médicos
Prefijo: `/horarios-medicos/` (CRUD)

Operaciones estándar CRUD con respuestas 200/201/204/400/401/403/404.

---

## 7. Citas
Prefijo: `/citas/`

### GET /citas/
- Listado de citas (filtros por médico, paciente, fecha).

### POST /citas/
- Autorización: Recepcionista / Admin
- Descripción: crea cita; valida solapamiento.
- Request:

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
  - 201 Created (cita creada)
  - 400 Bad Request (payload inválido)
  - 409 Conflict (solapamiento detectado)
  - 401/403

### PUT/PATCH/DELETE /citas/{id}/
- Respuestas: 200/204/400/401/403/404 según la acción.

---

## 8. Emergencias
Prefijo: `/emergencias/`

CRUD con campos de triage. Al crear se puede incluir `nivel_triege`, `datos_paciente`, `descripcion_evento`.

Request ejemplo (POST):

```json
{
  "id_paciente": 10,
  "nivel_triege": "Alto",
  "descripcion": "Accidente de tráfico",
  "observaciones": "Sangrado activo"
}
```

Respuestas: 201 Created, 400, 401/403, 404.

---

## 9. Tarifas de Habitación
Prefijo: `/tarifas-habitacion/` (CRUD)

Campos: `id`, `tipo_habitacion`, `tarifa_diaria`, `activo`.

Respuestas: 200/201/204/400/401/403/404.

---

## 10. Camas
Prefijo: `/camas/`

Endpoints:
- GET /camas/ (listar)
- GET /camas/disponibles/ (listar camas libres)
- POST /camas/ (crear)
- GET/PUT/PATCH/DELETE /camas/{id}/

Respuestas: 200/201/204/400/401/403/404.

---

## 11. Hospitalizaciones
Prefijo: `/hospitalizaciones/`

Endpoints estándar CRUD + POST /hospitalizaciones/{id}/alta/ para dar de alta.

POST /hospitalizaciones/{id}/alta/ - Request ejemplo:

```json
{ "observaciones_alta": "Paciente estable, seguimiento ambulatorio" }
```

Respuestas: 200 OK (alta registrada), 400, 401/403, 404.

---

## 12. Historiales Clínicos
Prefijo: `/historiales/`

Campos: `id_historial`, `id_cita`, `id_hospitalizacion`, `id_emergencia`, `id_cie10` (FK nullable), `motivo_consulta`, `tratamiento`, `diagnostico`, `medico_tratante`, `fecha_registro`.

### GET /historiales/
- Descripción: lista historiales con filtros.
- Respuestas: 200, 401, 403.

### POST /historiales/
- Autorización: Médico / Admin
- Descripción: crea historial; obliga a asociar al menos `id_cita` o `id_hospitalizacion` o `id_emergencia`.
- Request:

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
  - 400 Bad Request (regla de negocio: falta evento clínico)
  - 401/403, 404 (referencias invalidas)

### GET /historiales/{id}/
- Respuestas: 200 OK con los campos del historial; incluye `id_cie10` y campos de lectura `codigo_cie10`, `descripcion_cie10` si existe la FK.

### PUT/PATCH /historiales/{id}/
- Actualiza historial. Puede asignarse `id_cie10` (debe existir en `catalogo-cie10`).
- Respuestas: 200, 400, 401/403, 404.

### POST /historiales/{id}/recetas/
- Autorización: Médico
- Descripción: genera una receta asociada al historial.
- Request: (ver sección farmacia/recetas)
- Respuestas: 201 Created, 400, 401/403, 404.

### POST /historiales/{id}/examenes/
- Autorización: Médico
- Descripción: solicita un examen de laboratorio; payload opcionalmente incluye `indicaciones_medicas`.
- Request ejemplo:

```json
{ "tipo_examen": "Hemograma", "costo_examen": "12.50", "indicaciones_medicas": "Ayuno 8 horas" }
```
- Respuestas: 201 Created, 400, 401/403, 404.

---

## 13. Catálogo CIE-10
Prefijo: `/catalogo-cie10/` (ReadOnly)

### GET /catalogo-cie10/
- Autorización: Authenticated (Médico/Enfermera/Admin según políticas)
- Descripción: lista códigos CIE-10.
- Response 200 ejemplo:

```json
[
  { "id_cie10": 1, "codigo": "A00", "descripcion": "Cólera" },
  { "id_cie10": 2, "codigo": "A01", "descripcion": "Fiebre tifoidea" }
]
```
- Errores: 401, 403, 500.

### GET /catalogo-cie10/{id}/
- Respuestas: 200 OK con objeto, 404 Not Found, 401/403.

---

## 14. Exámenes de Laboratorio
Prefijo: `/examenes/`

Campos: `id_examen`, `id_historial`, `tipo_examen`, `resultado_texto`, `estado_examen` (Pendiente/En Proceso/Completado), `indicaciones_medicas` (nuevo), `costo_examen`.

### GET /examenes/
- Lista exámenes (filtros por historial/estado).
- Respuestas: 200, 401/403.

### POST /examenes/
- Autorización: Médico/Técnico según flujo
- Descripción: crea solicitud de examen.
- Request ejemplo:

```json
{
  "id_historial": 10,
  "tipo_examen": "Perfil Lipídico",
  "costo_examen": "20.00",
  "indicaciones_medicas": "Ayuno 12 horas"
}
```
- Respuestas:
  - 201 Created
  - 400 Bad Request (validación)
  - 401/403, 404 (historial no existe)

### POST /examenes/{id}/resultado/
- Autorización: Técnico Lab
- Descripción: carga resultado y actualiza `estado_examen`.
- Request ejemplo:

```json
{ "resultado_texto": "LDL: 120 mg/dL", "estado_examen": "Completado" }
```
- Respuestas: 200 OK (examen actualizado), 400, 401/403, 404.

### GET /examenes/{id}/
- Respuestas: 200 OK con detalles, 404, 401/403.

---

## 15. Proveedores
Prefijo: `/proveedores/` (CRUD)

Operaciones estándar CRUD. Ejemplo POST:

```json
{ "nombre": "ProveedorX", "contacto": "0999...", "direccion": "..." }
```

Respuestas: 201, 200, 204, 400, 401/403, 404.

---

## 16. Medicamentos
Prefijo: `/medicamentos/`

Endpoints: CRUD y GET /medicamentos/alertas/ para alertas de stock/vencimiento.

POST ejemplo:

```json
{ "nombre": "Paracetamol", "presentacion": "500mg", "stock": 100 }
```

Respuestas: estándar CRUD y códigos de error habituales.

---

## 17. Lotes de Medicamentos
Prefijo: `/lotes-medicamentos/` (CRUD)

Campos: `id_lote`, `id_medicamento`, `fecha_vencimiento`, `cantidad`, `lote_code`.

Respuestas: 200/201/204/400/401/403/404.

---

## 18. Recetas
Prefijo: `/recetas/`

### GET /recetas/
- Lista recetas (paginado).

### GET /recetas/pendientes/
- Lista recetas pendientes de despacho.

### GET /recetas/{id}/
- Detalle de receta, incluye items.

### POST /recetas/ (crear receta global)
- Request (ejemplo):

```json
{
  "id_historial": 12,
  "items": [ { "id_medicamento": 3, "cantidad": 10, "dosis": "1 c/8h" } ]
}
```

### POST /recetas/{id}/despachar/
- Autorización: Farmacéutico
- Descripción: marca receta como despachada.
- Respuestas: 200 OK (despacho exitoso), 400, 401/403, 404.

---

## 19. Compras
Prefijo: `/compras/`

POST /compras/ crea una compra y genera lote(s) y detalle(s) dentro de una transacción atómica.

Request (ejemplo):

```json
{
  "proveedor": 5,
  "fecha": "2026-07-20",
  "items": [ { "id_medicamento": 3, "cantidad": 100, "precio_unitario": "1.20" } ]
}
```

Respuestas: 201 Created, 400, 401/403.

---

## 20. Facturación
Prefijos: `/facturas/config-impuesto/`, `/facturas/`

### Config impuesto
- CRUD para configuración de impuestos (Admin).

### Facturas
- Endpoints: CRUD, POST /facturas/{id}/consolidar/ (consolidación), POST /facturas/{id}/pagos/ (registrar pago), GET /facturas/{id}/pagos-lista/ (listar pagos asociados).

Request crear factura (ejemplo):

```json
{
  "cliente": { "nombre": "Empresa X", "nrc": "..." },
  "items": [ { "descripcion": "Consulta médica", "cantidad": 1, "precio_unitario": "25.00" } ]
}
```

Respuestas: 201, 200, 400, 401/403, 409 (duplicado), 404.

---

## 21. Auditoría
Prefijo: `/auditoria/` (solo lectura)

GET /auditoria/ - lista eventos auditable con filtros (usuario, tipo, fecha).

Respuestas: 200 OK con lista, 401/403.

---

## 22. Reportes
Prefijo: `/reportes/`

Endpoints para generar y descargar reportes en CSV/Excel. Ejemplos:
- GET /reportes/atenciones/?desde=2026-01-01&hasta=2026-06-30&format=csv

Respuestas: 200 con archivo (Content-Type: text/csv o application/vnd.openxmlformats-officedocument.spreadsheetml.sheet), 400 si parámetros inválidos, 401/403.

---

## Respuestas de error y formato estándar

- 400 Bad Request: validación de campos. Ejemplo:

```json
{ "telefono": ["Enter a valid phone number."] }
```

- 401 Unauthorized:

```json
{ "detail": "Authentication credentials were not provided." }
```

- 403 Forbidden:

```json
{ "detail": "You do not have permission to perform this action." }
```

- 404 Not Found:

```json
{ "detail": "Not found." }
```

- 409 Conflict:

```json
{ "detail": "Resource conflict: ..." }
```

- 500 Internal Server Error:

```json
{ "detail": "Internal server error" }
```

---

## Notas finales

- `pacientes.alergias` y `laboratorio.indicaciones_medicas` son campos nuevos y están disponibles en create/update/list/retrieve para sus recursos respectivos.
- `clinico.CATALOGO_CIE10` es de solo lectura; `historiales` almacena la FK `id_cie10` y los serializers exponen además `codigo_cie10` y `descripcion_cie10`.

Si deseas, puedo convertir esta documentación en un archivo OpenAPI (YAML/JSON) con ejemplos y esquemas automáticos a partir de los serializers y viewsets. Indica si lo genero y en qué formato prefieres (YAML o JSON).
