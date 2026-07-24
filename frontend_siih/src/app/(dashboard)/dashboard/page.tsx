'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Activity, Users, DollarSign, CreditCard, Stethoscope, BedDouble,
  FlaskConical, Pill, FileText, AlertTriangle, ClipboardList
} from 'lucide-react';
import { getReporteIngresos } from '@/services/reportesService';
import { getUsers } from '@/services/usuariosService';
import { formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const { user, hasRole } = useAuthStore();

  const [loading, setLoading] = useState(true);
  // Admin
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  // Admin / Director
  const [ingresos, setIngresos] = useState({ cobrado: 0, pendiente: 0, facturas: 0 });
  // Recepcionista
  const [citasHoy, setCitasHoy] = useState(0);
  const [emergenciasActivas, setEmergenciasActivas] = useState(0);
  // Médico
  const [hospActivas, setHospActivas] = useState(0);
  // Enfermera (comparte hospActivas)
  // Técnico Lab
  const [examenesPendientes, setExamenesPendientes] = useState(0);
  // Farmacéutico
  const [recetasPendientes, setRecetasPendientes] = useState(0);
  const [stockBajo, setStockBajo] = useState(0);
  // Cajero
  const [facturasPendientes, setFacturasPendientes] = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      try {
        const promises: Promise<void>[] = [];

        // Admin
        if (hasRole('Administrador')) {
          promises.push(
            getUsers().then(d => setTotalUsuarios(d.count || d.results?.length || 0)).catch(() => {})
          );
        }

        // Admin / Director
        if (hasRole('Administrador') || hasRole('Director')) {
          promises.push(
            getReporteIngresos().then(d => {
              let facturas = 0;
              d.desglose_por_estado?.forEach((i: any) => { facturas += i.total_facturas; });
              setIngresos({
                cobrado: d.resumen?.total_cobrado || 0,
                pendiente: d.resumen?.pendiente_cobro || 0,
                facturas,
              });
            }).catch(() => {})
          );
        }

        // Recepcionista / Médico
        if (hasRole('Recepcionista') || hasRole('Médico') || hasRole('Administrador')) {
          promises.push(
            api.get(`/citas/?fecha_cita=${today}`).then(({ data }) => {
              const list = data.results || data;
              setCitasHoy(Array.isArray(list) ? list.length : data.count || 0);
            }).catch(() => {})
          );
        }

        // Recepcionista
        if (hasRole('Recepcionista') || hasRole('Administrador')) {
          promises.push(
            api.get('/emergencias/').then(({ data }) => {
              const list = data.results || data;
              setEmergenciasActivas(Array.isArray(list) ? list.length : data.count || 0);
            }).catch(() => {})
          );
        }

        // Médico / Enfermera
        if (hasRole('Médico') || hasRole('Enfermera') || hasRole('Administrador')) {
          promises.push(
            api.get('/hospitalizaciones/?estado_internacion=Activo').then(({ data }) => {
              const list = data.results || data;
              setHospActivas(Array.isArray(list) ? list.length : data.count || 0);
            }).catch(() => {})
          );
        }

        // Técnico de Laboratorio
        if (hasRole('Técnico de Laboratorio') || hasRole('Administrador')) {
          promises.push(
            api.get('/examenes/?estado_examen=Pendiente').then(({ data }) => {
              const list = data.results || data;
              setExamenesPendientes(Array.isArray(list) ? list.length : data.count || 0);
            }).catch(() => {})
          );
        }

        // Farmacéutico
        if (hasRole('Farmacéutico') || hasRole('Administrador')) {
          promises.push(
            api.get('/recetas/pendientes/').then(({ data }) => {
              const list = Array.isArray(data) ? data : data.results || [];
              setRecetasPendientes(list.length);
            }).catch(() => {}),
            api.get('/medicamentos/alertas/').then(({ data }) => {
              setStockBajo(data.stock_bajo?.length || 0);
            }).catch(() => {})
          );
        }

        // Cajero
        if (hasRole('Cajero') || hasRole('Administrador')) {
          promises.push(
            api.get('/facturas/?estado_pago=Pendiente').then(({ data }) => {
              const list = data.results || data;
              setFacturasPendientes(Array.isArray(list) ? list.length : data.count || 0);
            }).catch(() => {})
          );
        }

        await Promise.allSettled(promises);
      } catch (err) {
        console.error('Error loading dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [hasRole]);

  const V = (v: number | string) => loading ? '...' : v;

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Bienvenido, {user?.first_name || user?.username} {user?.last_name}.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        {/* ─── Admin ─── */}
        {hasRole('Administrador') && (
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Registrados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{V(totalUsuarios)}</div>
              <p className="text-xs text-muted-foreground">Personal con acceso al sistema</p>
            </CardContent>
          </Card>
        )}

        {/* ─── Admin / Director — Financieros ─── */}
        {(hasRole('Administrador') || hasRole('Director')) && (
          <>
            <Card className="border-l-4 border-l-emerald-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Cobrados</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{V(formatCurrency(ingresos.cobrado))}</div>
                <p className="text-xs text-muted-foreground">Últimos 30 días</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cuentas por Cobrar</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{V(formatCurrency(ingresos.pendiente))}</div>
                <p className="text-xs text-muted-foreground">Pendientes de pago</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Facturas</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{V(ingresos.facturas)}</div>
                <p className="text-xs text-muted-foreground">Emitidas (30 días)</p>
              </CardContent>
            </Card>
          </>
        )}

        {/* ─── Recepcionista ─── */}
        {(hasRole('Recepcionista') || hasRole('Administrador')) && (
          <>
            <Card className="border-l-4 border-l-sky-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Citas de Hoy</CardTitle>
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{V(citasHoy)}</div>
                <p className="text-xs text-muted-foreground">Agendadas para hoy</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emergencias Registradas</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{V(emergenciasActivas)}</div>
                <p className="text-xs text-muted-foreground">Total en el sistema</p>
              </CardContent>
            </Card>
          </>
        )}

        {/* ─── Médico ─── */}
        {hasRole('Médico') && (
          <>
            <Card className="border-l-4 border-l-sky-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Citas de Hoy</CardTitle>
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{V(citasHoy)}</div>
                <p className="text-xs text-muted-foreground">Pacientes por atender</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-violet-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hospitalizaciones Activas</CardTitle>
                <BedDouble className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{V(hospActivas)}</div>
                <p className="text-xs text-muted-foreground">Pacientes internados</p>
              </CardContent>
            </Card>
          </>
        )}

        {/* ─── Enfermera ─── */}
        {hasRole('Enfermera') && (
          <Card className="border-l-4 border-l-violet-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hospitalizaciones Activas</CardTitle>
              <BedDouble className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{V(hospActivas)}</div>
              <p className="text-xs text-muted-foreground">Pacientes internados</p>
            </CardContent>
          </Card>
        )}

        {/* ─── Técnico de Laboratorio ─── */}
        {hasRole('Técnico de Laboratorio') && (
          <Card className="border-l-4 border-l-cyan-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Exámenes Pendientes</CardTitle>
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{V(examenesPendientes)}</div>
              <p className="text-xs text-muted-foreground">En cola de procesamiento</p>
            </CardContent>
          </Card>
        )}

        {/* ─── Farmacéutico ─── */}
        {hasRole('Farmacéutico') && (
          <>
            <Card className="border-l-4 border-l-teal-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recetas Pendientes</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{V(recetasPendientes)}</div>
                <p className="text-xs text-muted-foreground">Por despachar</p>
              </CardContent>
            </Card>

            <Card className={`border-l-4 ${stockBajo > 0 ? 'border-l-red-500' : 'border-l-green-500'}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alertas de Stock</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stockBajo > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {V(stockBajo)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stockBajo > 0 ? 'Medicamentos con stock bajo' : 'Inventario en orden'}
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {/* ─── Cajero ─── */}
        {hasRole('Cajero') && (
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Facturas Pendientes</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{V(facturasPendientes)}</div>
              <p className="text-xs text-muted-foreground">Por cobrar</p>
            </CardContent>
          </Card>
        )}
      </div>


    </div>
  );
}
