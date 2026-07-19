# Backend SIIH Completado

## Estructura del proyecto

```
siih/
├── manage.py
├── requirements.txt
├── config/                    ← Settings, URLs raíz, WSGI
├── accounts/                  ← Auth JWT, RBAC, gestión de usuarios
├── pacientes/                 ← PACIENTE, REGISTRO_BAJA
├── personal_medico/           ← MEDICO, ESPECIALIDAD, HORARIO_MEDICO
├── citas/                     ← CITA + validación anti-solapamiento
├── emergencias/               ← EMERGENCIA con triage
├── hospitalizacion/           ← CAMA, HOSPITALIZACION, TARIFA_HABITACION
├── clinico/                   ← HISTORIAL_CLINICO
├── laboratorio/               ← EXAMEN_LABORATORIO
├── farmacia/                  ← Inventario completo + FIFO
├── facturacion/               ← Facturación + pagos + consolidación
├── auditoria/                 ← AUDITORIA_SISTEMA (solo lectura)
└── reportes/                  ← Export Excel/CSV con Pandas
```
## Endpoints implementados (~35 endpoints)

| Prefijo | Endpoints | Rol principal |
|---|---|---|
| `/api/v1/auth/` | `login/`, `refresh/` | Público |
| `/api/v1/usuarios/` | CRUD + `{id}/roles/` | Admin |
| `/api/v1/pacientes/` | CRUD + `{id}/historial/`, `{id}/baja/` | Recepcionista |
| `/api/v1/especialidades/` | CRUD | Admin |
| `/api/v1/medicos/` | CRUD + `{id}/disponibilidad/` | Recepcionista |
| `/api/v1/horarios-medicos/` | CRUD | Admin |
| `/api/v1/citas/` | CRUD (valida solapamiento) | Recepcionista |
| `/api/v1/emergencias/` | CRUD (con triage) | Recepcionista, Médico |
| `/api/v1/tarifas-habitacion/` | CRUD | Admin |
| `/api/v1/camas/` | CRUD + `disponibles/` | Médico, Enfermera |
| `/api/v1/hospitalizaciones/` | CRUD + `{id}/alta/` | Médico |
| `/api/v1/historiales/` | CRUD + `{id}/recetas/`, `{id}/examenes/` | Médico |
| `/api/v1/examenes/` | CRUD + `{id}/resultado/` | Técnico Lab |
| `/api/v1/medicamentos/` | CRUD + `alertas/` | Farmacéutico |
| `/api/v1/recetas/` | Lista + `pendientes/`, `{id}/despachar/` | Farmacéutico |
| `/api/v1/compras/` | CRUD (atómico: compra+lote+detalle) | Farmacéutico |
| `/api/v1/facturas/` | CRUD + `consolidar/`, `{id}/pagos/` | Cajero |
| `/api/v1/auditoria/` | Solo lectura (filtrable) | Admin |
| `/api/v1/reportes/` | 3 reportes con export Excel/CSV | Director |


---

## Cómo iniciar

```bash
# 1. Ejecutar db.sql en MySQL
mysql -u root < db.sql

# 2. Instalar dependencias
cd siih
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
> El API browsable de DRF está disponible en `http://localhost:8000/api/v1/` para probar endpoints directamente desde el navegador.
