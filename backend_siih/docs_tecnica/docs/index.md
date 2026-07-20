# Introducción y Arquitectura

Bienvenido al **Manual Técnico** del sistema backend para la **Clínica SIIH**. Este documento tiene como objetivo proporcionar una guía detallada sobre la arquitectura, estructura y decisiones de diseño implementadas en el proyecto.

## Objetivos del Sistema

El backend de la Clínica SIIH es una API RESTful robusta diseñada para manejar todos los procesos internos de una clínica, desde la admisión de pacientes y programación de citas hasta la facturación, gestión de farmacia y control de hospitalización.

## Arquitectura y Stack Tecnológico

El sistema ha sido construido siguiendo el patrón arquitectónico de API RESTful utilizando las siguientes tecnologías:

- **Lenguaje:** Python 3
- **Framework Principal:** Django 4.2.*
- **Framework API:** Django REST Framework (DRF)
- **Base de Datos:** MySQL
- **Autenticación:** JSON Web Tokens (JWT) mediante `djangorestframework-simplejwt`
- **Generación de Reportes:** Pandas y OpenPyXL para exportación de datos a Excel/CSV.
- **Documentación API:** Swagger y ReDoc integrados mediante `drf-spectacular`.

## Patrones de Diseño Utilizados

El proyecto utiliza una variante del patrón **Modelo-Vista-Controlador (MVC)**, adaptado por Django como **Modelo-Template-Vista (MTV)**. Sin embargo, al tratarse de una API, el flujo es el siguiente:

1. **Modelos (Models):** Mapeo de la base de datos MySQL (muchos bajo el enfoque `managed=False` para convivir con una base de datos ya diseñada con su propia lógica de base de datos como Triggers y Procedimientos).
2. **Serializadores (Serializers):** Capa encargada de traducir los modelos a formato JSON y viceversa, además de aplicar validaciones.
3. **Vistas (ViewSets):** Controladores basados en clases (ModelViewSet, ReadOnlyModelViewSet) que exponen de forma automática el CRUD de los modelos.
4. **Enrutadores (Routers):** Generación automática de las URLs para los endpoints.

## Enfoque "Database First"

Una decisión arquitectónica clave de este sistema es el enfoque "Database First". Muchas reglas de negocio críticas, como el cálculo de subtotales, la validación de inventario y la integridad referencial, están delegadas a la base de datos MySQL. Esto permite un sistema más rápido y seguro, asegurando que la lógica no dependa exclusivamente del lado de Django.

---
Para más detalles sobre cómo instalar y levantar el sistema, consulta la sección de [Configuración y Despliegue](configuracion.md).
