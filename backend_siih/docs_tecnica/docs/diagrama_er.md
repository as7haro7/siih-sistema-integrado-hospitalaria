# Diagrama Entidad-Relación

A continuación se presenta el diagrama ER del sistema, representando todas las entidades del negocio y sus relaciones. El diagrama está generado con Mermaid y refleja el esquema real de la base de datos MySQL.

## Diagrama General del Sistema

```mermaid
erDiagram
    ESPECIALIDAD {
        int id_especialidad PK
        varchar nombre_especialidad UK
    }

    MEDICO {
        int id_medico PK
        varchar nombre_medico
        int id_especialidad FK
        varchar telefono
    }

    HORARIO_MEDICO {
        int id_horario PK
        int id_medico FK
        varchar dia_semana
        time hora_inicio
        time hora_fin
        varchar estado_turno
    }

    PACIENTE {
        int id_paciente PK
        varchar cedula_paciente UK
        varchar nombre
        varchar apellido
        date fecha_nacimiento
        varchar telefono
        varchar direccion
        varchar seguro_medico
        varchar estado_baja
    }

    REGISTRO_BAJA {
        int id_baja PK
        int id_paciente FK
        datetime fecha_baja
        text motivo_baja
        varchar usuario_autoriza
    }

    CITA {
        int id_cita PK
        int id_paciente FK
        int id_medico FK
        date fecha_cita
        time hora_cita
        varchar estado_cita
    }

    EMERGENCIA {
        int id_emergencia PK
        int id_paciente FK
        int id_medico_guardia FK
        datetime fecha_hora_ingreso
        varchar nivel_triage
        text descripcion_urgencia
        varchar destino_paciente
    }

    TARIFA_HABITACION {
        int id_tarifa PK
        varchar tipo_habitacion
        decimal costo_por_dia
    }

    CAMA {
        int id_cama PK
        varchar nro_habitacion
        varchar nro_cama
        int id_tarifa FK
        varchar estado_cama
    }

    HOSPITALIZACION {
        int id_hospitalizacion PK
        int id_cita FK
        int id_emergencia FK
        int id_paciente FK
        int id_medico_responsable FK
        int id_cama FK
        datetime fecha_ingreso
        datetime fecha_egreso
        text diagnostico_ingreso
        varchar estado_internacion
    }

    HISTORIAL_CLINICO {
        int id_historial PK
        int id_cita FK
        int id_hospitalizacion FK
        int id_emergencia FK
        datetime fecha_registro
        text motivo_consulta
        text tratamiento
        text diagnostico
        varchar medico_tratante
    }

    EXAMEN_LABORATORIO {
        int id_examen PK
        int id_historial FK
        varchar tipo_examen
        text resultado_texto
        varchar estado_examen
        decimal costo_examen
    }

    PROVEEDOR {
        int id_proveedor PK
        varchar nombre_proveedor
        varchar nit_proveedor
        varchar telefono
        varchar direccion
    }

    MEDICAMENTO {
        int id_medicamento PK
        varchar nombre_comercial
        int stock_actual
        int stock_minimo
        decimal precio_unitario
    }

    COMPRA {
        int id_compra PK
        int id_proveedor FK
        date fecha_compra
        varchar numero_factura_compra
        decimal total_compra
    }

    LOTE_MEDICAMENTO {
        int id_lote PK
        int id_medicamento FK
        int id_compra FK
        varchar numero_lote
        int cantidad_inicial
        int cantidad_actual
        decimal precio_compra_unitario
        date fecha_ingreso
        date fecha_vencimiento
    }

    COMPRA_DETALLE {
        int id_compra_detalle PK
        int id_compra FK
        int id_lote FK
        int cantidad
        decimal precio_unitario
        decimal subtotal_linea
    }

    RECETA_DETALLE {
        int id_detalle_receta PK
        int id_historial FK
        int id_medicamento FK
        int cantidad_recetada
        varchar dosis
        varchar frecuencia
        varchar duracion
        varchar estado_despacho
    }

    CONFIG_IMPUESTO {
        int id_impuesto PK
        varchar descripcion
        decimal porcentaje
    }

    FACTURA {
        int id_factura PK
        int id_historial FK
        int id_hospitalizacion FK
        int id_impuesto FK
        varchar nit_factura
        varchar razon_social
        decimal subtotal
        decimal monto_impuesto
        decimal total_pagar
        varchar estado_pago
        datetime fecha_emision
        varchar cajero_responsable
    }

    FACTURA_DETALLE {
        int id_factura_detalle PK
        int id_factura FK
        varchar concepto
        int cantidad
        decimal precio_unitario
        decimal subtotal_linea
    }

    PAGO {
        int id_pago PK
        int id_factura FK
        decimal monto
        varchar metodo_pago
        datetime fecha_pago
        varchar cajero_responsable
    }

    AUDITORIA_SISTEMA {
        int id_auditoria PK
        varchar usuario_accion
        varchar tabla_afectada
        int id_registro_afectado
        varchar tipo_operacion
        text valores_anteriores
        text valores_nuevos
        datetime fecha_hora_evento
        varchar direccion_ip
    }

    %% ── Relaciones ──────────────────────────────────

    ESPECIALIDAD ||--o{ MEDICO : "tiene"
    MEDICO ||--o{ HORARIO_MEDICO : "tiene"
    MEDICO ||--o{ CITA : "atiende"
    MEDICO ||--o{ EMERGENCIA : "atiende guardia"
    MEDICO ||--o{ HOSPITALIZACION : "responsable"

    PACIENTE ||--o{ REGISTRO_BAJA : "puede tener"
    PACIENTE ||--o{ CITA : "agenda"
    PACIENTE ||--o{ EMERGENCIA : "ingresa"
    PACIENTE ||--o{ HOSPITALIZACION : "se hospitaliza"

    TARIFA_HABITACION ||--o{ CAMA : "aplica a"
    CAMA ||--o{ HOSPITALIZACION : "asignada a"

    CITA ||--o| HOSPITALIZACION : "puede generar"
    EMERGENCIA ||--o| HOSPITALIZACION : "puede generar"

    CITA ||--o| HISTORIAL_CLINICO : "genera"
    HOSPITALIZACION ||--o| HISTORIAL_CLINICO : "genera"
    EMERGENCIA ||--o| HISTORIAL_CLINICO : "genera"

    HISTORIAL_CLINICO ||--o{ EXAMEN_LABORATORIO : "solicita"
    HISTORIAL_CLINICO ||--o{ RECETA_DETALLE : "prescribe"
    HISTORIAL_CLINICO ||--o{ FACTURA : "se factura"

    MEDICAMENTO ||--o{ LOTE_MEDICAMENTO : "tiene lotes"
    MEDICAMENTO ||--o{ RECETA_DETALLE : "se receta"

    PROVEEDOR ||--o{ COMPRA : "suministra"
    COMPRA ||--o{ LOTE_MEDICAMENTO : "ingresa lotes"
    COMPRA ||--o{ COMPRA_DETALLE : "tiene detalles"
    LOTE_MEDICAMENTO ||--o{ COMPRA_DETALLE : "referenciado en"

    CONFIG_IMPUESTO ||--o{ FACTURA : "aplica a"
    HOSPITALIZACION ||--o{ FACTURA : "se factura"
    FACTURA ||--o{ FACTURA_DETALLE : "tiene líneas"
    FACTURA ||--o{ PAGO : "recibe pagos"
```

