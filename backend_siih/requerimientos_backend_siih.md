# Requerimientos del Backend — SIIH (Sistema Integrado de Información Hospitalaria)
### Hospital Universitario San Andrés — UMSA / Inf-266

> Este documento consolida el Informe Técnico del proyecto (RF/RNF, casos de uso,
> HU, RBAC) con el esquema de base de datos validado en MySQL, y lo traduce a
> requerimientos concretos para construir el backend en **Django**. Donde el
> esquema validado difiere del informe original, se indica explícitamente.

---

## 1. Stack tecnológico confirmado

| Componente | Tecnología | Notas |
|---|---|---|
| Backend / API | Python 3.x + Django + Django REST Framework (DRF) | El informe menciona "Django Templates" como frontend; se recomienda **separar** en API REST (DRF) + frontend independiente, para no acoplar la lógica al renderizado. Confirmar con el equipo si el frontend final es Django Templates o un SPA aparte. |
| Autenticación | JWT (`djangorestframework-simplejwt`) | Reemplaza la tabla manual `USUARIO_PACIENTE` del informe: se usa el modelo `User` nativo de Django + `Group` para roles, evitando reinventar hash/salt/MFA a mano. |
| Base de datos | MySQL 8.0+ | Confirmado en la tabla "Tecnologías a utilizar" del informe. Los diagramas de secuencia/despliegue mencionan PostgreSQL — se asume error de plantilla y se descarta a favor de MySQL. |
| Administración | Django Admin | Cubre HU-01 (gestión de roles) y el panel administrativo sin desarrollo adicional. |
| Servidor | Nginx (proxy inverso) + Gunicorn (WSGI) sobre Linux | Como en el informe. |
| Reportes | Pandas (export a Excel/CSV) | Para el módulo MIS (RF y HU-08). |

---

## 2. Diseño de base de datos: qué cambia respecto al informe

Se optó por el **esquema mejorado** (`db_clinica_siih.sql`, ya validado en MariaDB/MySQL) en vez del diseño literal del informe. Diferencias a tener presentes al documentar el proyecto:

| Aspecto | Informe original | Esquema adoptado (este backend) |
|---|---|---|
| PK de paciente | `cedula_paciente` (VARCHAR) | `id_paciente` (INT autoincrement); `cedula_paciente` queda `UNIQUE` y nullable |
| Autenticación | Tabla manual `USUARIO_PACIENTE` + `AUDITORIA_USUARIO_PACIENTE` | Modelo `User` de Django + `Group` (roles) + JWT. La auditoría de login se implementa con una señal (`user_logged_in`/`user_login_failed`) hacia `AUDITORIA_SISTEMA` |
| Habitaciones/camas | Campos de texto libre en `HOSPITALIZACION` | Tabla `CAMA` con estado (`Disponible`/`Ocupada`/`Mantenimiento`) |
| Inventario de farmacia | Un solo `fecha_vencimiento` por medicamento | `LOTE_MEDICAMENTO` (vencimiento por lote, despacho FIFO) + `COMPRA`/`COMPRA_DETALLE`/`PROVEEDOR` |
| Pagos | Un solo campo `estado_pago` en `FACTURA` | Tabla `PAGO` (pagos parciales, múltiples métodos) |
| Auditoría | Solo `AUDITORIA_HISTORIAL` | `AUDITORIA_SISTEMA` genérica (cualquier tabla) |
| Vocabularios (estados, triage, etc.) | `VARCHAR` libre | `ENUM` en MySQL / `choices` en Django |

Todas las reglas mencionadas en la sección 7.5 del informe (stock nunca negativo, fecha_vencimiento > fecha actual, no solapamiento de citas) ya están implementadas como `CHECK` constraints, `UNIQUE` constraints y triggers en el script SQL validado — el backend debe replicarlas también en la capa de validación de Django (ver sección 6) para dar mensajes de error claros antes de que la base de datos las rechace.

---

## 3. Estructura de apps de Django propuesta

