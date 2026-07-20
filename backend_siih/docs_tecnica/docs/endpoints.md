# Catálogo de Endpoints

Referencia completa de todos los endpoints expuestos por la API REST del sistema. Se incluyen los métodos HTTP soportados, la descripción funcional y el rol autorizado.

## Autenticación (`/api/v1/auth/`)

| Método | Endpoint | Descripción | Rol |
|---|---|---|---|
| POST | `/api/v1/auth/login/` | Obtener par de tokens JWT (access + refresh) | Público |
| POST | `/api/v1/auth/refresh/` | Renovar access token con un refresh token válido | Público |

## Usuarios (`/api/v1/usuarios/`)

| Método | Endpoint | Descripción | Rol |
|---|---|---|---|
| GET | `/api/v1/usuarios/` | Listar todos los usuarios | Admin |
| POST | `/api/v1/usuarios/` | Crear un nuevo usuario | Admin |
| GET | `/api/v1/usuarios/{id}/` | Detalle de un usuario | Admin |
| PUT/PATCH | `/api/v1/usuarios/{id}/` | Actualizar un usuario | Admin |
| DELETE | `/api/v1/usuarios/{id}/` | Eliminar un usuario | Admin |
| PATCH | `/api/v1/usuarios/{id}/roles/` | Asignar/modificar roles de un usuario | Admin |

## Pacientes (`/api/v1/pacientes/`)

| Método | Endpoint | Descripción | Rol |
|---|---|---|---|
| GET | `/api/v1/pacientes/` | Listar pacientes | Recepcionista |
| POST | `/api/v1/pacientes/` | Registrar nuevo paciente | Recepcionista |
| GET | `/api/v1/pacientes/{id}/` | Detalle de un paciente | Recepcionista |
| PUT/PATCH | `/api/v1/pacientes/{id}/` | Actualizar datos de un paciente | Recepcionista |
| DELETE | `/api/v1/pacientes/{id}/` | Eliminar un paciente | Recepcionista |
| GET | `/api/v1/pacientes/{id}/historial/` | Historial clínico del paciente | Recepcionista |
| POST | `/api/v1/pacientes/{id}/baja/` | Dar de baja a un paciente | Recepcionista |

## Especialidades (`/api/v1/especialidades/`)

| Método | Endpoint | Descripción | Rol |
|---|---|---|---|
| GET | `/api/v1/especialidades/` | Listar especialidades médicas | Admin |
| POST | `/api/v1/especialidades/` | Crear especialidad | Admin |
| GET | `/api/v1/especialidades/{id}/` | Detalle de especialidad | Admin |
| PUT/PATCH | `/api/v1/especialidades/{id}/` | Actualizar especialidad | Admin |
| DELETE | `/api/v1/especialidades/{id}/` | Eliminar especialidad | Admin |

## Médicos (`/api/v1/medicos/`)

| Método | Endpoint | Descripción | Rol |
|---|---|---|---|
| GET | `/api/v1/medicos/` | Listar médicos | Recepcionista |
| POST | `/api/v1/medicos/` | Registrar nuevo médico | Recepcionista |
| GET | `/api/v1/medicos/{id}/` | Detalle de un médico | Recepcionista |
| PUT/PATCH | `/api/v1/medicos/{id}/` | Actualizar datos de un médico | Recepcionista |
| DELETE | `/api/v1/medicos/{id}/` | Eliminar un médico | Recepcionista |
| GET | `/api/v1/medicos/{id}/disponibilidad/` | Consultar disponibilidad del médico | Recepcionista |

## Horarios Médicos (`/api/v1/horarios-medicos/`)

| Método | Endpoint | Descripción | Rol |
|---|---|---|---|
| GET | `/api/v1/horarios-medicos/` | Listar horarios | Admin |
| POST | `/api/v1/horarios-medicos/` | Crear horario | Admin |
| GET | `/api/v1/horarios-medicos/{id}/` | Detalle de horario | Admin |
| PUT/PATCH | `/api/v1/horarios-medicos/{id}/` | Actualizar horario | Admin |
| DELETE | `/api/v1/horarios-medicos/{id}/` | Eliminar horario | Admin |

## Citas (`/api/v1/citas/`)

| Método | Endpoint | Descripción | Rol |
|---|---|---|---|
| GET | `/api/v1/citas/` | Listar citas | Recepcionista |
| POST | `/api/v1/citas/` | Agendar nueva cita (valida solapamiento) | Recepcionista |
| GET | `/api/v1/citas/{id}/` | Detalle de cita | Recepcionista |
| PUT/PATCH | `/api/v1/citas/{id}/` | Actualizar cita | Recepcionista |
| DELETE | `/api/v1/citas/{id}/` | Cancelar cita | Recepcionista |

## Emergencias (`/api/v1/emergencias/`)

