'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { Hospitalizacion } from '@/types';
import { getHospitalizacion, darDeAlta } from '@/services/hospitalizacionService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { ArrowLeft, UserMinus, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { isAxiosError } from 'axios';

export default function HospitalizacionDetallePage() {
  const { id } = useParams();
  const router = useRouter();
  const [hospitalizacion, setHospitalizacion] = useState<Hospitalizacion | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isAltaModalOpen, setIsAltaModalOpen] = useState(false);
  const [diagnosticoEgreso, setDiagnosticoEgreso] = useState('');
  const [procesandoAlta, setProcesandoAlta] = useState(false);

  const fetchHospitalizacion = async () => {
    try {
      const data = await getHospitalizacion(Number(id));
      setHospitalizacion(data);
    } catch (error) {
      toast.error('Error al cargar la internación');
      router.push('/medico/hospitalizaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitalizacion();
  }, [id]);

  const handleDarDeAlta = async () => {
    try {
      setProcesandoAlta(true);
      await darDeAlta(Number(id), { diagnostico_egreso: diagnosticoEgreso });
      toast.success('Alta médica registrada con éxito');
      setIsAltaModalOpen(false);
      fetchHospitalizacion(); // Refresh data
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.detail || 'Error al dar de alta');
      } else {
        toast.error('Error al procesar el alta');
      }
    } finally {
      setProcesandoAlta(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Cargando datos...</div>;
  }

  if (!hospitalizacion) return null;

  return (
    <RoleGuard allowedRoles={['Administrador', 'Médico', 'Enfermera']}>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.push('/medico/hospitalizaciones')}>
              <ArrowLeft size={18} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Detalle de Internación</h1>
              <p className="text-muted-foreground">ID #{hospitalizacion.id_hospitalizacion}</p>
            </div>
          </div>
          
          {hospitalizacion.estado_internacion === 'Activo' && (
            <Button onClick={() => setIsAltaModalOpen(true)} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
              <UserMinus size={16} /> Dar de Alta
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Paciente</Label>
                  <p className="font-medium">{hospitalizacion.paciente_nombre}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Médico Responsable</Label>
                  <p className="font-medium">{hospitalizacion.medico_nombre}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Ubicación</Label>
                  <p className="font-medium">{hospitalizacion.cama_info}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Estado Actual</Label>
                  <div className="mt-1">
                    <StatusBadge status={hospitalizacion.estado_internacion} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cronología y Diagnóstico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1">
                  <Clock size={12} /> Fecha de Ingreso
                </Label>
                <p className="font-medium">{format(parseISO(hospitalizacion.fecha_ingreso), 'dd/MM/yyyy HH:mm')}</p>
              </div>
              {hospitalizacion.fecha_egreso && (
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1">
                    <Clock size={12} /> Fecha de Egreso
                  </Label>
                  <p className="font-medium">{format(parseISO(hospitalizacion.fecha_egreso), 'dd/MM/yyyy HH:mm')}</p>
                </div>
              )}
              <div className="pt-2 border-t mt-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Diagnóstico de Ingreso</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap">{hospitalizacion.diagnostico_ingreso || 'No especificado'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {isAltaModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
              <h2 className="text-xl font-bold">Dar de Alta a Paciente</h2>
              <p className="text-sm text-muted-foreground">
                ¿Está seguro de que desea dar de alta al paciente {hospitalizacion.paciente_nombre}? Esta acción liberará la cama actual.
              </p>
              
              <div className="space-y-2">
                <Label>Diagnóstico de Egreso (Opcional)</Label>
                <textarea 
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Escriba las indicaciones de alta, tratamiento a seguir, etc."
                  value={diagnosticoEgreso}
                  onChange={(e) => setDiagnosticoEgreso(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAltaModalOpen(false)} disabled={procesandoAlta}>
                  Cancelar
                </Button>
                <Button onClick={handleDarDeAlta} disabled={procesandoAlta}>
                  {procesandoAlta ? 'Procesando...' : 'Confirmar Alta'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
