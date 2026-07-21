'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { SearchableSelect } from '@/components/shared/SearchableSelect';
import { TriageBadge } from '@/components/emergencias/TriageBadge';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { createEmergencia } from '@/services/emergenciasService';
import { getPacientes } from '@/services/pacientesService';
import { getMedicos } from '@/services/medicosService';
import { MedicoList } from '@/services/medicosService';
import { PacienteList, EmergenciaForm, NivelTriage } from '@/types';
import toast from 'react-hot-toast';

const NIVELES_TRIAGE: { value: NivelTriage; label: string }[] = [
  { value: 'Rojo', label: 'Rojo — Crítico (riesgo vital inmediato)' },
  { value: 'Naranja', label: 'Naranja — Muy urgente (15 min)' },
  { value: 'Amarillo', label: 'Amarillo — Urgente (30 min)' },
  { value: 'Verde', label: 'Verde — Poco urgente (60 min)' },
  { value: 'Azul', label: 'Azul — Sin urgencia (120+ min)' },
];

export default function NuevaEmergenciaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Data for selects
  const [pacientes, setPacientes] = useState<PacienteList[]>([]);
  const [medicos, setMedicos] = useState<MedicoList[]>([]);
  const [pacientesLoading, setPacientesLoading] = useState(false);
  const [medicosLoading, setMedicosLoading] = useState(false);

  // Form state
  const [selectedPacienteId, setSelectedPacienteId] = useState('');
  const [selectedMedicoId, setSelectedMedicoId] = useState('');
  const [fechaHoraIngreso, setFechaHoraIngreso] = useState('');
  const [nivelTriage, setNivelTriage] = useState<NivelTriage | ''>('');
  const [descripcionUrgencia, setDescripcionUrgencia] = useState('');
  const [destinoPaciente, setDestinoPaciente] = useState('');

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      setPacientesLoading(true);
      setMedicosLoading(true);
      try {
        const [pacientesResp, medicosResp] = await Promise.all([
          getPacientes({ estado_baja: 'Activo' }),
          getMedicos(),
        ]);
        setPacientes(pacientesResp.results);
        setMedicos(Array.isArray(medicosResp) ? medicosResp : medicosResp.results || []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setPacientesLoading(false);
        setMedicosLoading(false);
      }
    };
    fetchData();

    // Set default datetime to now
    const now = new Date();
    const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setFechaHoraIngreso(localISO);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nivelTriage) {
      toast.error('Debe seleccionar un nivel de triage');
      return;
    }

    setLoading(true);

    const payload: EmergenciaForm = {
      id_paciente: Number(selectedPacienteId),
      id_medico_guardia: Number(selectedMedicoId),
      fecha_hora_ingreso: new Date(fechaHoraIngreso).toISOString(),
      nivel_triage: nivelTriage,
      descripcion_urgencia: descripcionUrgencia || undefined,
      destino_paciente: destinoPaciente || undefined,
    };

    try {
      await createEmergencia(payload);
      toast.success('Emergencia registrada correctamente');
      router.push('/recepcion/emergencias');
    } catch (error: any) {
      if (error.response?.data) {
        const errors = error.response.data;
        const messages = Object.values(errors).flat().join(', ');
        toast.error(messages as string || 'Error al registrar emergencia');
      } else {
        toast.error('Error al registrar emergencia');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['Administrador', 'Recepcionista', 'Médico']}>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Registrar Emergencia</h1>
              <p className="text-muted-foreground">Complete el formulario de ingreso de emergencia.</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Datos de la Emergencia</CardTitle>
            <CardDescription>Todos los campos marcados con (*) son obligatorios.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Paciente y Médico */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Paciente *</Label>
                  <SearchableSelect
                    options={pacientes.map((p) => ({
                      value: p.id_paciente.toString(),
                      label: `${p.nombre} ${p.apellido}${p.cedula_paciente ? ` (CI: ${p.cedula_paciente})` : ''}`,
                    }))}
                    value={selectedPacienteId}
                    onChange={setSelectedPacienteId}
                    placeholder="Buscar paciente..."
                    disabled={pacientesLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Médico de Guardia *</Label>
                  <SearchableSelect
                    options={medicos.map((m) => ({
                      value: m.id_medico.toString(),
                      label: `${m.nombre_medico} (${m.especialidad_nombre})`,
                    }))}
                    value={selectedMedicoId}
                    onChange={setSelectedMedicoId}
                    placeholder="Buscar médico..."
                    disabled={medicosLoading}
                  />
                </div>
              </div>

              {/* Fecha/hora y Triage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha y Hora de Ingreso *</Label>
                  <Input
                    type="datetime-local"
                    value={fechaHoraIngreso}
                    onChange={(e) => setFechaHoraIngreso(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Destino del Paciente</Label>
                  <Input
                    value={destinoPaciente}
                    onChange={(e) => setDestinoPaciente(e.target.value)}
                    placeholder="Ej: UCI, Observación, Quirófano"
                  />
                </div>
              </div>

              {/* Nivel de Triage - Visual Selector */}
              <div className="space-y-3">
                <Label>Nivel de Triage *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {NIVELES_TRIAGE.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setNivelTriage(value)}
                      className={`
                        flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-all
                        hover:scale-105 cursor-pointer
                        ${nivelTriage === value ? 'ring-2 ring-primary scale-105 shadow-lg' : 'hover:bg-muted/30'}
                      `}
                    >
                      <TriageBadge nivel={value} />
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        {label.split('—')[1]?.trim()}
                      </span>
                    </button>
                  ))}
                </div>
                {nivelTriage && (
                  <p className="text-sm text-muted-foreground animate-slide-in">
                    Seleccionado: <TriageBadge nivel={nivelTriage} showLabel />
                  </p>
                )}
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label>Descripción de la Urgencia</Label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={descripcionUrgencia}
                  onChange={(e) => setDescripcionUrgencia(e.target.value)}
                  placeholder="Describa la situación de emergencia, síntomas observados, etc."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !selectedPacienteId || !selectedMedicoId || !nivelTriage}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Registrando...' : 'Registrar Emergencia'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
