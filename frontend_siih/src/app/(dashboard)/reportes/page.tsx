'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { DateRangePicker } from '@/components/shared/DateRangePicker';
import { Button } from '@/components/ui/Button';
import { BarChart3, LineChart, PieChart, ArrowRight, Activity, Calendar } from 'lucide-react';
import { subDays } from 'date-fns';

export default function ReportesIndexPage() {
  const router = useRouter();

  // Default to last 30 days
  const [startDate, setStartDate] = useState(
    subDays(new Date(), 30).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const navigateToReport = (path: string) => {
    router.push(`${path}?fecha_inicio=${startDate}&fecha_fin=${endDate}`);
  };

  return (
    <RoleGuard allowedRoles={['Administrador', 'Director']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reportes y Estadísticas (MIS)</h1>
          <p className="text-muted-foreground">
            Módulo de Información Gerencial para análisis de rendimiento, medicamentos e ingresos.
          </p>
        </div>

        {/* Global Date Filter */}
        <Card className="glass-card">
          <CardHeader className="pb-3 flex flex-row items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base">Filtro Temporal Global</CardTitle>
              <CardDescription>
                Defina el rango de fechas que se aplicará al consultar los reportes.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <DateRangePicker 
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
          </CardContent>
        </Card>

        {/* Reports Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Report 1: Ingresos */}
          <Card className="glass-card flex flex-col justify-between h-64 hover:border-primary/40 transition-colors">
            <CardHeader>
              <div className="p-2 w-10 bg-primary/10 rounded-lg text-primary mb-2">
                <PieChart className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg">Ingresos Financieros</CardTitle>
              <CardDescription>
                Consolidado financiero de montos facturados, cobrados e importes pendientes de cobro.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <Button 
                onClick={() => navigateToReport('/reportes/ingresos')}
                className="w-full flex items-center justify-between"
              >
                <span>Ver Reporte</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Report 2: Consumo Medicamentos */}
          <Card className="glass-card flex flex-col justify-between h-64 hover:border-primary/40 transition-colors">
            <CardHeader>
              <div className="p-2 w-10 bg-emerald-500/10 rounded-lg text-emerald-400 mb-2">
                <LineChart className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg">Consumo de Medicamentos</CardTitle>
              <CardDescription>
                Análisis mensual de medicamentos dispensados en farmacia y estado de alertas de stock.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <Button 
                onClick={() => navigateToReport('/reportes/consumo-medicamentos')}
                className="w-full flex items-center justify-between"
              >
                <span>Ver Reporte</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Report 3: Pacientes por Especialidad */}
          <Card className="glass-card flex flex-col justify-between h-64 hover:border-primary/40 transition-colors">
            <CardHeader>
              <div className="p-2 w-10 bg-yellow-500/10 rounded-lg text-yellow-400 mb-2">
                <BarChart3 className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg">Pacientes por Especialidad</CardTitle>
              <CardDescription>
                Estadísticas de afluencia de pacientes atendidos y citas registradas clasificadas por especialidad médica.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <Button 
                onClick={() => navigateToReport('/reportes/pacientes-especialidad')}
                className="w-full flex items-center justify-between"
              >
                <span>Ver Reporte</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
