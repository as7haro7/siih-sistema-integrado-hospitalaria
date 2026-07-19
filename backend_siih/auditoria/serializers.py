"""Serializers para auditoría."""
from rest_framework import serializers
from .models import AuditoriaSistema


class AuditoriaSistemaSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditoriaSistema
        fields = "__all__"
