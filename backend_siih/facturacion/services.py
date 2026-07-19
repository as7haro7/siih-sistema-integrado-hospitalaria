"""
Servicio de consolidación de facturas.
Arma FACTURA + FACTURA_DETALLE a partir de los cargos de un historial
o una hospitalización (RF-08).
"""
from decimal import Decimal
from django.db import transaction

from clinico.models import HistorialClinico
from hospitalizacion.models import Hospitalizacion
from farmacia.models import RecetaDetalle
from laboratorio.models import ExamenLaboratorio
from .models import ConfigImpuesto, Factura, FacturaDetalle


@transaction.atomic
def consolidar_factura(
    *,
    id_historial: int = None,
    id_hospitalizacion: int = None,
    id_impuesto: int,
    nit_factura: str = "",
    razon_social: str = "",
    cajero: str = "",
) -> Factura:
    """
    Consolida todos los cargos asociados a un historial y/o
    hospitalización en una sola factura.

    Cargos incluidos:
    - Recetas despachadas (medicamentos × precio unitario)
    - Exámenes de laboratorio completados
    - Días de internación × tarifa de habitación (si aplica)
    """
    impuesto = ConfigImpuesto.objects.get(pk=id_impuesto)
    detalles = []
    subtotal = Decimal("0.00")

    # ── Recetas despachadas ──────────────────────────────────────
    if id_historial:
        recetas = RecetaDetalle.objects.filter(
            id_historial_id=id_historial,
            estado_despacho="Entregado",
        ).select_related("id_medicamento")

        for receta in recetas:
            linea_total = receta.cantidad_recetada * receta.id_medicamento.precio_unitario
            detalles.append({
                "concepto": f"{receta.id_medicamento.nombre_comercial} (x{receta.cantidad_recetada})",
                "cantidad": receta.cantidad_recetada,
                "precio_unitario": receta.id_medicamento.precio_unitario,
            })
            subtotal += linea_total

    # ── Exámenes completados ─────────────────────────────────────
    if id_historial:
        examenes = ExamenLaboratorio.objects.filter(
            id_historial_id=id_historial,
            estado_examen="Completado",
        )

        for examen in examenes:
            detalles.append({
                "concepto": f"Examen: {examen.tipo_examen}",
                "cantidad": 1,
                "precio_unitario": examen.costo_examen,
            })
            subtotal += examen.costo_examen

    # ── Días de internación ──────────────────────────────────────
    if id_hospitalizacion:
        hosp = Hospitalizacion.objects.select_related("id_cama__id_tarifa").get(
            pk=id_hospitalizacion,
        )
        if hosp.fecha_egreso and hosp.fecha_ingreso:
            dias = max((hosp.fecha_egreso - hosp.fecha_ingreso).days, 1)
            costo_dia = hosp.id_cama.id_tarifa.costo_por_dia
            tipo_hab = hosp.id_cama.id_tarifa.tipo_habitacion

            detalles.append({
                "concepto": f"Internación {tipo_hab} ({dias} días)",
                "cantidad": dias,
                "precio_unitario": costo_dia,
            })
            subtotal += dias * costo_dia

    # ── Calcular impuesto ────────────────────────────────────────
    monto_impuesto = (subtotal * impuesto.porcentaje / Decimal("100")).quantize(
        Decimal("0.01")
    )

    # ── Crear factura ────────────────────────────────────────────
    factura = Factura.objects.create(
        id_historial_id=id_historial,
        id_hospitalizacion_id=id_hospitalizacion,
        id_impuesto=impuesto,
        nit_factura=nit_factura,
        razon_social=razon_social,
        subtotal=subtotal,
        monto_impuesto=monto_impuesto,
        cajero_responsable=cajero,
    )

    # ── Crear detalles ───────────────────────────────────────────
    for det in detalles:
        FacturaDetalle.objects.create(
            id_factura=factura,
            concepto=det["concepto"],
            cantidad=det["cantidad"],
            precio_unitario=det["precio_unitario"],
        )

    factura.refresh_from_db()  # Leer total_pagar generado por la BD
    return factura