```
siih/
├── config/                # settings, urls raíz, wsgi/asgi
├── accounts/               # User custom (o profile 1-1), roles/Groups, JWT views
├── pacientes/               # PACIENTE, REGISTRO_BAJA
├── personal_medico/          # MEDICO, ESPECIALIDAD, HORARIO_MEDICO
├── citas/                   # CITA
├── emergencias/              # EMERGENCIA
├── hospitalizacion/           # CAMA, HOSPITALIZACION, TARIFA_HABITACION
├── clinico/                 # HISTORIAL_CLINICO
├── laboratorio/              # EXAMEN_LABORATORIO
├── farmacia/                # MEDICAMENTO, LOTE_MEDICAMENTO, RECETA_DETALLE,
│                             PROVEEDOR, COMPRA, COMPRA_DETALLE
├── facturacion/              # CONFIG_IMPUESTO, FACTURA, FACTURA_DETALLE, PAGO
├── auditoria/                # AUDITORIA_SISTEMA (solo lectura vía API)
└── reportes/                 # endpoints de exportación (Pandas) para MIS
```

Cada app: `models.py` (mapeo 1 a 1 con las tablas SQL, usando `managed = False`
si se decide mantener las migraciones controladas por el script SQL, o
`managed = True` si Django controla el esquema vía `migrate` — **decisión
pendiente**, ver sección 8).

---

## 4. Roles y control de acceso (RBAC)

Roles = `Group` de Django, asignados por el Administrador vía Django Admin o un endpoint dedicado (HU-01).

| Rol | Alcance principal |
|---|---|
| Administrador | Gestión total de usuarios, roles, catálogos (`CONFIG_IMPUESTO`, `ESPECIALIDAD`), auditoría |
| Recepcionista | CRUD de `PACIENTE`, `CITA`; lectura de `MEDICO` |
| Médico | Lectura/escritura de `HISTORIAL_CLINICO`, `RECETA_DETALLE`, `EXAMEN_LABORATORIO` (solicitud); lectura de `CITA`, `HOSPITALIZACION` propias |
| Enfermera | Lectura de `HISTORIAL_CLINICO`, `PACIENTE`; lectura/actualización de `HOSPITALIZACION` (evolución) |
| Técnico de Laboratorio | Lectura de órdenes pendientes; escritura de `resultado_texto` y `estado_examen` en `EXAMEN_LABORATORIO` |
| Farmacéutico | CRUD de `MEDICAMENTO`, `LOTE_MEDICAMENTO`, `COMPRA`; actualización de `estado_despacho` en `RECETA_DETALLE` |
| Cajero | CRUD de `FACTURA`, `FACTURA_DETALLE`, `PAGO`; lectura de cargos consolidados |
| Director (MIS) | Solo lectura + acceso a `reportes/` (export Excel/CSV) |
| Paciente (portal, alcance futuro) | Lectura de su propio historial/resultados; creación de solicitudes de cita — **fuera del alcance de los 4 sprints actuales**, según el informe (HU no lo prioriza en Sprint 1-4) |

Implementación sugerida: permisos por vista con `DjangoModelPermissions` + un
`permission_class` custom que valide el `Group` contra la tabla de arriba,
más filtros de "solo mis registros" donde el informe lo marca con `*`
(ej. un médico solo edita historiales que él mismo abrió).

---

## 5. Requerimientos funcionales → endpoints de API

### 5.1 Pacientes y Admisión (RF-01, RF-02 · HU-02)

| Endpoint | Método | Rol | Descripción |
|---|---|---|---|
| `/api/pacientes/` | GET, POST | Recepcionista, Admin | Listar / registrar paciente. Debe validar `cedula_paciente` única antes de guardar (409 si existe) |
| `/api/pacientes/{id}/` | GET, PATCH | Recepcionista, Médico (lectura), Admin | Detalle / edición |
| `/api/pacientes/{id}/historial/` | GET | Médico, Enfermera | Historial clínico completo del paciente (RF-02: acceso inmediato) |
| `/api/pacientes/{id}/baja/` | POST | Recepcionista, Admin | Crea `REGISTRO_BAJA` y dispara actualización de `estado_baja` |

### 5.2 Citas (RF-03, RF-04 · HU-03)

| Endpoint | Método | Rol | Descripción |
|---|---|---|---|
| `/api/citas/` | GET, POST | Recepcionista | Crear cita. **Debe verificar disponibilidad antes de insertar** (ver 6.1) y devolver 409 si hay solapamiento, replicando el `UNIQUE(id_medico, fecha_cita, hora_cita)` de la BD con un mensaje claro |
| `/api/citas/{id}/` | PATCH | Recepcionista | Cambiar `estado_cita` (Confirmada/Cancelada/Atendida/No Asistió) |
| `/api/medicos/{id}/disponibilidad/?fecha=` | GET | Recepcionista | Consulta horarios libres cruzando `HORARIO_MEDICO` con `CITA` existentes |