## Descripción de las Relaciones Principales

### Módulo de Atención

- Un **PACIENTE** puede agendar múltiples **CITAS** y tener múltiples ingresos de **EMERGENCIA**.
- Cada **CITA** o **EMERGENCIA** puede derivar en una **HOSPITALIZACION**.
- Toda atención (cita, emergencia u hospitalización) genera un **HISTORIAL_CLINICO**.

### Módulo Clínico

- Cada **HISTORIAL_CLINICO** puede tener múltiples **EXAMEN_LABORATORIO** solicitados y múltiples **RECETA_DETALLE** prescritas.

### Módulo de Farmacia

- Un **MEDICAMENTO** tiene múltiples **LOTE_MEDICAMENTO** (control FIFO por fecha de vencimiento).
- Las **COMPRAS** a **PROVEEDORES** generan nuevos lotes y detalles de compra.

### Módulo de Facturación

- Una **FACTURA** consolida los cargos de un historial clínico y/o una hospitalización.
- Cada factura puede recibir múltiples **PAGOS** parciales hasta completarse.
- La configuración de **CONFIG_IMPUESTO** determina el porcentaje aplicado.

### Auditoría

- La tabla **AUDITORIA_SISTEMA** es independiente y se llena automáticamente mediante triggers de MySQL. No tiene relaciones de clave foránea con otras tablas.
