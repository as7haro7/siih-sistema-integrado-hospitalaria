'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { SearchableSelect } from '@/components/shared/SearchableSelect';
import { SlotPicker } from '@/components/citas/SlotPicker';
import { ArrowLeft, Calendar, CheckCircle, Stethoscope, User, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { createCita, getDisponibilidad } from '@/services/citasService';
import { getPacientes } from '@/services/pacientesService';
import { getMedicos } from '@/services/medicosService';
import { getEspecialidades, Especialidad } from '@/services/especialidadesService';
import { MedicoList } from '@/services/medicosService';
import { PacienteList, DisponibilidadResponse } from '@/types';
import toast from 'react-hot-toast';

const steps = [
  { id: 1, title: 'Paciente', icon: User },
  { id: 2, title: 'Médico', icon: Stethoscope },
  { id: 3, title: 'Horario', icon: Calendar },
  { id: 4, title: 'Confirmar', icon: CheckCircle },
];

export default function NuevaCitaPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Patient
  const [pacientes, setPacientes] = useState<PacienteList[]>([]);
  const [pacientesLoading, setPacientesLoading] = useState(false);
  const [selectedPacienteId, setSelectedPacienteId] = useState<string>('');

  // Step 2: Especialidad + Médico
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [selectedEspecialidad, setSelectedEspecialidad] = useState<string>('');
  const [medicos, setMedicos] = useState<MedicoList[]>([]);
  const [medicosLoading, setMedicosLoading] = useState(false);
  const [selectedMedicoId, setSelectedMedicoId] = useState<string>('');

  // Step 3: Date + Slot
  const [fechaCita, setFechaCita] = useState('');
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadResponse | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Load pacientes
  useEffect(() => {
    const fetchPacientes = async () => {
      setPacientesLoading(true);
      try {
        const resp = await getPacientes({ estado_baja: 'Activo' });
        setPacientes(resp.results);
      } catch (error) {
        console.error('Error loading pacientes:', error);
      } finally {
        setPacientesLoading(false);
      }
    };
    fetchPacientes();
  }, []);

  // Load especialidades
  useEffect(() => {
    const fetchEspecialidades = async () => {
      try {
        const data = await getEspecialidades();
        // The API might return paginated or plain array
        setEspecialidades(Array.isArray(data) ? data : data.results || []);
      } catch (error) {
        console.error('Error loading especialidades:', error);
      }
    };
    fetchEspecialidades();
  }, []);

  // Load médicos when especialidad changes
  useEffect(() => {
    if (!selectedEspecialidad) {
      setMedicos([]);
      setSelectedMedicoId('');
      return;
    }
    const fetchMedicos = async () => {
      setMedicosLoading(true);
      try {
        const data = await getMedicos(Number(selectedEspecialidad));
        setMedicos(Array.isArray(data) ? data : data.results || []);
      } catch (error) {
        console.error('Error loading medicos:', error);
      } finally {
        setMedicosLoading(false);
      }
    };
    fetchMedicos();
  }, [selectedEspecialidad]);

  // Load disponibilidad when medico + fecha change
  useEffect(() => {
    if (!selectedMedicoId || !fechaCita) {
      setDisponibilidad(null);
      setSelectedSlot(null);
      return;
    }
    const fetchSlots = async () => {
      setSlotsLoading(true);
      try {
        const data = await getDisponibilidad(Number(selectedMedicoId), fechaCita);
        setDisponibilidad(data);
        setSelectedSlot(null);
      } catch (error) {
        console.error('Error loading disponibilidad:', error);
        setDisponibilidad(null);
      } finally {
        setSlotsLoading(false);
      }
    };
    fetchSlots();
  }, [selectedMedicoId, fechaCita]);

  // Reset downstream selections when upstream changes
  useEffect(() => {
    setSelectedMedicoId('');
    setFechaCita('');
    setSelectedSlot(null);
    setDisponibilidad(null);
  }, [selectedEspecialidad]);

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!selectedPacienteId;
      case 2: return !!selectedMedicoId;
      case 3: return !!selectedSlot && !!fechaCita;
      case 4: return true;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await createCita({
        id_paciente: Number(selectedPacienteId),
        id_medico: Number(selectedMedicoId),
        fecha_cita: fechaCita,
        hora_cita: selectedSlot!,
      });
      toast.success('Cita agendada correctamente');
      router.push('/recepcion/citas');
    } catch (error: any) {
      if (error.response?.data?.non_field_errors) {
        toast.error(error.response.data.non_field_errors[0]);
      } else if (error.response?.data) {
        const errors = error.response.data;
        const messages = Object.values(errors).flat().join(', ');
        toast.error(messages as string || 'Error al crear la cita');
      } else {
        toast.error('Error al crear la cita');
      }
    } finally {
      setLoading(false);
    }
  };

  // Derived display data
  const selectedPaciente = pacientes.find((p) => p.id_paciente.toString() === selectedPacienteId);
  const selectedMedico = medicos.find((m) => m.id_medico.toString() === selectedMedicoId);
  const selectedEspecialidadObj = especialidades.find((e) => e.id_especialidad.toString() === selectedEspecialidad);

  return (
    <RoleGuard allowedRoles={['Administrador', 'Recepcionista', 'Médico']}>
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Agendar Nueva Cita</h1>
            <p className="text-muted-foreground">Complete los pasos para programar una cita médica.</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between px-4">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300
                      ${isCompleted
                        ? 'border-primary bg-primary text-primary-foreground'
                        : isActive
                          ? 'border-primary bg-primary/10 text-primary ring-4 ring-primary/20'
                          : 'border-muted bg-muted/30 text-muted-foreground'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  <span className={`mt-2 text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-4 h-0.5 w-16 sm:w-24 transition-colors duration-300 ${
                      currentStep > step.id ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="pt-6">
            {/* Step 1: Seleccionar Paciente */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <CardTitle className="text-lg mb-1">Seleccionar Paciente</CardTitle>
                  <CardDescription>Busque y seleccione al paciente que desea agendar.</CardDescription>
                </div>
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
                    searchPlaceholder="Nombre, apellido o cédula..."
                    disabled={pacientesLoading}
                  />
                </div>
                {selectedPaciente && (
                  <div className="rounded-lg border bg-muted/30 p-4 mt-4 animate-slide-in">
                    <p className="text-sm font-medium">Paciente seleccionado:</p>
                    <p className="text-lg font-semibold text-primary">
                      {selectedPaciente.nombre} {selectedPaciente.apellido}
                    </p>
                    {selectedPaciente.cedula_paciente && (
                      <p className="text-sm text-muted-foreground">CI: {selectedPaciente.cedula_paciente}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Seleccionar Especialidad + Médico */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <CardTitle className="text-lg mb-1">Seleccionar Médico</CardTitle>
                  <CardDescription>Elija la especialidad y el médico para la consulta.</CardDescription>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Especialidad *</Label>
                    <SearchableSelect
                      options={especialidades.map((e) => ({
                        value: e.id_especialidad.toString(),
                        label: e.nombre_especialidad,
                      }))}
                      value={selectedEspecialidad}
                      onChange={(val) => {
                        setSelectedEspecialidad(val);
                      }}
                      placeholder="Seleccionar especialidad..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Médico *</Label>
                    <SearchableSelect
                      options={medicos.map((m) => ({
                        value: m.id_medico.toString(),
                        label: `${m.nombre_medico}`,
                      }))}
                      value={selectedMedicoId}
                      onChange={setSelectedMedicoId}
                      placeholder={medicosLoading ? 'Cargando...' : 'Seleccionar médico...'}
                      disabled={!selectedEspecialidad || medicosLoading}
                    />
                  </div>
                </div>

                {selectedMedico && (
                  <div className="rounded-lg border bg-muted/30 p-4 mt-2 animate-slide-in">
                    <p className="text-sm font-medium">Médico seleccionado:</p>
                    <p className="text-lg font-semibold text-primary">{selectedMedico.nombre_medico}</p>
                    <p className="text-sm text-muted-foreground">
                      Especialidad: {selectedMedico.especialidad_nombre}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Seleccionar Fecha + Horario */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <CardTitle className="text-lg mb-1">Seleccionar Fecha y Horario</CardTitle>
                  <CardDescription>
                    Elija la fecha y uno de los horarios disponibles del médico.
                  </CardDescription>
                </div>

                <div className="space-y-2">
                  <Label>Fecha de la Cita *</Label>
                  <Input
                    type="date"
                    value={fechaCita}
                    onChange={(e) => {
                      setFechaCita(e.target.value);
                      setSelectedSlot(null);
                    }}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {fechaCita && (
                  <div className="mt-4">
                    {disponibilidad?.dia_semana && (
                      <p className="text-sm text-muted-foreground mb-3">
                        <Clock className="inline h-4 w-4 mr-1" />
                        {disponibilidad.dia_semana}, {formatDate(fechaCita, 'dd MMMM yyyy')}
                      </p>
                    )}
                    <SlotPicker
                      slots={disponibilidad?.horarios_disponibles || []}
                      selectedSlot={selectedSlot}
                      onSelect={setSelectedSlot}
                      loading={slotsLoading}
                      mensaje={disponibilidad?.mensaje}
                    />
                  </div>
                )}

                {selectedSlot && (
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 mt-2 animate-slide-in">
                    <p className="text-sm font-medium">Horario seleccionado:</p>
                    <p className="text-2xl font-bold text-primary">{selectedSlot}</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Confirmación */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <CardTitle className="text-lg mb-1">Confirmar Cita</CardTitle>
                  <CardDescription>Revise los datos antes de confirmar el agendamiento.</CardDescription>
                </div>

                <div className="rounded-lg border bg-muted/20 divide-y divide-border">
                  <div className="flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Paciente</p>
                      <p className="font-semibold">
                        {selectedPaciente?.nombre} {selectedPaciente?.apellido}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Stethoscope className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Médico</p>
                      <p className="font-semibold">{selectedMedico?.nombre_medico}</p>
                      <p className="text-xs text-muted-foreground">{selectedEspecialidadObj?.nombre_especialidad}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha y hora</p>
                      <p className="font-semibold">
                        {formatDate(fechaCita, 'EEEE, dd MMMM yyyy')} — {selectedSlot}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>

          {currentStep < 4 ? (
            <Button
              onClick={() => setCurrentStep((s) => Math.min(4, s + 1))}
              disabled={!canProceed()}
            >
              Siguiente
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              <CheckCircle className="mr-2 h-4 w-4" />
              {loading ? 'Agendando...' : 'Confirmar Cita'}
            </Button>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