| Método | Endpoint | Descripción | Rol |
|---|---|---|---|
| GET | `/api/v1/emergencias/` | Listar emergencias | Recepcionista, Médico |
| POST | `/api/v1/emergencias/` | Registrar emergencia con triage | Recepcionista, Médico |
| GET | `/api/v1/emergencias/{id}/` | Detalle de emergencia | Recepcionista, Médico |
| PUT/PATCH | `/api/v1/emergencias/{id}/` | Actualizar emergencia | Recepcionista, Médico |
| DELETE | `/api/v1/emergencias/{id}/` | Eliminar emergencia | Recepcionista, Médico |

## Tarifas de Habitación (`/api/v1/tarifas-habitacion/`)

| Método | Endpoint | Descripción | Rol |
|---|---|---|---|
| GET | `/api/v1/tarifas-habitacion/` | Listar tarifas | Admin |
| POST | `/api/v1/tarifas-habitacion/` | Crear tarifa | Admin |
| GET | `/api/v1/tarifas-habitacion/{id}/` | Detalle de tarifa | Admin |
| PUT/PATCH | `/api/v1/tarifas-habitacion/{id}/` | Actualizar tarifa | Admin |
| DELETE | `/api/v1/tarifas-habitacion/{id}/` | Eliminar tarifa | Admin |

## Camas (`/api/v1/camas/`)

| Método | Endpoint | Descripción | Rol |
|---|---|---|---|
| GET | `/api/v1/camas/` | Listar todas las camas | Médico, Enfermera |
| POST | `/api/v1/camas/` | Registrar nueva cama | Médico, Enfermera |
| GET | `/api/v1/camas/{id}/` | Detalle de cama | Médico, Enfermera |
| PUT/PATCH | `/api/v1/camas/{id}/` | Actualizar cama | Médico, Enfermera |
| DELETE | `/api/v1/camas/{id}/` | Eliminar cama | Médico, Enfermera |
| GET | `/api/v1/camas/disponibles/` | Listar solo camas disponibles | Médico, Enfermera |

## Hospitalizaciones (`/api/v1/hospitalizaciones/`)

| Método | Endpoint | Descripción | Rol |
|---|---|---|---|
| GET | `/api/v1/hospitalizaciones/` | Listar hospitalizaciones | Médico |
| POST | `/api/v1/hospitalizaciones/` | Registrar hospitalización | Médico |
| GET | `/api/v1/hospitalizaciones/{id}/` | Detalle de hospitalización | Médico |
| PUT/PATCH | `/api/v1/hospitalizaciones/{id}/` | Actualizar hospitalización | Médico |
| DELETE | `/api/v1/hospitalizaciones/{id}/` | Eliminar hospitalización | Médico |
| POST | `/api/v1/hospitalizaciones/{id}/alta/` | Dar de alta al paciente (libera cama) | Médico |

## Historiales Clínicos (`/api/v1/historiales/`)

| Método | Endpoint | Descripción | Rol |
|---|---|---|---|
| GET | `/api/v1/historiales/` | Listar historiales | Médico |
| POST | `/api/v1/historiales/` | Crear historial clínico | Médico |
| GET | `/api/v1/historiales/{id}/` | Detalle de historial | Médico |
| PUT/PATCH | `/api/v1/historiales/{id}/` | Actualizar historial | Médico |
| DELETE | `/api/v1/historiales/{id}/` | Eliminar historial | Médico |
| POST | `/api/v1/historiales/{id}/recetas/` | Agregar receta al historial | Médico |
| POST | `/api/v1/historiales/{id}/examenes/` | Solicitar examen de laboratorio | Médico |

## Exámenes de Laboratorio (`/api/v1/examenes/`)

| Método | Endpoint | Descripción | Rol |
|---|---|---|---|
| GET | `/api/v1/examenes/` | Listar exámenes | Técnico Lab |
| POST | `/api/v1/examenes/` | Crear examen | Técnico Lab |
| GET | `/api/v1/examenes/{id}/` | Detalle de examen | Técnico Lab |
| PUT/PATCH | `/api/v1/examenes/{id}/` | Actualizar examen | Técnico Lab |
| DELETE | `/api/v1/examenes/{id}/` | Eliminar examen | Técnico Lab |
| PATCH | `/api/v1/examenes/{id}/resultado/` | Registrar resultado del examen | Técnico Lab |

## Proveedores (`/api/v1/proveedores/`)

| Método | Endpoint | Descripción | Rol |
|---|---|---|---|
| GET | `/api/v1/proveedores/` | Listar proveedores | Farmacéutico |
| POST | `/api/v1/proveedores/` | Registrar proveedor | Farmacéutico |
| GET | `/api/v1/proveedores/{id}/` | Detalle de proveedor | Farmacéutico |
| PUT/PATCH | `/api/v1/proveedores/{id}/` | Actualizar proveedor | Farmacéutico |
| DELETE | `/api/v1/proveedores/{id}/` | Eliminar proveedor | Farmacéutico |

## Medicamentos (`/api/v1/medicamentos/`)

