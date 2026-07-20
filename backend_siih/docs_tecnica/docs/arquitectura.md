# Arquitectura del Proyecto y Módulos

El proyecto está organizado en múltiples "apps" de Django, siguiendo el principio de Responsabilidad Única (Single Responsibility Principle). Esto asegura que cada módulo controle únicamente su área funcional, facilitando el mantenimiento y escalabilidad.

## Estructura de Directorios

A continuación se muestra el esquema del árbol de directorios del proyecto y una descripción breve del rol de cada carpeta:

```text
backend_siih/
├── manage.py                  ← Script CLI principal de Django
├── requirements.txt           ← Dependencias de Python
├── config/                    ← Archivos globales (settings.py, urls.py base, wsgi/asgi)
├── accounts/                  ← Autenticación JWT y roles RBAC (Control de Acceso)
├── pacientes/                 ← Gestión de PACIENTE y REGISTRO_BAJA
├── personal_medico/           ← Catálogos de MEDICO, ESPECIALIDAD y HORARIO_MEDICO
├── citas/                     ← Gestión de CITA con lógica anti-solapamiento
├── emergencias/               ← Manejo de EMERGENCIA incluyendo niveles de triage
├── hospitalizacion/           ← Administración de CAMA, TARIFA_HABITACION y HOSPITALIZACION
├── clinico/                   ← Administración de HISTORIAL_CLINICO y recetas médicas
├── laboratorio/               ← Solicitudes y resultados de EXAMEN_LABORATORIO
├── farmacia/                  ← Inventario FIFO: MEDICAMENTO, PROVEEDOR, LOTE, COMPRA, RECETA
├── facturacion/               ← Cargos financieros: FACTURA, DETALLE, PAGO, CONFIG_IMPUESTO
├── auditoria/                 ← Tablas de sistema de solo lectura para rastrear cambios (AUDITORIA_SISTEMA)
└── reportes/                  ← Generación de exportables Excel/CSV vía Pandas
```

## Patrón de Desarrollo (ViewSets & Routers)

En lugar de utilizar vistas tradicionales de Django basadas en funciones o `APIView` para cada endpoint, el sistema hace un uso intensivo de **ModelViewSets**. 

Esto provee automáticamente las acciones estándar de creación, lectura, actualización y eliminación (CRUD).

### Ejemplo de Flujo de Petición

1. **Router (`urls.py`):** El router recibe `/api/v1/pacientes/` y lo enruta al `PacienteViewSet`.
2. **Permisos y Autenticación:** Se evalúa si el usuario porta un token JWT válido y si su rol (ej. `IsRecepcionista`) está autorizado para la acción.
3. **Serializer:** Se valida el cuerpo del JSON recibido contra el `PacienteSerializer`.
4. **Base de Datos:** Se invoca a los métodos ORM (`.save()`), lo cual a su vez puede activar Triggers en MySQL para lógica automática.
5. **Respuesta:** El Serializer emite los datos guardados de vuelta al cliente.

## Acciones Personalizadas (`@action`)

Cuando el CRUD estándar no es suficiente, se definen acciones extras decoradas con `@action`. Ejemplos en este sistema incluyen:

- `POST /api/v1/facturas/consolidar/` (consolida deudas y emite una factura nueva)
- `POST /api/v1/facturas/{id}/pagos/` (añade un abono a una factura existente)
- `GET /api/v1/camas/disponibles/` (filtra el catálogo para listar solo camas libres)
- `POST /api/v1/hospitalizaciones/{id}/alta/` (marca la salida de un paciente y libera su cama)
