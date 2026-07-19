-- =======================================================
-- SIIH - Sistema Integrado de Información Hospitalaria
-- Hospital Universitario San Andrés (UMSA - Inf-266)
-- Script actualizado: incluye lotes de medicamentos, compras,
-- proveedores, control de camas, pagos, auditoría ampliada
-- y catálogos normalizados.
-- Compatible con MySQL 8.0.16+ / MariaDB 10.5+
-- (requiere soporte de CHECK constraints y columnas generadas)
-- =======================================================

CREATE DATABASE IF NOT EXISTS db_clinica_siih
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_clinica_siih;

-- =======================================================
-- ELIMINACIÓN DE TABLAS (orden inverso de dependencias)
-- =======================================================
DROP TRIGGER IF EXISTS trg_lote_incrementa_stock;
DROP TRIGGER IF EXISTS trg_receta_descuenta_stock;
DROP TRIGGER IF EXISTS trg_hospitalizacion_ocupa_cama;
DROP TRIGGER IF EXISTS trg_hospitalizacion_libera_cama;
DROP TRIGGER IF EXISTS trg_baja_actualiza_paciente;
DROP TRIGGER IF EXISTS trg_auditoria_historial_update;
DROP TRIGGER IF EXISTS trg_auditoria_factura_update;
DROP TRIGGER IF EXISTS trg_pago_actualiza_factura;
DROP PROCEDURE IF EXISTS sp_descontar_stock_fifo;

DROP TABLE IF EXISTS AUDITORIA_SISTEMA;
DROP TABLE IF EXISTS PAGO;
DROP TABLE IF EXISTS FACTURA_DETALLE;
DROP TABLE IF EXISTS FACTURA;
DROP TABLE IF EXISTS RECETA_DETALLE;
DROP TABLE IF EXISTS EXAMEN_LABORATORIO;
DROP TABLE IF EXISTS HISTORIAL_CLINICO;
DROP TABLE IF EXISTS HOSPITALIZACION;
DROP TABLE IF EXISTS EMERGENCIA;
DROP TABLE IF EXISTS CITA;
DROP TABLE IF EXISTS REGISTRO_BAJA;
DROP TABLE IF EXISTS LOTE_MEDICAMENTO;
DROP TABLE IF EXISTS COMPRA_DETALLE;
DROP TABLE IF EXISTS COMPRA;
DROP TABLE IF EXISTS MEDICAMENTO;
DROP TABLE IF EXISTS CAMA;
DROP TABLE IF EXISTS HORARIO_MEDICO;
DROP TABLE IF EXISTS MEDICO;
DROP TABLE IF EXISTS ESPECIALIDAD;
DROP TABLE IF EXISTS PROVEEDOR;
DROP TABLE IF EXISTS TARIFA_HABITACION;
DROP TABLE IF EXISTS CONFIG_IMPUESTO;
DROP TABLE IF EXISTS PACIENTE;

-- =======================================================
-- 1. CATÁLOGOS / TABLAS MAESTRAS
-- =======================================================

