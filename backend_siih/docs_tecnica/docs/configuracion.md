# Configuración y Despliegue Local

Esta guía describe los pasos necesarios para configurar el entorno de desarrollo y levantar el proyecto de la Clínica SIIH de manera local.

## Requisitos del Sistema

- **Python:** Versión 3.10 o superior (recomendado Python 3.12+).
- **MySQL:** Servidor MySQL 8.0+ para la base de datos.
- **Git:** Para clonado de repositorios y control de versiones.

---

## Pasos de Instalación

### 1. Clonar el Repositorio

Si aún no lo has hecho, clona el repositorio del proyecto:

```bash
git clone <url_del_repositorio>
cd clinica_siih/backend_siih
```

### 2. Configuración de la Base de Datos MySQL

El proyecto utiliza una base de datos MySQL estructurada con sus propios procedimientos y triggers. Debes importar el script base `db.sql` a tu servidor MySQL.

```bash
mysql -u root -p < db.sql
```

Asegúrate de que tus credenciales locales en `config/settings.py` (o tu archivo `.env`) coincidan con las de tu servidor MySQL local. Por defecto espera el usuario `root` en `localhost`.

### 3. Crear el Entorno Virtual

Es fundamental aislar las dependencias del proyecto usando un entorno virtual:

**En Windows:**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**En Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 4. Instalación de Dependencias

Con el entorno activado, instala todas las librerías listadas en `requirements.txt`:

```bash
pip install -r requirements.txt
```

### 5. Migraciones y Roles del Sistema

A pesar de tener una base de datos MySQL (con `managed=False` para la mayoría de tablas), Django necesita crear sus propias tablas para la sesión, perfiles y metadatos internos. Ejecuta:

```bash
# Sincroniza las tablas de autenticación y admin de Django
python manage.py migrate

# Script especial para cargar los roles RBAC por defecto (Admin, Médico, Recepcionista, etc.)
python manage.py crear_roles
```

### 6. Creación de Usuario Administrador

Crea un superusuario de Django para poder acceder al panel de administración:

```bash
python manage.py createsuperuser
```
*(Sigue las instrucciones en consola para proporcionar un username, correo y contraseña)*.

### 7. Levantar el Servidor

Finalmente, puedes correr el servidor local de desarrollo:

```bash
python manage.py runserver
```

El servidor estará escuchando en `http://localhost:8000`. Puedes verificar que la API está funcionando accediendo a `http://localhost:8000/api/v1/`.
