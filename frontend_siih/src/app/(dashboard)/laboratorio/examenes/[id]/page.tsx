'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { ExamenLaboratorio } from '@/types';
import { getExamen, cargarResultado } from '@/services/examenesService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ArrowLeft, Save, FlaskConical } from 'lucide-react';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';

export default function ExamenDetallePage() {
  const { id } = useParams();
  const router = useRouter();
  const [examen, setExamen] = useState<ExamenLaboratorio | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [resultadoTexto, setResultadoTexto] = useState('');
  const [estadoExamen, setEstadoExamen] = useState<'En Proceso' | 'Completado'>('Completado');

  useEffect(() => {
    const fetchExamen = async () => {
      try {
        const data = await getExamen(Number(id));
        setExamen(data);
        setResultadoTexto(data.resultado_texto || '');
        if (data.estado_examen === 'Completado' || data.estado_examen === 'En Proceso') {
          setEstadoExamen(data.estado_examen);
        }
      } catch (error) {
        toast.error('Error al cargar el examen');
        router.push('/laboratorio/examenes');
      } finally {
        setLoading(false);
      }
    };
    fetchExamen();
  }, [id, router]);

  const handleSave = async () => {
    if (!resultadoTexto.trim()) {
      toast.error('El resultado no puede estar vacío');
      return;
    }
    try {
      setSaving(true);
      await cargarResultado(Number(id), {
        resultado_texto: resultadoTexto,
        estado_examen: estadoExamen
      });
      toast.success('Resultado guardado exitosamente');
      router.push('/laboratorio/examenes');
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.detail || 'Error al guardar el resultado');
      } else {
        toast.error('Error al guardar el resultado');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Cargando examen...</div>;
  }

  if (!examen) return null;

  const isCompletado = examen.estado_examen === 'Completado';

  return (
    <RoleGuard allowedRoles={['Administrador', 'Técnico de Laboratorio']}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/laboratorio/examenes')}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Procesar Examen</h1>
            <p className="text-muted-foreground">Examen #{examen.id_examen} - Historial #{examen.id_historial}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Detalles de Solicitud</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Tipo de Examen</Label>
                <p className="font-medium text-lg">{examen.tipo_examen}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Estado Actual</Label>
                <div className="mt-1">
                  <StatusBadge status={examen.estado_examen} />
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Costo</Label>
                <p className="font-mono">Bs. {parseFloat(examen.costo_examen).toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical size={20} className="text-primary" />
                Resultados de Laboratorio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Reporte Clínico</Label>
                <textarea 
                  className="flex min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Escriba los resultados, valores de referencia y observaciones aquí..."
                  value={resultadoTexto}
                  onChange={(e) => setResultadoTexto(e.target.value)}
                  readOnly={isCompletado}
                />
              </div>

              {!isCompletado && (
                <div className="space-y-2">
                  <Label>Acción a tomar</Label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="estado" 
                        value="En Proceso"
                        checked={estadoExamen === 'En Proceso'}
                        onChange={() => setEstadoExamen('En Proceso')}
                        className="accent-primary"
                      />
                      Guardar borrador (En Proceso)
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="estado" 
                        value="Completado"
                        checked={estadoExamen === 'Completado'}
                        onChange={() => setEstadoExamen('Completado')}
                        className="accent-primary"
                      />
                      Finalizar (Completado)
                    </label>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t">
                {!isCompletado ? (
                  <Button onClick={handleSave} disabled={saving} className="gap-2">
                    <Save size={18} />
                    {saving ? 'Guardando...' : 'Guardar Resultados'}
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => router.push('/laboratorio/examenes')}>
                    Volver a la cola
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
