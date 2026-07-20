# Documentación y Consumo del API

El proyecto incluye interfaces automáticas y explorables de documentación para que el equipo Frontend u otros desarrolladores puedan integrar la API sin necesidad de leer el código fuente.

## Interfaces Generadas por DRF-Spectacular

Aprovechando el estándar OpenAPI 3, la librería `drf-spectacular` provee rutas de documentación en tiempo real que inspeccionan los serializadores y viewsets.

### 1. Swagger UI
- **URL:** `http://localhost:8000/api/docs/`
- **Uso:** Es la interfaz más versátil. Te permite ver todos los endpoints disponibles (agrupados por prefijo), leer su esquema esperado y, fundamentalmente, probar las peticiones directamente desde la web presionando *"Try it out"*.
- *Nota:* Para probar rutas protegidas, primero utiliza el endpoint `/api/v1/auth/login/` en Swagger, copia tu token, presiona el botón **"Authorize"** (candado) e introduce: `Bearer <tu_token>`.

### 2. ReDoc
- **URL:** `http://localhost:8000/api/redoc/`
- **Uso:** Presenta la misma información de esquema que Swagger pero enfocada en la lectura lineal y profesional. Es ideal para leer la documentación de corrido, aunque no permite enviar peticiones interactivas.

### 3. Esquema OpenAPI RAW (JSON/YAML)
- **URL:** `http://localhost:8000/api/schema/`
- **Uso:** Emite el esquema crudo estandarizado. Puede ser usado para autogenerar clientes HTTP en JavaScript, TypeScript u otros lenguajes usando generadores automáticos.

## El API Browsable nativo de DRF

Adicionalmente, debido a que se usa Django REST Framework, si navegas a cualquier ruta válida de la API (ej. `http://localhost:8000/api/v1/pacientes/`) directamente desde tu navegador web, DRF detectará la cabecera HTML y renderizará el **"Browsable API"**.

Desde allí podrás ver los datos renderizados (si tienes sesión iniciada como superusuario), e interactuar rellenando un formulario HTML equivalente a la petición POST o PATCH necesaria.