| Método | Endpoint | Descripción | Rol |
|---|---|---|---|
| GET | `/api/v1/medicamentos/` | Listar medicamentos | Farmacéutico |
| POST | `/api/v1/medicamentos/` | Registrar medicamento | Farmacéutico |
| GET | `/api/v1/medicamentos/{id}/` | Detalle de medicamento | Farmacéutico |
| PUT/PATCH | `/api/v1/medicamentos/{id}/` | Actualizar medicamento | Farmacéutico |
| DELETE | `/api/v1/medicamentos/{id}/` | Eliminar medicamento | Farmacéutico |
| GET | `/api/v1/medicamentos/alertas/` | Medicamentos con stock bajo el mínimo | Farmacéutico |

## Lotes de Medicamentos (`/api/v1/lotes-medicamentos/`)

| Método | Endpoint | Descripción | Rol |
|---|---|---|---|
| GET | `/api/v1/lotes-medicamentos/` | Listar lotes | Farmacéutico |
| POST | `/api/v1/lotes-medicamentos/` | Registrar lote | Farmacéutico |
| GET | `/api/v1/lotes-medicamentos/{id}/` | Detalle de lote | Farmacéutico |
| PUT/PATCH | `/api/v1/lotes-medicamentos/{id}/` | Actualizar lote | Farmacéutico |
| DELETE | `/api/v1/lotes-medicamentos/{id}/` | Eliminar lote | Farmacéutico |

## Recetas (`/api/v1/recetas/`)

| Método | Endpoint | Descripción | Rol |
|---|---|---|---|
| GET | `/api/v1/recetas/` | Listar recetas | Farmacéutico |
| GET | `/api/v1/recetas/{id}/` | Detalle de receta | Farmacéutico |
| GET | `/api/v1/recetas/pendientes/` | Recetas pendientes de despacho | Farmacéutico |
| POST | `/api/v1/recetas/{id}/despachar/` | Despachar receta (descuenta stock FIFO) | Farmacéutico |

## Compras (`/api/v1/compras/`)

| Método | Endpoint | Descripción | Rol |
|---|---|---|---|
| GET | `/api/v1/compras/` | Listar compras | Farmacéutico |
| POST | `/api/v1/compras/` | Registrar compra atómica (compra + lote + detalle) | Farmacéutico |
| GET | `/api/v1/compras/{id}/` | Detalle de compra | Farmacéutico |
| PUT/PATCH | `/api/v1/compras/{id}/` | Actualizar compra | Farmacéutico |
| DELETE | `/api/v1/compras/{id}/` | Eliminar compra | Farmacéutico |

## Config. Impuestos (`/api/v1/facturas/config-impuesto/`)

| Método | Endpoint | Descripción | Rol |
|---|---|---|---|
| GET | `/api/v1/facturas/config-impuesto/` | Listar configuraciones de impuesto | Admin, Cajero |
| POST | `/api/v1/facturas/config-impuesto/` | Crear configuración | Admin |
| GET | `/api/v1/facturas/config-impuesto/{id}/` | Detalle de configuración | Admin, Cajero |
| PUT/PATCH | `/api/v1/facturas/config-impuesto/{id}/` | Actualizar configuración | Admin |
| DELETE | `/api/v1/facturas/config-impuesto/{id}/` | Eliminar configuración | Admin |

## Facturas (`/api/v1/facturas/`)

| Método | Endpoint | Descripción | Rol |
|---|---|---|---|
| GET | `/api/v1/facturas/` | Listar facturas (filtrable por estado_pago) | Cajero |
| POST | `/api/v1/facturas/` | Crear factura manualmente | Cajero |
| GET | `/api/v1/facturas/{id}/` | Detalle de factura con líneas y pagos | Cajero |
| PUT/PATCH | `/api/v1/facturas/{id}/` | Actualizar factura | Cajero |
| DELETE | `/api/v1/facturas/{id}/` | Eliminar factura | Cajero |
| POST | `/api/v1/facturas/consolidar/` | Consolidar cargos en una factura automática | Cajero |
| POST | `/api/v1/facturas/{id}/pagos/` | Registrar pago parcial o total | Cajero |
| GET | `/api/v1/facturas/{id}/pagos-lista/` | Listar todos los pagos de una factura | Cajero |

## Auditoría (`/api/v1/auditoria/`)

| Método | Endpoint | Descripción | Rol |
|---|---|---|---|
| GET | `/api/v1/auditoria/` | Listar registros de auditoría (filtrable) | Admin |
| GET | `/api/v1/auditoria/{id}/` | Detalle de registro | Admin |

!!! info "Solo Lectura"
    El módulo de auditoría es estrictamente de solo lectura (`ReadOnlyModelViewSet`). Los registros son creados automáticamente por triggers de MySQL.

## Reportes (`/api/v1/reportes/`)

| Método | Endpoint | Descripción | Rol |
|---|---|---|---|
| GET | `/api/v1/reportes/pacientes-por-especialidad/` | Reporte de pacientes agrupados por especialidad | Director |
| GET | `/api/v1/reportes/consumo-medicamentos/` | Reporte de consumo de medicamentos | Director |
| GET | `/api/v1/reportes/ingresos/` | Reporte de ingresos financieros | Director |

!!! tip "Exportación"
    Todos los reportes soportan exportación a **Excel** (.xlsx) y **CSV** añadiendo el parámetro `?formato=excel` o `?formato=csv` en la URL.
