# Backend SIIH Completado

## Estructura del proyecto

```
siih/
├── manage.py
├── requirements.txt
├── config/                    ← Settings, URLs raíz, WSGI
├── accounts/                  ← Auth JWT, RBAC, gestión de usuarios
├── pacientes/                 ← PACIENTE (con alergias), REGISTRO_BAJA
├── personal_medico/           ← MEDICO, ESPECIALIDAD, HORARIO_MEDICO
├── citas/                     ← CITA + validación anti-solapamiento
├── emergencias/               ← EMERGENCIA con triage
├── hospitalizacion/           ← CAMA, HOSPITALIZACION, TARIFA_HABITACION
├── clinico/                   ← HISTORIAL_CLINICO, CATALOGO_CIE10
├── laboratorio/               ← EXAMEN_LABORATORIO (con indicaciones_medicas)
├── farmacia/                  ← MEDICAMENTO, LOTE_MEDICAMENTO, PROVEEDOR, COMPRA, RECETA
├── facturacion/               ← FACTURA, FACTURA_DETALLE, PAGO, CONFIG_IMPUESTO
├── auditoria/                 ← AUDITORIA_SISTEMA (solo lectura)
└── reportes/                  ← Export Excel/CSV con Pandas
```
## Endpoints implementados (~36 endpoints)

| Prefijo | Endpoints | Rol principal |
|---|---|---|
| `/api/v1/auth/` | `login/`, `refresh/` | Público |
| `/api/v1/usuarios/` | CRUD + `{id}/roles/` | Admin |
| `/api/v1/pacientes/` | CRUD + `cedula/{cedula}/`, `{id}/historial/`, `{id}/baja/` | Recepcionista |
| `/api/v1/especialidades/` | CRUD | Admin |
| `/api/v1/medicos/` | CRUD + `{id}/disponibilidad/` | Recepcionista |
| `/api/v1/horarios-medicos/` | CRUD | Admin |
| `/api/v1/citas/` | CRUD (valida solapamiento) | Recepcionista |
| `/api/v1/emergencias/` | CRUD (con triage) | Recepcionista, Médico |
| `/api/v1/tarifas-habitacion/` | CRUD | Admin |
| `/api/v1/camas/` | CRUD + `disponibles/` | Médico, Enfermera |
| `/api/v1/hospitalizaciones/` | CRUD + `{id}/alta/` | Médico |
| `/api/v1/historiales/` | CRUD + `{id}/recetas/`, `{id}/examenes/` | Médico |
| `/api/v1/catalogo-cie10/` | Solo lectura (filtrable) | Médico, Enfermera |
| `/api/v1/examenes/` | CRUD + `{id}/resultado/` | Técnico Lab |
| `/api/v1/proveedores/` | CRUD | Farmacéutico |
| `/api/v1/medicamentos/` | CRUD + `alertas/` | Farmacéutico |
| `/api/v1/lotes-medicamentos/` | CRUD | Farmacéutico |
| `/api/v1/recetas/` | Lista + `pendientes/`, `{id}/despachar/` | Farmacéutico |
| `/api/v1/compras/` | CRUD (atómico: compra+lote+detalle) | Farmacéutico |
| `/api/v1/facturas/config-impuesto/` | CRUD | Admin, Cajero |
| `/api/v1/facturas/` | CRUD + `consolidar/`, `{id}/pagos/`, `{id}/pagos-lista/` | Cajero |
| `/api/v1/auditoria/` | Solo lectura (filtrable) | Admin |
| `/api/v1/reportes/` | 3 reportes con export Excel/CSV | Director |


---

## Cómo iniciar

```bash
# 1. Ejecutar db.sql en MySQL
mysql -u root < db.sql

# 2. Instalar dependencias
cd backend_siih
pip install -r requirements.txt

# 3. Migrar tablas de Django (auth, sessions, etc.)
python manage.py migrate

# 4. Crear roles del sistema
python manage.py crear_roles

# 5. Crear superusuario admin
python manage.py createsuperuser

# 6. Iniciar el servidor
python manage.py runserver
```

> [!TIP]
> **Documentación Interactiva:**
> - **Swagger UI:** `http://localhost:8000/api/docs/`
> - **ReDoc:** `http://localhost:8000/api/redoc/`
> - **Esquema OpenAPI:** `http://localhost:8000/api/schema/`
> 
> Además, el API browsable de DRF está disponible directamente en las rutas de los endpoints, ej. `http://localhost:8000/api/v1/`.

## Ejecución de Pruebas (Tests)

Para ejecutar las pruebas del sistema asegúrate de tener tu entorno virtual activado. Debido a que algunas tablas no son administradas por Django (`managed = False`), el proyecto está configurado para utilizar transacciones sobre la misma base de datos de desarrollo sin eliminar tus datos reales.

1. Asegúrate de tener tu entorno virtual activo:
   ```bash
   # En Windows:
   .\venv\Scripts\activate
   ```

2. Para ejecutar **todas** las pruebas del proyecto:
   ```bash
   python manage.py test
   ```

3. Para ejecutar pruebas de un **módulo específico**, utiliza el nombre del módulo. Aquí tienes la lista de todos los comandos posibles para cada módulo del sistema:
   ```bash
   python manage.py test accounts
   python manage.py test auditoria
   python manage.py test citas
   python manage.py test clinico
   python manage.py test emergencias
   python manage.py test facturacion
   python manage.py test farmacia
   python manage.py test hospitalizacion
   python manage.py test laboratorio
   python manage.py test pacientes
   python manage.py test personal_medico
   python manage.py test reportes
   ```

## Cambios recientes (campos y tablas añadidos)

- `pacientes.PACIENTE`: nuevo campo `alergias` (`TEXT`, `null=True`, `blank=True`).
- `laboratorio.EXAMEN_LABORATORIO`: nuevo campo `indicaciones_medicas` (`TEXT`, `null=True`, `blank=True`).
- `clinico.CATALOGO_CIE10`: nueva tabla `CATALOGO_CIE10` (`id_cie10`, `codigo`, `descripcion`).
- `clinico.HISTORIAL_CLINICO`: nueva relación `id_cie10` → `CATALOGO_CIE10` (FK, `null=True`, `db_column='id_cie10'`).

Estas modificaciones exponen nuevos datos en los endpoints correspondientes (`/api/v1/pacientes/`, `/api/v1/examenes/`, `/api/v1/historiales/` y el catálogo `/api/v1/catalogo-cie10/`).
