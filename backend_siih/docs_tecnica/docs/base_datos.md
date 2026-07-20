# Modelo de Base de Datos

El backend de la Clínica SIIH emplea una arquitectura **"Database First"**, donde la base de datos (MySQL) es la verdadera dueña de la integridad referencial y de ciertas reglas de negocio automatizadas.

## Uso del parámetro `managed = False`

Prácticamente todos los modelos definidos en las aplicaciones del negocio (pacientes, hospitalización, citas, etc.) contienen la propiedad `managed = False` en su clase `Meta`:

```python
class Paciente(models.Model):
    # ... campos ...
    class Meta:
        managed = False
        db_table = "PACIENTE"
```

**¿Qué significa esto?**
- Django **NO** creará, modificará, ni eliminará estas tablas al ejecutar `python manage.py makemigrations` o `migrate`.
- Django confía en que las tablas, las claves primarias (PK), foráneas (FK) y las restricciones existen exactamente como están descritas en el ORM.
- Cualquier modificación a la estructura de la base de datos debe hacerse manualmente mediante scripts SQL (como `db.sql`) y luego reflejarse en los modelos de Django de manera coordinada.

## Lógica delegada a MySQL (Triggers y Procedimientos)

Gracias a este enfoque, gran parte de la seguridad de datos se encuentra directamente en el motor MySQL:

- **Auditoría automática:** Triggers que escuchan `INSERT`, `UPDATE`, y `DELETE` en tablas importantes y llenan automáticamente la tabla `AUDITORIA_SISTEMA`. Por esta razón, el módulo de Django de auditoría es estrictamente de *solo lectura* (`ReadOnlyModelViewSet`).
- **Estados derivados y Subtotales:** Muchos valores monetarios (como el cálculo de impuestos de una factura o el subtotal de un detalle de compra) se calculan automáticamente a nivel de base de datos como columnas generadas (GENERATED) o actualizadas mediante Triggers. Por ende, desde Django estos campos son ignorados en las operaciones de escritura (definidos como `read_only=True` en los serializadores).

## Reglas de Integridad Críticas

Es crucial respetar los nombres exactos de columnas (`db_column="id_paciente"`) y los tipos de datos. Alterar un `IntegerField` a un `CharField` en Django provocará errores severos en tiempo de ejecución debido a desajustes con el esquema subyacente.