### 5.3 Consulta clínica (RF-02, RF-07 · HU-04, HU-05)

| Endpoint | Método | Rol | Descripción |
|---|---|---|---|
| `/api/historiales/` | POST | Médico | Crea `HISTORIAL_CLINICO`; debe forzar que venga ligado a `id_cita`, `id_hospitalizacion` o `id_emergencia` (regla ya reforzada por `CHECK` en BD) |
| `/api/historiales/{id}/recetas/` | POST | Médico | Emitir receta (`RECETA_DETALLE`, estado inicial `Pendiente`) |
| `/api/historiales/{id}/examenes/` | POST | Médico | Solicitar examen de laboratorio |
| `/api/examenes/{id}/resultado/` | PATCH | Técnico de Laboratorio | Cargar `resultado_texto`, cambiar `estado_examen` a `Completado` |

### 5.4 Farmacia e inventario (RF-05, RF-06 · HU-06)

| Endpoint | Método | Rol | Descripción |
|---|---|---|---|
| `/api/recetas/pendientes/` | GET | Farmacéutico | Cola de despacho |
| `/api/recetas/{id}/despachar/` | POST | Farmacéutico | Cambia `estado_despacho` a `Entregado`; internamente ejecuta el descuento FIFO (espejo del trigger `trg_receta_descuenta_stock`) y devuelve alerta si el medicamento quedó bajo `stock_minimo` (RF-06) |
| `/api/medicamentos/` | GET, POST | Farmacéutico | Catálogo; `stock_actual` de solo lectura (se actualiza solo vía lotes/despachos) |
| `/api/compras/` | POST | Farmacéutico | Registrar compra + lote asociado |
| `/api/medicamentos/alertas/` | GET | Farmacéutico, Director | Medicamentos con `stock_actual <= stock_minimo` o lotes próximos a vencer |

### 5.5 Emergencias y hospitalización (HU implícita en informe, módulo E)

| Endpoint | Método | Rol | Descripción |
|---|---|---|---|
| `/api/emergencias/` | POST | Recepcionista, Médico | Registrar ingreso + triage |
| `/api/camas/disponibles/` | GET | Médico, Enfermera | Camas con `estado_cama = 'Disponible'` |
| `/api/hospitalizaciones/` | POST | Médico | Ordena internación; falla si la cama no está disponible (espejo del trigger `trg_hospitalizacion_ocupa_cama`) |
| `/api/hospitalizaciones/{id}/alta/` | POST | Médico | Registra `fecha_egreso`, libera la cama, dispara la generación de cargos hacia `FACTURA` |

### 5.6 Facturación (RF-07, RF-08 · HU-07)

| Endpoint | Método | Rol | Descripción |
|---|---|---|---|
| `/api/facturas/consolidar/{id_historial|id_hospitalizacion}/` | POST | Cajero | Arma `FACTURA` + `FACTURA_DETALLE` consolidando recetas entregadas, exámenes y días de internación (RF-08) |
| `/api/facturas/{id}/pagos/` | POST | Cajero | Registra un `PAGO`; el estado de la factura se recalcula solo (espejo de `trg_pago_actualiza_factura`) |
| `/api/facturas/{id}/` | GET | Cajero, Paciente (propia) | Detalle de factura |

### 5.7 Reportes / MIS (HU-08)

| Endpoint | Método | Rol | Descripción |
|---|---|---|---|
| `/api/reportes/pacientes-por-especialidad/` | GET | Director | Tabla + export Excel/CSV vía Pandas |
| `/api/reportes/consumo-medicamentos/` | GET | Director | Consumo mensual por medicamento |
| `/api/reportes/ingresos/` | GET | Director | Ingresos financieros consolidados por período |

### 5.8 Seguridad y auditoría (RNF R1 · HU-01)

| Endpoint | Método | Rol | Descripción |
|---|---|---|---|
| `/api/auth/login/` | POST | Público | Login → devuelve JWT (access + refresh) |
| `/api/auth/refresh/` | POST | Autenticado | Renovar access token |
| `/api/usuarios/` | GET, POST | Admin | Gestión de usuarios |
| `/api/usuarios/{id}/roles/` | PATCH | Admin | Asignar `Group` (rol) |
| `/api/auditoria/` | GET | Admin | Consulta de `AUDITORIA_SISTEMA` (solo lectura, sin endpoint de escritura manual) |

