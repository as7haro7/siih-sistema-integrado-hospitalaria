"""
Management command para inicializar los roles (Groups) del sistema SIIH.
Ejecutar una vez después de la primera migración:

    python manage.py crear_roles
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group


ROLES = [
    "Administrador",
    "Recepcionista",
    "Médico",
    "Enfermera",
    "Técnico de Laboratorio",
    "Farmacéutico",
    "Cajero",
    "Director",
]


class Command(BaseCommand):
    help = "Crea los roles (Groups) del sistema SIIH si no existen."

    def handle(self, *args, **options):
        creados = []
        existentes = []

        for role_name in ROLES:
            group, created = Group.objects.get_or_create(name=role_name)
            if created:
                creados.append(role_name)
            else:
                existentes.append(role_name)

        if creados:
            self.stdout.write(
                self.style.SUCCESS(f"Roles creados: {', '.join(creados)}")
            )
        if existentes:
            self.stdout.write(
                self.style.WARNING(f"Roles ya existentes: {', '.join(existentes)}")
            )

        self.stdout.write(self.style.SUCCESS("¡Inicialización de roles completada!"))
