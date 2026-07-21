'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { createHospitalizacion } from '@/services/hospitalizacionService';
import { getCamasDisponibles } from '@/services/camasService';
import { getPacientes } from '@/services/pacientesService';
import { getMedicos } from '@/services/medicosService';
import { Cama, PacienteList } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';

export default function NuevaHospitalizacionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [camas, setCamas] = useState<Cama[]>([]);
  const [pacientes, setPacientes] = useState<PacienteList[]>([]);
  const [medicos, setMedicos] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    id_paciente: '',
    id_medico_responsable: '',
    id_cama: '',
    fecha_ingreso: new Date().toISOString().slice(0, 16),
    diagnostico_ingreso: ''
  });

  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        const [camasRes, pacientesRes, medicosRes] = await Promise.all([
          getCamasDisponibles(),
          getPacientes({ estado_baja: 'Activo' }), // Should fetch all or use autocomplete in a real scenario
          getMedicos()
        ]);
        setCamas(camasRes);
        setPacientes(pacientesRes.results);
        setMedicos(medicosRes.results);
      } catch (error) {
        toast.error('Error cargando datos para el formulario');
      }
    };
    fetchSelectData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_paciente || !formData.id_medico_responsable || !formData.id_cama) {
      toast.error('Por favor complete los campos obligatorios');
      return;
    }

    try {
      setLoading(true);
      await createHospitalizacion({
        id_paciente: Number(formData.id_paciente),
        id_medico_responsable: Number(formData.id_medico_responsable),
        id_cama: Number(formData.id_cama),
        fecha_ingreso: new Date(formData.fecha_ingreso).toISOString(),
        diagnostico_ingreso: formData.diagnostico_ingreso || undefined
      });
      toast.success('Internación registrada exitosamente');
      router.push('/medico/hospitalizaciones');
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.detail || 'Error al registrar la internación');
      } else {
        toast.error('Error de red');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['Administrador', 'Médico']}>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/medico/hospitalizaciones')}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Nueva Internación</h1>
            <p className="text-muted-foreground">Asignar cama y registrar ingreso de paciente</p>
          </div>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Paciente *</Label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.id_paciente}
                    onChange={(e) => setFormData({...formData, id_paciente: e.target.value})}
                    required
                  >
                    <option value="">Seleccione un paciente</option>
                    {pacientes.map(p => (
                      <option key={p.id_paciente} value={p.id_paciente}>
                        {p.nombre} {p.apellido} ({p.cedula_paciente})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Médico Responsable *</Label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.id_medico_responsable}
                    onChange={(e) => setFormData({...formData, id_medico_responsable: e.target.value})}
                    required
                  >
                    <option value="">Seleccione médico</option>
                    {medicos.map(m => (
                      <option key={m.id_medico} value={m.id_medico}>
                        {m.nombre_medico} ({m.especialidad_nombre})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Cama Disponible *</Label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.id_cama}
                    onChange={(e) => setFormData({...formData, id_cama: e.target.value})}
                    required
                  >
                    <option value="">Seleccione una cama</option>
                    {camas.map(c => (
                      <option key={c.id_cama} value={c.id_cama}>
                        Hab. {c.nro_habitacion} - Cama {c.nro_cama} ({c.tipo_habitacion})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Fecha y Hora de Ingreso *</Label>
                  <Input 
                    type="datetime-local" 
                    value={formData.fecha_ingreso}
                    onChange={(e) => setFormData({...formData, fecha_ingreso: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Diagnóstico de Ingreso</Label>
                  <textarea 
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Escriba el diagnóstico de ingreso del paciente"
                    value={formData.diagnostico_ingreso}
                    onChange={(e) => setFormData({...formData, diagnostico_ingreso: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6">
              <Button type="button" variant="outline" className="mr-2" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="gap-2">
                <Save size={16} />
                {loading ? 'Registrando...' : 'Registrar Internación'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </RoleGuard>
  );
}
