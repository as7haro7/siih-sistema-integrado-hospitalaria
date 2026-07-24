# Manual de Instalación - Sistema Integrado de Información Hospitalaria (SIIH)

Este manual describe detalladamente los pasos técnicos para instalar, configurar y desplegar el sistema SIIH en un entorno local (desarrollo o pruebas). El sistema consta de tres capas principales: una base de datos MySQL, un backend en Django (Python) y un frontend en Next.js (React).

---

## 1. Requisitos Previos (Software)

Antes de comenzar, asegúrate de tener instalados los siguientes programas en tu computadora:

- **MySQL Server:** Versión 8.0 o superior (y de preferencia MySQL Workbench para interfaz visual).
- **Python:** Versión 3.10, 3.11 o 3.12 (Asegúrate de marcar "Add Python to PATH" durante la instalación en Windows).
- **Node.js:** Versión 18.x o superior (incluye `npm`).
- **Git:** Para control de versiones (opcional si descargas el ZIP del código).
- Un editor de código (como **Visual Studio Code**).

---

## 2. Preparación de la Base de Datos

El sistema sigue una arquitectura "Database First", por lo que lo primero que se debe inicializar es la base de datos.

1. Abre **MySQL Workbench** (o tu consola de MySQL) e inicia sesión con el usuario `root`.
2. Ejecuta el archivo script SQL del sistema ubicado en la carpeta principal del proyecto: `db.sql`.
   - Puedes abrir este archivo en Workbench y ejecutar todo el script (ícono del rayo).
3. Este script creará automáticamente la base de datos llamada `db_clinica_siih`, todas las tablas necesarias y cargará los procedimientos almacenados (triggers y funciones lógicas).

---

## 3. Instalación del Backend (Django)

El backend expone la API RESTful que alimenta al sistema. 

### 3.1 Entorno Virtual
Abre una terminal o consola de comandos, navega hasta la carpeta del backend y crea un entorno virtual para aislar las dependencias:

```bash
# Entrar a la carpeta del backend
cd clinica_siih/backend_siih

# Crear entorno virtual llamado "venv"
python -m venv venv

# Activar el entorno virtual (Windows)
.\venv\Scripts\activate

# (Nota: En Linux/Mac usa: source venv/bin/activate)
```
*(Sabrás que está activo porque aparecerá `(venv)` al inicio de tu consola).*

### 3.2 Dependencias y Variables de Entorno
1. Instala las librerías necesarias:
   ```bash
   pip install -r requirements.txt
   ```
2. Asegúrate de tener el archivo oculto `.env` en la misma carpeta que `manage.py` con tus credenciales locales de MySQL:
   ```env
   DATABASE_URL=mysql://root:TuClaveAqui@127.0.0.1:3306/db_clinica_siih
   SECRET_KEY=clave-secreta-de-django
   DEBUG=True
   ```

### 3.3 Migraciones y Roles
Ejecuta los siguientes comandos para que Django inicialice sus tablas internas de seguridad y genere los roles:

```bash
# Migrar tablas de sesión y seguridad
python manage.py migrate

# Crear roles obligatorios del sistema (Médico, Recepcionista, etc)
python manage.py crear_roles

# Crear tu primer usuario Administrador
python manage.py createsuperuser
# (Te pedirá un usuario, correo y contraseña. Puedes usar admin / admin)
```

### 3.4 Iniciar el Backend
Levanta el servidor local:
```bash
python manage.py runserver
```
El backend quedará activo en: **http://localhost:8000**

---

## 4. Instalación del Frontend (Next.js)

Abre **una nueva pestaña de la consola** (no cierres la del backend) y dirígete a la carpeta del frontend.

### 4.1 Instalación
```bash
# Entrar a la carpeta del frontend
cd clinica_siih/frontend_siih

# Instalar los paquetes de Node.js
npm install
```

### 4.2 Variables de Entorno
Asegúrate de que exista un archivo `.env.local` en la raíz de `frontend_siih` apuntando a tu backend:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 4.3 Iniciar el Frontend
Levanta el entorno de desarrollo visual:
```bash
npm run dev
```
El frontend quedará activo en: **http://localhost:3000**

---

## 5. Accesos Rápidos al Sistema

Una vez tengas **ambos servidores corriendo en paralelo** (Backend en 8000 y Frontend en 3000), abre tu navegador de internet:

- **Plataforma Web (Para el personal de la clínica):** [http://localhost:3000](http://localhost:3000)
  - Inicia sesión usando la cuenta de Administrador que creaste en el paso 3.3. Desde ahí, podrás ir al módulo de "Usuarios" y crear las cuentas para médicos, recepcionistas, cajeros y farmacéuticos.
- **Panel Nativo de Base de Datos (Administradores):** [http://localhost:8000/admin](http://localhost:8000/admin)
- **Documentación Técnica de la API (Swagger):** [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/)
