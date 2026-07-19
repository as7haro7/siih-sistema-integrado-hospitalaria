"""
Modelo de perfil extendido para el User de Django.
Se usa un OneToOneField en vez de un User custom para no
complicar la integración con simplejwt y el admin.
"""
from django.conf import settings
from django.db import models


class PerfilUsuario(models.Model):
    """Información adicional asociada al usuario de Django."""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="perfil",
    )
    cargo = models.CharField(max_length=100, blank=True)
    telefono = models.CharField(max_length=20, blank=True)

    class Meta:
        verbose_name = "Perfil de usuario"
        verbose_name_plural = "Perfiles de usuario"

    def __str__(self):
        return f"Perfil de {self.user.username}"
