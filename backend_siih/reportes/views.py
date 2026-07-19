"""
Endpoints de reportes / MIS (HU-08).
Exportación a Excel/CSV usando Pandas.
"""
import io
from datetime import date, timedelta

import pandas as pd
from django.http import HttpResponse
from django.db import connection
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from accounts.permissions import IsAdmin, IsDirector


def _export_dataframe(df, filename, formato):
    """Exporta un DataFrame a Excel o CSV según el formato solicitado."""
    if formato == "excel":
        buffer = io.BytesIO()
        with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
            df.to_excel(writer, index=False, sheet_name="Reporte")
        buffer.seek(0)
        response = HttpResponse(
            buffer.getvalue(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = f'attachment; filename="{filename}.xlsx"'
        return response
    else:
        # CSV por defecto
        response = HttpResponse(content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = f'attachment; filename="{filename}.csv"'
        df.to_csv(response, index=False)
        return response


@extend_schema(responses={200: dict})
@api_view(["GET"])
@permission_classes([(IsAdmin | IsDirector)])
def pacientes_por_especialidad(request):
    """
    Reporte: cantidad de pacientes atendidos por especialidad.

    Query params:
        formato: 'json' (default), 'excel', 'csv'
        fecha_inicio: YYYY-MM-DD (default: hace 30 días)
        fecha_fin: YYYY-MM-DD (default: hoy)
    """
    formato = request.query_params.get("formato", "json")
    fecha_inicio = request.query_params.get(
        "fecha_inicio", (date.today() - timedelta(days=30)).isoformat()
    )
    fecha_fin = request.query_params.get("fecha_fin", date.today().isoformat())

    query = """
        SELECT
            e.nombre_especialidad AS especialidad,
            COUNT(DISTINCT c.id_paciente) AS total_pacientes,
            COUNT(c.id_cita) AS total_citas
        FROM CITA c
        JOIN MEDICO m ON c.id_medico = m.id_medico
        JOIN ESPECIALIDAD e ON m.id_especialidad = e.id_especialidad
        WHERE c.fecha_cita BETWEEN %s AND %s
          AND c.estado_cita NOT IN ('Cancelada')
        GROUP BY e.nombre_especialidad
        ORDER BY total_pacientes DESC
    """

    with connection.cursor() as cursor:
        cursor.execute(query, [fecha_inicio, fecha_fin])
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()

    df = pd.DataFrame(rows, columns=columns)

    if formato in ("excel", "csv"):
        return _export_dataframe(df, "pacientes_por_especialidad", formato)

    return Response({
        "reporte": "Pacientes por Especialidad",
        "periodo": {"inicio": fecha_inicio, "fin": fecha_fin},
        "datos": df.to_dict(orient="records"),
    })


@extend_schema(responses={200: dict})
@api_view(["GET"])
@permission_classes([(IsAdmin | IsDirector)])
def consumo_medicamentos(request):
    """
    Reporte: consumo mensual de medicamentos.

    Query params:
        formato: 'json' (default), 'excel', 'csv'
        fecha_inicio: YYYY-MM-DD
        fecha_fin: YYYY-MM-DD
    """
    formato = request.query_params.get("formato", "json")
    fecha_inicio = request.query_params.get(
        "fecha_inicio", (date.today() - timedelta(days=30)).isoformat()
    )
    fecha_fin = request.query_params.get("fecha_fin", date.today().isoformat())

    query = """
        SELECT
            med.nombre_comercial AS medicamento,
            SUM(rd.cantidad_recetada) AS total_despachado,
            med.stock_actual AS stock_actual,
            med.stock_minimo AS stock_minimo,
            CASE
                WHEN med.stock_actual <= med.stock_minimo THEN 'ALERTA'
                ELSE 'Normal'
            END AS estado_stock
        FROM RECETA_DETALLE rd
        JOIN MEDICAMENTO med ON rd.id_medicamento = med.id_medicamento
        JOIN HISTORIAL_CLINICO hc ON rd.id_historial = hc.id_historial
        WHERE rd.estado_despacho = 'Entregado'
          AND hc.fecha_registro BETWEEN %s AND %s
        GROUP BY med.id_medicamento, med.nombre_comercial,
                 med.stock_actual, med.stock_minimo
        ORDER BY total_despachado DESC
    """

    with connection.cursor() as cursor:
        cursor.execute(query, [fecha_inicio, fecha_fin])
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()

    df = pd.DataFrame(rows, columns=columns)

    if formato in ("excel", "csv"):
        return _export_dataframe(df, "consumo_medicamentos", formato)

    return Response({
        "reporte": "Consumo de Medicamentos",
        "periodo": {"inicio": fecha_inicio, "fin": fecha_fin},
        "datos": df.to_dict(orient="records"),
    })


@extend_schema(responses={200: dict})
@api_view(["GET"])
@permission_classes([(IsAdmin | IsDirector)])
def ingresos(request):
    """
    Reporte: ingresos financieros consolidados por período.

    Query params:
        formato: 'json' (default), 'excel', 'csv'
        fecha_inicio: YYYY-MM-DD
        fecha_fin: YYYY-MM-DD
    """
    formato = request.query_params.get("formato", "json")
    fecha_inicio = request.query_params.get(
        "fecha_inicio", (date.today() - timedelta(days=30)).isoformat()
    )
    fecha_fin = request.query_params.get("fecha_fin", date.today().isoformat())

    query = """
        SELECT
            f.estado_pago,
            COUNT(f.id_factura) AS total_facturas,
            COALESCE(SUM(f.subtotal), 0) AS subtotal,
            COALESCE(SUM(f.monto_impuesto), 0) AS impuestos,
            COALESCE(SUM(f.total_pagar), 0) AS total,
            COALESCE(SUM(p.total_pagado), 0) AS total_cobrado
        FROM FACTURA f
        LEFT JOIN (
            SELECT id_factura, SUM(monto) AS total_pagado
            FROM PAGO
            GROUP BY id_factura
        ) p ON f.id_factura = p.id_factura
        WHERE f.fecha_emision BETWEEN %s AND %s
        GROUP BY f.estado_pago
        ORDER BY total DESC
    """

    with connection.cursor() as cursor:
        cursor.execute(query, [fecha_inicio, fecha_fin])
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()

    df = pd.DataFrame(rows, columns=columns)

    if formato in ("excel", "csv"):
        return _export_dataframe(df, "ingresos_financieros", formato)

    # Resumen global
    resumen = {
        "total_facturado": float(df["total"].sum()) if not df.empty else 0,
        "total_cobrado": float(df["total_cobrado"].sum()) if not df.empty else 0,
    }
    resumen["pendiente_cobro"] = resumen["total_facturado"] - resumen["total_cobrado"]

    return Response({
        "reporte": "Ingresos Financieros",
        "periodo": {"inicio": fecha_inicio, "fin": fecha_fin},
        "resumen": resumen,
        "desglose_por_estado": df.to_dict(orient="records"),
    })
