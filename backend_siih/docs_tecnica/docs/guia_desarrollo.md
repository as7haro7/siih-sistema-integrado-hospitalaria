# Guía de Desarrollo para Nuevos Módulos

Si necesitas expandir la funcionalidad del backend (por ejemplo, añadiendo un módulo de "Recursos Humanos" o "Inventario de Mantenimiento"), el proceso estandarizado sigue estos pasos.

## Paso 1: Diseñar y Crear la Tabla (MySQL)

Dado que se prioriza la filosofía "Database First", el diseño primario ocurre en MySQL:

1. Modificar el archivo `db.sql` o añadir un nuevo script `ALTER TABLE`.
2. Crear la tabla en tu entorno local.
3. Asegurar que las llaves primarias/foráneas y los disparadores (triggers) existan de antemano.

## Paso 2: Crear la App de Django

Generar la nueva aplicación:

```bash
python manage.py startapp recursos_humanos
```

**Registrar la App:**
Agrega `"recursos_humanos"` a la lista `INSTALLED_APPS` en `config/settings.py`.

## Paso 3: Mapear el Modelo (`models.py`)

Crea la representación en Python de tu tabla. Recuerda dos reglas de oro:
1. Las relaciones y nombres de columnas deben ser explícitas si no coinciden.
2. Añade `managed = False`.

```python
from django.db import models

class Empleado(models.Model):
    id_empleado = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=150)

    class Meta:
        managed = False
        db_table = "EMPLEADO"
```

## Paso 4: Crear el Serializador (`serializers.py`)

El Serializador conectará tu modelo con el JSON del cliente. Si una columna es generada por base de datos, defínela como `read_only=True`.

```python
from rest_framework import serializers
from .models import Empleado

class EmpleadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empleado
        fields = "__all__"
```

## Paso 5: Crear el ViewSet (`views.py`)

Crea un ViewSet para proveer el CRUD. Enlázalo con tu Serializador y Modelo. Aplica los permisos requeridos importados de `accounts.permissions`.

```python
from rest_framework import viewsets
from accounts.permissions import IsAdmin
from .models import Empleado
from .serializers import EmpleadoSerializer

class EmpleadoViewSet(viewsets.ModelViewSet):
    queryset = Empleado.objects.all()
    serializer_class = EmpleadoSerializer
    permission_classes = [IsAdmin]
```

## Paso 6: Configurar las Rutas (`urls.py`)

Usa un `DefaultRouter` dentro de tu aplicación para exponer los endpoints:

```python
from rest_framework.routers import DefaultRouter
from .views import EmpleadoViewSet

router = DefaultRouter()
router.register("empleados", EmpleadoViewSet, basename="empleado")

urlpatterns = router.urls
```

**Conectar a las Rutas Globales:**
Finalmente, ve a `config/urls.py` e integra tu nueva ruta, preferiblemente bajo `/api/v1/`:

```python
path("api/v1/recursos-humanos/", include("recursos_humanos.urls")),
```
