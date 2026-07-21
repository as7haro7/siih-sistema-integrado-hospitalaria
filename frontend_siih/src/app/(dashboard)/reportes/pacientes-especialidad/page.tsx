'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { getReportePacientesEspecialidad, getExportUrl } from '@/services/reportesService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { ReportChart } from '@/components/reportes/ReportChart';
import { DateRangePicker } from '@/components/shared/DateRangePicker';
import { ArrowLeft, Download, BarChart3, Table as TableIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

function PacientesEspecialidadContent() {
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
      const data = await getReportePacientesEspecialidad(start, end);
      setReportData(data);
    } catch (error) {
      toast.error('Error al cargar reporte de pacientes por especialidad');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(startDate, endDate);
  }, [startDate, endDate]);

  const handleExport = async (format: 'excel' | 'pdf') => {
    const url = getExportUrl('pacientes-por-especialidad', format, startDate, endDate);
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
          <h1 className="text-2xl font-bold tracking-tight">Reporte: Pacientes por Especialidad</h1>
          <p className="text-muted-foreground">Distribución de citas y afluencia de pacientes atendidos por área médica.</p>
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
        <div className="text-center py-12">Generando reporte gerencial...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Chart Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span>Gráfico Estadístico</span>
              </CardTitle>
              <CardDescription>Comparativa entre Total de Pacientes Únicos y Citas Atendidas.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {hasData ? (
                <ReportChart 
                  type="bar" 
                  data={reportData.datos} 
                  xKey="especialidad" 
                  yKeys={['total_pacientes', 'total_citas']} 
                  height={320}
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
                <span>Detalle de Afluencia</span>
              </CardTitle>
              <CardDescription>Resumen de datos consolidados del período.</CardDescription>
            </CardHeader>
            <CardContent>
              {!hasData ? (
                <div className="text-center py-6 text-muted-foreground text-sm">No se encontraron registros.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Especialidad Médica</TableHead>
                      <TableHead className="text-right">Pacientes Únicos Atendidos</TableHead>
                      <TableHead className="text-right">Total Citas Registradas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.datos.map((row: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-semibold">{row.especialidad}</TableCell>
                        <TableCell className="text-right font-medium text-primary">{row.total_pacientes}</TableCell>
                        <TableCell className="text-right text-emerald-400">{row.total_citas}</TableCell>
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

export default function PacientesEspecialidadPage() {
  return (
    <RoleGuard allowedRoles={['Administrador', 'Director']}>
      <Suspense fallback={<div className="text-center py-12">Cargando...</div>}>
        <PacientesEspecialidadContent />
      </Suspense>
    </RoleGuard>
  );
}