---

## 6. Reglas de negocio a replicar en la capa de servicio

La base de datos ya aplica estas reglas mediante triggers y constraints
(defensa en profundidad); el backend debe validarlas **antes** de golpear la
BD para devolver errores 4xx claros en vez de un error 500 de MySQL:

1. **No solapamiento de citas**: verificar `(id_medico, fecha_cita, hora_cita)` libre antes de insertar.
2. **Descuento FIFO de stock**: al despachar una receta, descontar de los lotes que vencen antes; si no hay stock suficiente, responder 409 con el faltante exacto.
3. **Ocupación de camas**: no permitir `POST /hospitalizaciones/` si la cama no está `Disponible`; al dar de alta, liberar la cama.
4. **Cédula única**: validar antes de insertar `PACIENTE` (aunque la BD también lo garantiza vía `UNIQUE`).
5. **Fecha de vencimiento**: rechazar lotes con `fecha_vencimiento <= fecha_ingreso`.
6. **Cálculo financiero**: `total_pagar` y `subtotal_linea` son columnas generadas en la BD — el backend **no debe recalcularlas manualmente**, solo enviar `subtotal` y `monto_impuesto`/`cantidad` y `precio_unitario`, y leer el resultado ya calculado.
7. **Historial con origen válido**: todo `HISTORIAL_CLINICO` debe venir de una cita, hospitalización o emergencia (ya forzado por `CHECK` en BD; el serializer debe exigir al menos uno de los tres antes de enviarlo).

---

## 7. Requerimientos no funcionales (del informe, con implicancia técnica)

| RNF | Requisito | Implicancia en el backend |
|---|---|---|
| R1 — Seguridad | MFA + RBAC | JWT + `django-otp` (o equivalente) para MFA en roles administrativos/clínicos; permisos por `Group` |
| R2 — Disponibilidad | Sistema crítico 24/7 | Configurar Gunicorn con múltiples workers + `systemd` con reinicio automático; backups programados de MySQL |
| R3 — Rendimiento | Consultas masivas rápidas | Usar `select_related`/`prefetch_related` en los endpoints de historial e inventario; los índices ya creados en la BD (`idx_cita_fecha`, `idx_factura_estado_pago`, etc.) deben aprovecharse en los `ORDER BY`/`WHERE` de las queries |
| R4 — Escalabilidad | Preparado para IoT a futuro | Diseñar la API con versión en la URL (`/api/v1/...`) para no romper integraciones futuras |

---

## 8. Decisiones pendientes (a confirmar con el equipo antes de programar)

- [ ] **Frontend**: ¿Django Templates (como dice el informe) o un frontend separado (React, como sugieren los diagramas de secuencia)? Afecta si DRF es necesario o si basta con vistas Django clásicas.
- [ ] **Gestión de migraciones**: ¿Django controla el esquema (`makemigrations`/`migrate`, `managed=True`) o el script SQL validado es la fuente de verdad y los modelos usan `managed=False`? Se recomienda esto último para no perder los triggers/constraints ya probados.
- [ ] **Portal del paciente**: el informe lo describe (7.7.5) pero no aparece priorizado en los Sprints 1-4. Confirmar si entra en el alcance de esta entrega o queda como trabajo futuro.
- [ ] **MFA**: el informe lo pide como RNF pero no hay detalle de mecanismo (TOTP app, SMS, correo). Definir antes de Sprint 1.
- [ ] **Reconciliar con el informe entregado**: como se adoptó el esquema mejorado, conviene actualizar la sección 7.3 del informe (o anexar un adendum) para que el diagrama E-R y las tablas coincidan con lo que realmente se va a programar.

---

## 9. Mapeo con la planificación de Sprints del informe

| Sprint | Alcance original (informe) | Ajuste por el nuevo esquema |
|---|---|---|
| 1 | BD + login JWT + RBAC | Sin cambios; agregar `Group`/roles en vez de `USUARIO_PACIENTE` |
| 2 | Admisión + agenda | Sin cambios funcionales; el registro de paciente ya no depende de la cédula como PK, así que el buscador debe indexar por `cedula_paciente` (UNIQUE) además de por `id_paciente` |
| 3 | Historial + recetas | Sin cambios |
| 4 | Triggers de inventario + caja + export Excel | El descuento de stock ahora es FIFO (más lógica que un simple `UPDATE`); dimensionar esta tarea con más tiempo del que sugiere el informe |
