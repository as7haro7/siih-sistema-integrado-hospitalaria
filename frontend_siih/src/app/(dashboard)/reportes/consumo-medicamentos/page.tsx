'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { getReporteConsumoMedicamentos, getExportUrl } from '@/services/reportesService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { ReportChart } from '@/components/reportes/ReportChart';
import { DateRangePicker } from '@/components/shared/DateRangePicker';
import { ArrowLeft, Download, Pill, Table as TableIcon } from 'lucide-react';
import toast from 'react-hot-toast';

function ConsumoMedicamentosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read query params or default to last 30 days
  const [startDate, setStartDate] = useState(
    searchParams.get('fecha_inicio') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    searchParams.get('fecha_fin') || new Date().toISOString().split('T')[0]
  );

  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async (start: string, end: string) => {
    setLoading(true);
    try {
      const data = await getReporteConsumoMedicamentos(start, end);
      setReportData(data);
    } catch (error) {
      toast.error('Error al cargar reporte de consumo de medicamentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(startDate, endDate);
  }, [startDate, endDate]);

  const handleExport = async (format: 'excel' | 'pdf') => {
    const url = getExportUrl('consumo-medicamentos', format, startDate, endDate);
    window.open(url, '_blank');
  };

  const hasData = reportData && reportData.datos && reportData.datos.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={() => router.push('/reportes')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reporte: Consumo de Medicamentos</h1>
          <p className="text-muted-foreground">Estadísticas de consumo mensual de fármacos despachados y estado de inventario.</p>
        </div>
      </div>

      {/* Date Filters & Exports */}
      <Card className="glass-card">
        <CardContent className="pt-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <DateRangePicker 
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => handleExport('excel')} className="flex items-center space-x-1.5">
              <Download className="h-4 w-4" />
              <span>Exportar Excel</span>
            </Button>
            <Button variant="outline" onClick={() => handleExport('excel')} className="flex items-center space-x-1.5">
              <Download className="h-4 w-4" />
              <span>Exportar CSV</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12">Generando reporte de farmacia...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Chart Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <Pill className="h-5 w-5 text-primary" />
                <span>Medicamentos Más Despachados</span>
              </CardTitle>
              <CardDescription>Cantidades totales de unidades despachadas por prescripciones médicas.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {hasData ? (
                <ReportChart 
                  type="bar" 
                  data={reportData.datos} 
                  xKey="medicamento" 
                  yKeys={['total_despachado']} 
                  height={320}
                  colors={['#10b981']} // Emerald theme
                />
              ) : (
                <div className="text-center py-12 text-muted-foreground">No hay datos en el rango seleccionado</div>
              )}
            </CardContent>
          </Card>

          {/* Table Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <TableIcon className="h-5 w-5 text-emerald-400" />
                <span>Detalle de Consumo e Inventario</span>
              </CardTitle>
              <CardDescription>Estado de existencias actuales frente al consumo temporal.</CardDescription>
            </CardHeader>
            <CardContent>
              {!hasData ? (
                <div className="text-center py-6 text-muted-foreground text-sm">No se encontraron registros.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicamento</TableHead>
                      <TableHead className="text-right">Total Despachado</TableHead>
                      <TableHead className="text-right">Stock Actual</TableHead>
                      <TableHead className="text-right">Stock Mínimo</TableHead>
                      <TableHead className="text-right">Estado Inventario</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.datos.map((row: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-semibold">{row.medicamento}</TableCell>
                        <TableCell className="text-right font-medium text-emerald-400">{row.total_despachado} ud.</TableCell>
                        <TableCell className="text-right">{row.stock_actual} ud.</TableCell>
                        <TableCell className="text-right text-muted-foreground">{row.stock_minimo} ud.</TableCell>
                        <TableCell className="text-right">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            row.estado_stock === 'ALERTA' 
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {row.estado_stock === 'ALERTA' ? 'Alerta Reposición' : 'Normal'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function ConsumoMedicamentosPage() {
  return (
    <RoleGuard allowedRoles={['Administrador', 'Director']}>
      <Suspense fallback={<div className="text-center py-12">Cargando...</div>}>
        <ConsumoMedicamentosContent />
      </Suspense>
    </RoleGuard>
  );
}
