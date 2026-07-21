'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Activity, Users, DollarSign, CreditCard } from 'lucide-react';
import { getReporteIngresos } from '@/services/reportesService';
import { getUsers } from '@/services/usuariosService';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const { user, hasRole } = useAuthStore();
  
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [ingresos, setIngresos] = useState({
    cobrado: 0,
    pendiente: 0,
    facturas: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Only fetch all users if Admin (role check or try/catch if API blocks it)
        if (hasRole('Administrador')) {
          const users = await getUsers();
          setTotalUsuarios(users.count || users.results?.length || 0);
        }

        // Fetch ingresos (Admin or Director)
        if (hasRole('Administrador') || hasRole('Director')) {
          const ingresosData = await getReporteIngresos();
          
          let facturas = 0;
          if (ingresosData.desglose_por_estado) {
            ingresosData.desglose_por_estado.forEach((item: any) => {
              facturas += item.total_facturas;
            });
          }
          
          setIngresos({
            cobrado: ingresosData.resumen?.total_cobrado || 0,
            pendiente: ingresosData.resumen?.pendiente_cobro || 0,
            facturas
          });
        }
      } catch (error) {
        console.error("Error loading dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [hasRole]);

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard General</h1>
        <p className="text-muted-foreground mt-2">
          Bienvenido de vuelta, {user?.first_name || user?.username} {user?.last_name}.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        
        {/* KPI: Usuarios Totales (Solo Admin) */}
        {(hasRole('Administrador')) && (
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Usuarios Registrados
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : totalUsuarios}
              </div>
              <p className="text-xs text-muted-foreground">
                Personal con acceso al sistema
              </p>
            </CardContent>
          </Card>
        )}

        {/* KPIs Financieros (Admin o Director) */}
        {(hasRole('Administrador') || hasRole('Director')) && (
          <>
            <Card className="border-l-4 border-l-medical-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Ingresos Cobrados
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : formatCurrency(ingresos.cobrado)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Últimos 30 días
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Cuentas por Cobrar
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {loading ? '...' : formatCurrency(ingresos.pendiente)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ingresos pendientes de pago
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Volumen de Facturas
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : ingresos.facturas}
                </div>
                <p className="text-xs text-muted-foreground">
                  Emitidas en los últimos 30 días
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Estado del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>El Sistema Integrado de Información Hospitalaria (SIIH) se encuentra <strong>100% completado</strong>.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Recepción:</strong> Pacientes, Citas y Emergencias (Triage).</li>
                <li><strong>Médico:</strong> Consultorio Clínico, Historial, Camas y Hospitalizaciones.</li>
                <li><strong>Laboratorio:</strong> Cola de exámenes médicos y resultados.</li>
                <li><strong>Farmacia:</strong> Inventario, Proveedores, Compras y Despacho de Recetas.</li>
                <li><strong>Caja:</strong> Facturación y consolidación de ingresos.</li>
              </ul>
              <p className="pt-2 text-primary font-medium">Puedes acceder a los módulos de tu rol desde el menú lateral.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