CREATE TABLE ESPECIALIDAD (
    id_especialidad INT AUTO_INCREMENT PRIMARY KEY,
    nombre_especialidad VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE PROVEEDOR (
    id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
    nombre_proveedor VARCHAR(150) NOT NULL,
    nit_proveedor VARCHAR(50),
    telefono VARCHAR(20),
    direccion VARCHAR(255)
);

CREATE TABLE TARIFA_HABITACION (
    id_tarifa INT AUTO_INCREMENT PRIMARY KEY,
    tipo_habitacion VARCHAR(100) NOT NULL, -- Ej: Sala Común, Terapia Intensiva
    costo_por_dia DECIMAL(10,2) NOT NULL
);

CREATE TABLE CONFIG_IMPUESTO (
    id_impuesto INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(100) NOT NULL,
    porcentaje DECIMAL(5,2) NOT NULL
);

-- PACIENTE: PK subrogada (id_paciente) en vez de la cédula.
-- La cédula queda como UNIQUE pero nullable, para admitir
-- recién nacidos o pacientes extranjeros sin cédula todavía.
CREATE TABLE PACIENTE (
    id_paciente INT AUTO_INCREMENT PRIMARY KEY,
    cedula_paciente VARCHAR(20) UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE,
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    seguro_medico VARCHAR(100),
    estado_baja ENUM('Activo','Baja') NOT NULL DEFAULT 'Activo'
);

CREATE TABLE MEDICO (
    id_medico INT AUTO_INCREMENT PRIMARY KEY,
    nombre_medico VARCHAR(150) NOT NULL,
    id_especialidad INT NOT NULL,
    telefono VARCHAR(20),
    FOREIGN KEY (id_especialidad) REFERENCES ESPECIALIDAD(id_especialidad)
);

CREATE TABLE HORARIO_MEDICO (
    id_horario INT AUTO_INCREMENT PRIMARY KEY,
    id_medico INT NOT NULL,
    dia_semana ENUM('Lunes','Martes','Miercoles','Jueves','Viernes','Sabado','Domingo') NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    estado_turno ENUM('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
    FOREIGN KEY (id_medico) REFERENCES MEDICO(id_medico),
    CHECK (hora_fin > hora_inicio)
);

-- CAMA: modela físicamente cada cama/habitación y su ocupación,
-- para evitar asignar la misma cama a dos internaciones a la vez.
CREATE TABLE CAMA (
    id_cama INT AUTO_INCREMENT PRIMARY KEY,
    nro_habitacion VARCHAR(20) NOT NULL,
    nro_cama VARCHAR(20) NOT NULL,
    id_tarifa INT NOT NULL,
    estado_cama ENUM('Disponible','Ocupada','Mantenimiento') NOT NULL DEFAULT 'Disponible',
    UNIQUE (nro_habitacion, nro_cama),
    FOREIGN KEY (id_tarifa) REFERENCES TARIFA_HABITACION(id_tarifa)
);

CREATE TABLE MEDICAMENTO (
    id_medicamento INT AUTO_INCREMENT PRIMARY KEY,
    nombre_comercial VARCHAR(150) NOT NULL,
    stock_actual INT NOT NULL DEFAULT 0, -- se mantiene por triggers desde LOTE_MEDICAMENTO
    stock_minimo INT NOT NULL DEFAULT 0,
    precio_unitario DECIMAL(10,2) NOT NULL,
    CHECK (stock_actual >= 0)
);

-- =======================================================
-- 2. COMPRAS Y CONTROL DE INVENTARIO POR LOTES (SCM)
-- =======================================================

CREATE TABLE COMPRA (
    id_compra INT AUTO_INCREMENT PRIMARY KEY,
    id_proveedor INT NOT NULL,
    fecha_compra DATE NOT NULL,
    numero_factura_compra VARCHAR(50),
    total_compra DECIMAL(10,2) NOT NULL DEFAULT 0,
    FOREIGN KEY (id_proveedor) REFERENCES PROVEEDOR(id_proveedor)
);

-- Cada lote representa una entrada de inventario con su propio
-- vencimiento, permitiendo despacho FIFO (primero en vencer,
-- primero en salir) y trazabilidad de qué compra lo originó.
CREATE TABLE LOTE_MEDICAMENTO (
    id_lote INT AUTO_INCREMENT PRIMARY KEY,
    id_medicamento INT NOT NULL,
    id_compra INT,
    numero_lote VARCHAR(50),
    cantidad_inicial INT NOT NULL,
    cantidad_actual INT NOT NULL,
    precio_compra_unitario DECIMAL(10,2) NOT NULL,
    fecha_ingreso DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    FOREIGN KEY (id_medicamento) REFERENCES MEDICAMENTO(id_medicamento),
    FOREIGN KEY (id_compra) REFERENCES COMPRA(id_compra),
    CHECK (cantidad_actual >= 0),
    CHECK (cantidad_actual <= cantidad_inicial)
);

CREATE TABLE COMPRA_DETALLE (
    id_compra_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_compra INT NOT NULL,
    id_lote INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal_linea DECIMAL(10,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
    FOREIGN KEY (id_compra) REFERENCES COMPRA(id_compra),
    FOREIGN KEY (id_lote) REFERENCES LOTE_MEDICAMENTO(id_lote)
);

-- =======================================================
-- 3. RECEPCIÓN Y EMERGENCIAS
-- =======================================================

CREATE TABLE CITA (
    id_cita INT AUTO_INCREMENT PRIMARY KEY,
    id_paciente INT NOT NULL,
    id_medico INT NOT NULL,
    fecha_cita DATE NOT NULL,
    hora_cita TIME NOT NULL,
    estado_cita ENUM('Pendiente','Confirmada','Atendida','Cancelada','No Asistio') NOT NULL DEFAULT 'Pendiente',
    FOREIGN KEY (id_paciente) REFERENCES PACIENTE(id_paciente),
    FOREIGN KEY (id_medico) REFERENCES MEDICO(id_medico),
    UNIQUE (id_medico, fecha_cita, hora_cita) -- evita doble-booking del mismo médico
);

CREATE TABLE EMERGENCIA (
    id_emergencia INT AUTO_INCREMENT PRIMARY KEY,
    id_paciente INT NOT NULL,
    id_medico_guardia INT NOT NULL,
    fecha_hora_ingreso DATETIME NOT NULL,
    nivel_triage ENUM('Rojo','Naranja','Amarillo','Verde','Azul') NOT NULL,
    descripcion_urgencia TEXT,
    destino_paciente VARCHAR(100), -- Alta Directa, Hospitalización
    FOREIGN KEY (id_paciente) REFERENCES PACIENTE(id_paciente),
    FOREIGN KEY (id_medico_guardia) REFERENCES MEDICO(id_medico)
);

CREATE TABLE REGISTRO_BAJA (
    id_baja INT AUTO_INCREMENT PRIMARY KEY,
    id_paciente INT NOT NULL,
    fecha_baja DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    motivo_baja TEXT,
    usuario_autoriza VARCHAR(50) NOT NULL, -- referencia lógica a la BD de usuarios
    FOREIGN KEY (id_paciente) REFERENCES PACIENTE(id_paciente)
);

-- =======================================================
-- 4. INTERNACIÓN Y CLÍNICA (CORE)
-- =======================================================

CREATE TABLE HOSPITALIZACION (
    id_hospitalizacion INT AUTO_INCREMENT PRIMARY KEY,
    id_cita INT,
    id_emergencia INT,
    id_paciente INT NOT NULL,
    id_medico_responsable INT NOT NULL,
    id_cama INT NOT NULL,
    fecha_ingreso DATETIME NOT NULL,
    fecha_egreso DATETIME,
    diagnostico_ingreso TEXT,
    estado_internacion ENUM('Activo','Alta','Trasladado') NOT NULL DEFAULT 'Activo',
    FOREIGN KEY (id_cita) REFERENCES CITA(id_cita),
    FOREIGN KEY (id_emergencia) REFERENCES EMERGENCIA(id_emergencia),
    FOREIGN KEY (id_paciente) REFERENCES PACIENTE(id_paciente),
    FOREIGN KEY (id_medico_responsable) REFERENCES MEDICO(id_medico),
    FOREIGN KEY (id_cama) REFERENCES CAMA(id_cama),
    CHECK (fecha_egreso IS NULL OR fecha_egreso >= fecha_ingreso)
);

CREATE TABLE HISTORIAL_CLINICO (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_cita INT,
    id_hospitalizacion INT,
    id_emergencia INT,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    motivo_consulta TEXT,
    tratamiento TEXT,
    diagnostico TEXT,
    medico_tratante VARCHAR(50), -- referencia lógica al usuario que llenó el registro
    FOREIGN KEY (id_cita) REFERENCES CITA(id_cita),
    FOREIGN KEY (id_hospitalizacion) REFERENCES HOSPITALIZACION(id_hospitalizacion),
    FOREIGN KEY (id_emergencia) REFERENCES EMERGENCIA(id_emergencia),
    -- todo historial debe originarse en al menos un evento clínico
    CHECK (id_cita IS NOT NULL OR id_hospitalizacion IS NOT NULL OR id_emergencia IS NOT NULL)
);

-- =======================================================
-- 5. APOYO DIAGNÓSTICO Y FARMACIA
-- =======================================================

CREATE TABLE EXAMEN_LABORATORIO (
    id_examen INT AUTO_INCREMENT PRIMARY KEY,
    id_historial INT NOT NULL,
    tipo_examen VARCHAR(100) NOT NULL,
    resultado_texto TEXT,
    estado_examen ENUM('Pendiente','En Proceso','Completado') NOT NULL DEFAULT 'Pendiente',
    costo_examen DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_historial) REFERENCES HISTORIAL_CLINICO(id_historial)
);

CREATE TABLE RECETA_DETALLE (
    id_detalle_receta INT AUTO_INCREMENT PRIMARY KEY,
    id_historial INT NOT NULL,
    id_medicamento INT NOT NULL,
    cantidad_recetada INT NOT NULL,
    dosis VARCHAR(100),
    frecuencia VARCHAR(100),
    duracion VARCHAR(100),
    estado_despacho ENUM('Pendiente','Entregado','Sin Stock') NOT NULL DEFAULT 'Pendiente',
    FOREIGN KEY (id_historial) REFERENCES HISTORIAL_CLINICO(id_historial),
    FOREIGN KEY (id_medicamento) REFERENCES MEDICAMENTO(id_medicamento)
);

-- =======================================================
-- 6. MÓDULO FINANCIERO
-- =======================================================

CREATE TABLE FACTURA (
    id_factura INT AUTO_INCREMENT PRIMARY KEY,
    id_historial INT,
    id_hospitalizacion INT,
    id_impuesto INT NOT NULL,
    nit_factura VARCHAR(50),
    razon_social VARCHAR(150),
    subtotal DECIMAL(10,2) NOT NULL,
    monto_impuesto DECIMAL(10,2) NOT NULL,
    total_pagar DECIMAL(10,2) GENERATED ALWAYS AS (subtotal + monto_impuesto) STORED,
    estado_pago ENUM('Pendiente','Parcial','Pagado','Anulado') NOT NULL DEFAULT 'Pendiente',
    fecha_emision DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cajero_responsable VARCHAR(50), -- referencia lógica a la BD de usuarios
    FOREIGN KEY (id_historial) REFERENCES HISTORIAL_CLINICO(id_historial),
    FOREIGN KEY (id_hospitalizacion) REFERENCES HOSPITALIZACION(id_hospitalizacion),
    FOREIGN KEY (id_impuesto) REFERENCES CONFIG_IMPUESTO(id_impuesto)
);

CREATE TABLE FACTURA_DETALLE (
    id_factura_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_factura INT NOT NULL,
    concepto VARCHAR(255) NOT NULL, -- Ej: Paracetamol 500mg, Hemograma, 2 días internación
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal_linea DECIMAL(10,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
    FOREIGN KEY (id_factura) REFERENCES FACTURA(id_factura)
);

-- Pagos: permite pagos parciales / múltiples métodos por factura.
CREATE TABLE PAGO (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_factura INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    metodo_pago ENUM('Efectivo','Tarjeta','Transferencia','Seguro') NOT NULL,
    fecha_pago DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cajero_responsable VARCHAR(50),
    FOREIGN KEY (id_factura) REFERENCES FACTURA(id_factura),
    CHECK (monto > 0)
);

-- =======================================================
-- 7. AUDITORÍA GENERAL DEL SISTEMA
-- (ampliada: ya no se limita al historial clínico)
-- =======================================================

CREATE TABLE AUDITORIA_SISTEMA (
    id_auditoria INT AUTO_INCREMENT PRIMARY KEY,
    usuario_accion VARCHAR(100) NOT NULL, -- referencia lógica a BD de usuarios
    tabla_afectada VARCHAR(50) NOT NULL,
    id_registro_afectado INT NOT NULL,
    tipo_operacion ENUM('INSERCION','LECTURA','EDICION','ELIMINACION') NOT NULL,
    valores_anteriores TEXT,
    valores_nuevos TEXT,
    fecha_hora_evento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    direccion_ip VARCHAR(45)
);

-- =======================================================
-- 8. ÍNDICES DE APOYO PARA REPORTES / BI
-- =======================================================

CREATE INDEX idx_cita_fecha ON CITA(fecha_cita);
CREATE INDEX idx_factura_estado_pago ON FACTURA(estado_pago);
CREATE INDEX idx_hospitalizacion_estado ON HOSPITALIZACION(estado_internacion);
CREATE INDEX idx_lote_vencimiento ON LOTE_MEDICAMENTO(fecha_vencimiento);

-- =======================================================
-- 9. TRIGGERS
-- =======================================================

DELIMITER //

-- Un lote nuevo (por compra) incrementa el stock consolidado del medicamento.
CREATE TRIGGER trg_lote_incrementa_stock
AFTER INSERT ON LOTE_MEDICAMENTO
FOR EACH ROW
BEGIN
    UPDATE MEDICAMENTO
    SET stock_actual = stock_actual + NEW.cantidad_inicial
    WHERE id_medicamento = NEW.id_medicamento;
END //

-- Al marcar una receta como 'Entregado', descuenta stock usando
-- FIFO (primero el lote que vence antes) vía procedimiento.
CREATE PROCEDURE sp_descontar_stock_fifo(
    IN p_id_medicamento INT,
    IN p_cantidad INT
)
proc_block: BEGIN
    DECLARE v_id_lote INT;
    DECLARE v_disponible INT;
    DECLARE v_restante INT DEFAULT p_cantidad;
    DECLARE v_tomar INT;
    DECLARE v_done INT DEFAULT 0;
    DECLARE v_stock_total INT;

    SELECT stock_actual INTO v_stock_total
    FROM MEDICAMENTO WHERE id_medicamento = p_id_medicamento;

    IF v_stock_total < p_cantidad THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Stock insuficiente para despachar la receta';
    END IF;

    BEGIN
        DECLARE cur CURSOR FOR
            SELECT id_lote, cantidad_actual
            FROM LOTE_MEDICAMENTO
            WHERE id_medicamento = p_id_medicamento AND cantidad_actual > 0
            ORDER BY fecha_vencimiento ASC;
        DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;

        OPEN cur;
        read_loop: LOOP
            FETCH cur INTO v_id_lote, v_disponible;
            IF v_done = 1 OR v_restante <= 0 THEN
                LEAVE read_loop;
            END IF;

            IF v_disponible >= v_restante THEN
                SET v_tomar = v_restante;
            ELSE
                SET v_tomar = v_disponible;
            END IF;

            UPDATE LOTE_MEDICAMENTO
            SET cantidad_actual = cantidad_actual - v_tomar
            WHERE id_lote = v_id_lote;

            SET v_restante = v_restante - v_tomar;
        END LOOP;
        CLOSE cur;
    END;

    UPDATE MEDICAMENTO
    SET stock_actual = stock_actual - p_cantidad
    WHERE id_medicamento = p_id_medicamento;
END //

CREATE TRIGGER trg_receta_descuenta_stock
AFTER UPDATE ON RECETA_DETALLE
FOR EACH ROW
BEGIN
    IF NEW.estado_despacho = 'Entregado' AND OLD.estado_despacho != 'Entregado' THEN
        CALL sp_descontar_stock_fifo(NEW.id_medicamento, NEW.cantidad_recetada);
    END IF;
END //

-- Ocupar/liberar cama automáticamente según la hospitalización.
CREATE TRIGGER trg_hospitalizacion_ocupa_cama
BEFORE INSERT ON HOSPITALIZACION
FOR EACH ROW
BEGIN
    DECLARE v_estado_cama VARCHAR(20);
    SELECT estado_cama INTO v_estado_cama FROM CAMA WHERE id_cama = NEW.id_cama;
    IF v_estado_cama <> 'Disponible' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La cama seleccionada no está disponible';
    END IF;
END //

CREATE TRIGGER trg_hospitalizacion_libera_cama
AFTER UPDATE ON HOSPITALIZACION
FOR EACH ROW
BEGIN
    IF NEW.fecha_egreso IS NOT NULL AND OLD.fecha_egreso IS NULL THEN
        UPDATE CAMA SET estado_cama = 'Disponible' WHERE id_cama = NEW.id_cama;
    END IF;
END //

-- Al insertar la hospitalización ya validada, marcar la cama ocupada.
CREATE TRIGGER trg_hospitalizacion_marca_ocupada
AFTER INSERT ON HOSPITALIZACION
FOR EACH ROW
BEGIN
    UPDATE CAMA SET estado_cama = 'Ocupada' WHERE id_cama = NEW.id_cama;
END //

-- Baja de paciente actualiza su estado y deja rastro en auditoría.
CREATE TRIGGER trg_baja_actualiza_paciente
AFTER INSERT ON REGISTRO_BAJA
FOR EACH ROW
BEGIN
    UPDATE PACIENTE SET estado_baja = 'Baja' WHERE id_paciente = NEW.id_paciente;

    INSERT INTO AUDITORIA_SISTEMA (usuario_accion, tabla_afectada, id_registro_afectado, tipo_operacion, valores_nuevos)
    VALUES (NEW.usuario_autoriza, 'PACIENTE', NEW.id_paciente, 'EDICION', CONCAT('estado_baja=Baja; motivo=', NEW.motivo_baja));
END //

-- Auditoría de ediciones sobre el historial clínico.
CREATE TRIGGER trg_auditoria_historial_update
AFTER UPDATE ON HISTORIAL_CLINICO
FOR EACH ROW
BEGIN
    INSERT INTO AUDITORIA_SISTEMA (usuario_accion, tabla_afectada, id_registro_afectado, tipo_operacion, valores_anteriores, valores_nuevos)
    VALUES (
        IFNULL(NEW.medico_tratante, 'desconocido'),
        'HISTORIAL_CLINICO',
        NEW.id_historial,
        'EDICION',
        CONCAT('diagnostico=', OLD.diagnostico, '; tratamiento=', OLD.tratamiento),
        CONCAT('diagnostico=', NEW.diagnostico, '; tratamiento=', NEW.tratamiento)
    );
END //

-- Auditoría de cambios de estado de pago en factura.
CREATE TRIGGER trg_auditoria_factura_update
AFTER UPDATE ON FACTURA
FOR EACH ROW
BEGIN
    IF NEW.estado_pago <> OLD.estado_pago THEN
        INSERT INTO AUDITORIA_SISTEMA (usuario_accion, tabla_afectada, id_registro_afectado, tipo_operacion, valores_anteriores, valores_nuevos)
        VALUES (
            IFNULL(NEW.cajero_responsable, 'desconocido'),
            'FACTURA',
            NEW.id_factura,
            'EDICION',
            CONCAT('estado_pago=', OLD.estado_pago),
            CONCAT('estado_pago=', NEW.estado_pago)
        );
    END IF;
END //

-- Cada pago registrado recalcula el estado de la factura.
CREATE TRIGGER trg_pago_actualiza_factura
AFTER INSERT ON PAGO
FOR EACH ROW
BEGIN
    DECLARE v_total_pagado DECIMAL(10,2);
    DECLARE v_total_factura DECIMAL(10,2);

    SELECT IFNULL(SUM(monto), 0) INTO v_total_pagado FROM PAGO WHERE id_factura = NEW.id_factura;
    SELECT total_pagar INTO v_total_factura FROM FACTURA WHERE id_factura = NEW.id_factura;

    IF v_total_pagado >= v_total_factura THEN
        UPDATE FACTURA SET estado_pago = 'Pagado' WHERE id_factura = NEW.id_factura;
    ELSE
        UPDATE FACTURA SET estado_pago = 'Parcial' WHERE id_factura = NEW.id_factura;
    END IF;
END //

DELIMITER ;