# Requerimientos Técnicos

Esta sección detalla los requerimientos mínimos y recomendados de hardware y software para desplegar el backend de la Clínica SIIH.

## Requerimientos de Hardware

### Entorno de Desarrollo

| Recurso | Mínimo | Recomendado |
|---|---|---|
| **Procesador** | Dual-core 2.0 GHz | Quad-core 2.5 GHz o superior |
| **Memoria RAM** | 4 GB | 8 GB o más |
| **Almacenamiento** | 10 GB libres (HDD) | 20 GB libres (SSD) |
| **Red** | Conexión local (localhost) | LAN 100 Mbps |

### Entorno de Producción (Servidor)

| Recurso | Mínimo | Recomendado |
|---|---|---|
| **Procesador** | Quad-core 2.5 GHz | 8 cores 3.0 GHz o superior |
| **Memoria RAM** | 8 GB | 16 GB o más |
| **Almacenamiento** | 50 GB SSD | 100 GB SSD (RAID recomendado) |
| **Red** | 100 Mbps dedicada | 1 Gbps dedicada |
| **Sistema Operativo** | Ubuntu Server 22.04 LTS / Windows Server 2019 | Ubuntu Server 24.04 LTS |

## Requerimientos de Software

### Sistema Operativo

El sistema es **multiplataforma** y puede ejecutarse en:

- **Windows:** 10/11 o Windows Server 2019+
- **Linux:** Ubuntu 22.04+, Debian 12+, CentOS Stream 9+
- **macOS:** 13 Ventura o superior (solo para desarrollo)

### Software Necesario

| Software | Versión Mínima | Propósito |
|---|---|---|
| **Python** | 3.10+ | Lenguaje de programación del backend |
| **MySQL Server** | 8.0+ | Motor de base de datos relacional |
| **pip** | 21.0+ | Gestor de paquetes de Python |
| **Git** | 2.30+ | Control de versiones y clonado del repositorio |

### Dependencias de Python (requirements.txt)

Las principales librerías del proyecto son:

| Paquete | Versión | Función |
|---|---|---|
| Django | 4.2.* | Framework web principal |
| djangorestframework | 3.14.* | Construcción de la API REST |
| djangorestframework-simplejwt | 5.3.* | Autenticación JWT |
| mysqlclient | 2.2.* | Conector Python ↔ MySQL |
| django-cors-headers | 4.3.* | Manejo de CORS para el frontend |
| django-filter | 23.5 | Filtrado avanzado en endpoints |
| drf-spectacular | — | Generación de esquema OpenAPI 3 (Swagger) |
| pandas | ≥ 2.2.0 | Generación de reportes Excel/CSV |
| openpyxl | 3.1.* | Escritura de archivos .xlsx |

### Puertos de Red Utilizados

| Puerto | Servicio | Notas |
|---|---|---|
| **8000** | Django (desarrollo) | Configurable vía `runserver 0.0.0.0:<puerto>` |
| **3306** | MySQL Server | Puerto estándar de MySQL |
| **443/80** | HTTPS/HTTP (producción) | Solo si se configura Nginx/Apache como proxy inverso |

## Variables de Entorno

El sistema soporta configuración mediante variables de entorno para facilitar el despliegue sin modificar código:

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `DJANGO_SECRET_KEY` | *(clave interna)* | Clave secreta de Django (cambiar en producción) |
| `DJANGO_DEBUG` | `True` | Activar/desactivar modo debug |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1` | Hosts permitidos para servir |
| `DB_NAME` | `db_clinica_siih` | Nombre de la base de datos MySQL |
| `DB_USER` | `root` | Usuario de MySQL |
| `DB_PASSWORD` | `123456` | Contraseña de MySQL |
| `DB_HOST` | `localhost` | Host del servidor MySQL |
| `DB_PORT` | `3306` | Puerto de MySQL |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000,...` | Orígenes permitidos para CORS |

!!! warning "Seguridad en Producción"
    En un entorno de producción, es **obligatorio** cambiar la `DJANGO_SECRET_KEY`, establecer `DJANGO_DEBUG=False`, y no usar la contraseña por defecto de MySQL.
