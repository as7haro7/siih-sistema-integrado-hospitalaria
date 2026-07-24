# Manual de Usuario

Bienvenido al Manual de Usuario de la plataforma. Este documento te guiará en el uso diario de la plataforma de acuerdo al rol que desempeñas en la clínica.

---

## 1. Introducción y Acceso

### Iniciar Sesión
1. Ingresa a la URL del sistema en tu navegador web.
2. En la pantalla de bienvenida, ingresa tu **Usuario** y **Contraseña**.
3. Haz clic en el botón **Ingresar**.
4. El sistema te redirigirá a tu **Dashboard (Tablero Principal)**.

### El Dashboard
El Dashboard es tu pantalla principal. Su contenido varía dependiendo de tu rol:
- Si eres **Recepcionista**, verás las citas agendadas para hoy y emergencias activas.
- Si eres **Médico**, verás a los pacientes que esperan consulta y tus pacientes hospitalizados.
- Si eres **Farmacéutico**, verás alertas de stock bajo y recetas por despachar.
- Si eres **Cajero**, verás el volumen de facturas pendientes de cobro.

Puedes navegar por los módulos del sistema utilizando el **Menú Lateral (Sidebar)** ubicado a la izquierda.

---

## 2. Módulo de Recepción (Para Recepcionistas)

Este módulo permite gestionar el ingreso de pacientes al hospital.

### Gestión de Pacientes
- **Registrar Paciente:** Ve a *Recepción > Pacientes* y haz clic en **Nuevo Paciente**. Llena los datos personales y de contacto.
- **Buscar Paciente:** En la lista de pacientes, usa la barra de búsqueda para encontrar rápidamente a alguien por su nombre o cédula.

### Agendamiento de Citas
- **Nueva Cita:** Ve a *Recepción > Citas > Nueva Cita*.
- Selecciona el paciente (puedes buscarlo por nombre).
- Selecciona la **Especialidad** y el **Médico**.
- Escoge una fecha para ver los **Horarios Disponibles** (bloques de 30 minutos).
- Selecciona un horario y confirma la cita.

### Emergencias (Triage)
- Cuando llega una emergencia, ve a *Recepción > Emergencias > Registrar*.
- Asigna un **Nivel de Triage** (Rojo, Naranja, Amarillo, Verde, Azul). Esto definirá la prioridad de atención para los médicos.

---

## 3. Módulo Médico y Enfermería

Destinado a Médicos y Enfermeras para el seguimiento clínico de los pacientes.

### Consultorio (Atención Directa)
- Ve a *Médico > Consultorio*.
- Selecciona al paciente desde el desplegable de **Citas de hoy** o búscalo directamente.
- Podrás ver su **Historial Médico** pasado y crear un nuevo registro detallando: *Motivo de consulta, Diagnóstico y Tratamiento*.

### Recetas y Exámenes
- Desde el historial de un paciente, haz clic en **Emitir Receta** para prescribir medicamentos (se envían directo a farmacia).
- Haz clic en **Solicitar Examen** para pedir pruebas de laboratorio (se envían directo a la cola del laboratorio).

### Camas y Hospitalizaciones
- **Mapa de Camas:** Ve a *Médico > Camas* para ver un mapa visual (Verde = Disponible, Rojo = Ocupada, Amarillo = Mantenimiento).
- **Internar Paciente:** Ve a *Hospitalizaciones > Nueva*. Selecciona el paciente, el médico responsable y una cama disponible.
- **Alta Médica:** En la lista de hospitalizaciones, selecciona el paciente y presiona **Dar de Alta** para liberar su cama y enviar los cargos a caja.

---

## 4. Módulo de Laboratorio

Uso exclusivo para Técnicos de Laboratorio.

- **Cola de Pendientes:** Ve a *Laboratorio > Exámenes*. Verás una lista de todos los exámenes solicitados por los médicos que aún no han sido procesados.
- **Cargar Resultado:** Haz clic en el examen correspondiente, redacta el resultado en el cuadro de texto, cambia el estado a **Completado** y guarda. El médico podrá verlo inmediatamente en el historial del paciente.

---

## 5. Módulo de Farmacia

Destinado a Farmacéuticos para el control de inventarios y despacho de medicamentos.

### Alertas e Inventario
- El sistema te avisará con **Alertas Rojas** si un medicamento está por debajo del stock mínimo.
- Ve a *Farmacia > Medicamentos* para ver el catálogo. El sistema actualiza el stock automáticamente; tú no tienes que cambiar los números a mano.

### Compras a Proveedores
- Para reabastecer stock, ve a *Farmacia > Compras > Nueva*.
- Registra el proveedor, el medicamento, el número de lote, la cantidad comprada y la fecha de vencimiento. Esto sumará el inventario automáticamente.

### Despacho de Recetas
- Ve a *Farmacia > Recetas Pendientes*.
- Verás las medicinas prescritas por los médicos. Al hacer clic en **Despachar**, el sistema descontará la medicina automáticamente del lote más antiguo (regla FIFO).

---

## 6. Módulo de Caja (Facturación)

Uso exclusivo para Cajeros.

### Consolidación de Facturas
El sistema es automático. No necesitas teclear cada servicio cobrado.
- Ve a *Caja > Facturas > Consolidar*.
- Selecciona el Historial o la Hospitalización del paciente.
- El sistema calculará el costo de: *Consultas + Medicamentos Despachados + Exámenes Realizados + Días de Habitación*.
- Ingresa el NIT y Nombre de Factura para generarla.

### Cobros
- En la lista de Facturas, selecciona una que esté en estado **Pendiente**.
- Haz clic en **Registrar Pago**. Puedes recibir el pago en Efectivo, Tarjeta, Seguro, etc.
- La barra de progreso de pago se llenará. Si pagan todo, la factura pasará a estado **Pagado**.

---

## 7. Administración y Reportes

Exclusivo para Directores y Administradores.

### Reportes Estratégicos (MIS)
Ve a la sección *Reportes* en el menú para consultar:
- **Ingresos Financieros:** Cuánto se ha facturado y cobrado.
- **Pacientes por Especialidad:** Cuáles áreas tienen más demanda.
- **Consumo de Medicamentos:** Qué medicinas rotan más.
- *Tip:* Todos los reportes se pueden descargar en Excel o CSV para un análisis más profundo.

### Auditoría (Admin)
- Si un usuario borra o edita registros de forma errónea, el Administrador puede ir a *Administración > Auditoría* para ver un registro detallado (quién, qué y a qué hora hizo el cambio en el sistema).
