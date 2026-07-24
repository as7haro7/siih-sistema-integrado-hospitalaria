<div align="center">
  <h2>UNIVERSIDAD MAYOR DE SAN ANDRÉS</h2>
  <h3>FACULTAD DE CIENCIAS PURAS Y NATURALES</h3>
  <h3>CARRERA DE INFORMÁTICA</h3>
  <br>
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Escudo_de_la_Universidad_Mayor_de_San_Andr%C3%A9s.svg/1200px-Escudo_de_la_Universidad_Mayor_de_San_Andr%C3%A9s.svg.png" alt="Logo UMSA" width="200" />
  <br><br>
  <h3>INFORME TÉCNICO</h3>
  <h2>DESARROLLO DEL SISTEMA INTEGRADO DE INFORMACIÓN HOSPITALARIA (SIIH)</h2>
</div>

<br>

**INTEGRANTES:**
1. Univ. Angulo Balboa Brian
2. Univ. Choquehuanca Huanca Saúl Mijael
3. Univ. Paredes Larico Cristian
4. Univ. Poma Condori Erick Fernando

**LA PAZ - BOLIVIA**  
**2026**

---

## Acerca del Proyecto (SIIH)

El **Sistema Integrado de Información Hospitalaria (SIIH)** es una plataforma completa diseñada para automatizar y centralizar los procesos internos de una clínica u hospital. 

El sistema está organizado en módulos según los roles del personal:
- **Recepción:** Admisión de pacientes y programación de citas.
- **Consultorio / Médico:** Historial clínico, emisión de recetas, órdenes de laboratorio, emergencias y control de hospitalización (asignación de camas).
- **Farmacia:** Inventario FIFO, gestión de proveedores, lotes y despacho de recetas.
- **Laboratorio:** Recepción y resultados de exámenes médicos.
- **Caja (Facturación):** Consolidación de ingresos y pagos parciales de facturas.

### Tecnologías Utilizadas
- **Base de Datos:** MySQL (Enfoque *Database First* con Triggers para auditoría y cálculos automáticos).
- **Backend:** Python + Django REST Framework (API RESTful + Seguridad JWT).
- **Frontend:** React + Next.js (Interfaz gráfica para los usuarios).

### Documentación
Puedes encontrar la documentación técnica detallada (arquitectura, modelo de base de datos, diagrama ER y endpoints) dentro de la carpeta `backend_siih/docs_tecnica/`.
