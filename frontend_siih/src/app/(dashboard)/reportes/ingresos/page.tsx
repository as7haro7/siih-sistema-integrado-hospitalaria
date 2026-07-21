'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { getReporteIngresos, getExportUrl } from '@/services/reportesService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { ReportChart } from '@/components/reportes/ReportChart';
import { DateRangePicker } from '@/components/shared/DateRangePicker';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ArrowLeft, Download, Wallet, CheckCircle2, AlertCircle, PieChart } from 'lucide-react';
import toast from 'react-hot-toast';

function IngresosContent() {
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
      const data = await getReporteIngresos(start, end);
      setReportData(data);
    } catch (error) {
      toast.error('Error al cargar reporte de ingresos financieros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(startDate, endDate);
  }, [startDate, endDate]);

  const handleExport = (format: 'excel' | 'csv') => {
    const url = getExportUrl('ingresos', format, startDate, endDate);
    window.open(url, '_blank');
  };

  const hasData = reportData && reportData.desglose_por_estado && reportData.desglose_por_estado.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={() => router.push('/reportes')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reporte: Ingresos Financieros</h1>
          <p className="text-muted-foreground">Consolidado general de facturación, cobros efectivos y saldos pendientes.</p>
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
            <Button variant="outline" onClick={() => handleExport('csv')} className="flex items-center space-x-1.5">
              <Download className="h-4 w-4" />
              <span>Exportar CSV</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12">Generando balance de ingresos...</div>
      ) : (
        <div className="space-y-6">
          {/* KPI Dashboard */}
          {reportData?.resumen && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-card">
                <CardContent className="pt-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Total Facturado</p>
                    <p className="text-3xl font-bold">Bs. {parseFloat(reportData.resumen.total_facturado).toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-full text-primary">
                    <Wallet className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="pt-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Cobrado Efectivo</p>
                    <p className="text-3xl font-bold text-emerald-400">Bs. {parseFloat(reportData.resumen.total_cobrado).toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-400">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="pt-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Pendiente de Cobro</p>
                    <p className="text-3xl font-bold text-red-400">Bs. {parseFloat(reportData.resumen.pendiente_cobro).toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-red-500/10 rounded-full text-red-400">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Graph & Tables */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pie Chart Card */}
            <Card className="glass-card md:col-span-1">
              <CardHeader>
                <CardTitle className="text-base flex items-center space-x-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  <span>Distribución por Estado</span>
                </CardTitle>
                <CardDescription>Proporción del volumen de facturas.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {hasData ? (
                  <ReportChart 
                    type="pie" 
                    data={reportData.desglose_por_estado} 
                    pieNameKey="estado_pago" 
                    pieValueKey="total" 
                    height={260}
                  />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">No hay datos</div>
                )}
              </CardContent>
            </Card>

            {/* Table Detail */}
            <Card className="glass-card md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Detalle por Estado de Factura</CardTitle>
                <CardDescription>Resumen de cobros clasificados por estado de pago de facturas.</CardDescription>
              </CardHeader>
              <CardContent>
                {!hasData ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">No se encontraron registros.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Estado Pago</TableHead>
                        <TableHead className="text-right">Cantidad Facturas</TableHead>
                        <TableHead className="text-right">Importe Total</TableHead>
                        <TableHead className="text-right">Cobrado Efectivo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.desglose_por_estado.map((row: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>
                            <StatusBadge status={row.estado_pago} />
                          </TableCell>
                          <TableCell className="text-right font-medium">{row.total_facturas}</TableCell>
                          <TableCell className="text-right">Bs. {parseFloat(row.total).toFixed(2)}</TableCell>
                          <TableCell className="text-right text-emerald-400 font-semibold">Bs. {parseFloat(row.total_cobrado).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default function IngresosReportePage() {
  return (
    <RoleGuard allowedRoles={['Administrador', 'Director']}>
      <Suspense fallback={<div className="text-center py-12">Cargando...</div>}>
        <IngresosContent />
      </Suspense>
    </RoleGuard>
  );
}