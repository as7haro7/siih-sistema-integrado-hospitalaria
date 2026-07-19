"""
Servicio de descuento FIFO de stock.
Réplica en Python del procedimiento sp_descontar_stock_fifo de la BD,
para dar mensajes de error claros en la capa de aplicación antes de
que el trigger de la BD lo rechace.
"""
from django.db import transaction
from rest_framework.exceptions import ValidationError
from .models import Medicamento, LoteMedicamento


def verificar_stock_disponible(medicamento_id: int, cantidad: int) -> bool:
    """Verifica si hay stock suficiente sin modificar nada."""
    try:
        med = Medicamento.objects.get(pk=medicamento_id)
        return med.stock_actual >= cantidad
    except Medicamento.DoesNotExist:
        return False


def descontar_stock_fifo(medicamento_id: int, cantidad: int) -> dict:
    """
    Descuenta stock usando lógica FIFO (primero el lote que vence antes).

    Esta función se ejecuta ANTES de que el trigger de la BD haga lo mismo
    como defensa en profundidad. En caso de que la validación pase aquí
    pero falle en la BD (race condition), el trigger de la BD es la última
    línea de defensa.

    Returns:
        dict con información del despacho (lotes afectados, alerta de stock bajo)

    Raises:
        ValidationError si no hay stock suficiente.
    """
    try:
        medicamento = Medicamento.objects.get(pk=medicamento_id)
    except Medicamento.DoesNotExist:
        raise ValidationError(f"Medicamento con ID {medicamento_id} no existe.")

    if medicamento.stock_actual < cantidad:
        raise ValidationError(
            {
                "detail": "Stock insuficiente para despachar la receta.",
                "medicamento": medicamento.nombre_comercial,
                "stock_disponible": medicamento.stock_actual,
                "cantidad_solicitada": cantidad,
                "faltante": cantidad - medicamento.stock_actual,
            }
        )

    # El descuento real lo maneja el trigger de la BD cuando se actualiza
    # estado_despacho a 'Entregado'. Aquí solo verificamos y devolvemos
    # información útil.
    lotes = (
        LoteMedicamento.objects
        .filter(id_medicamento=medicamento, cantidad_actual__gt=0)
        .order_by("fecha_vencimiento")
    )

    lotes_afectados = []
    restante = cantidad
    for lote in lotes:
        if restante <= 0:
            break
        tomar = min(lote.cantidad_actual, restante)
        lotes_afectados.append({
            "lote": lote.numero_lote,
            "cantidad_tomada": tomar,
            "vencimiento": str(lote.fecha_vencimiento),
        })
        restante -= tomar

    stock_despues = medicamento.stock_actual - cantidad
    alerta_stock_bajo = stock_despues <= medicamento.stock_minimo

    return {
        "medicamento": medicamento.nombre_comercial,
        "cantidad_despachada": cantidad,
        "lotes_afectados": lotes_afectados,
        "stock_resultante": stock_despues,
        "alerta_stock_bajo": alerta_stock_bajo,
        "stock_minimo": medicamento.stock_minimo,
    }
