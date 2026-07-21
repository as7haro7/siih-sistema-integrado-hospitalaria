'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { ArrowLeft, Save } from 'lucide-react';
import { createPaciente } from '@/services/pacientesService';
import { PacienteForm } from '@/types';
import toast from 'react-hot-toast';

export default function NuevoPacientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form state
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [cedula, setCedula] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [seguroMedico, setSeguroMedico] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload: PacienteForm = {
      nombre,
      apellido,
      cedula_paciente: cedula || null,
      fecha_nacimiento: fechaNacimiento || undefined,
      telefono: telefono || undefined,
      direccion: direccion || undefined,
      seguro_medico: seguroMedico || undefined,
    };

    try {
      const created = await createPaciente(payload);
      toast.success('Paciente registrado correctamente');
      router.push(`/recepcion/pacientes/${created.id_paciente}`);
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('Ya existe un paciente con esa cédula de identidad.');
      } else if (error.response?.data) {
        const errors = error.response.data;
        const messages = Object.entries(errors)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n');
        toast.error(messages || 'Error al registrar paciente');
      } else {
        toast.error('Error al registrar paciente');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['Administrador', 'Recepcionista']}>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Nuevo Paciente</h1>
            <p className="text-muted-foreground">Registre un nuevo paciente en el sistema.</p>
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Datos del Paciente</CardTitle>
            <CardDescription>Complete los campos requeridos (*) para registrar al paciente.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre *</Label>
                  <Input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    placeholder="Juan Carlos"
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Apellido *</Label>
                  <Input
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    required
                    placeholder="Pérez Mamani"
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cédula de Identidad</Label>
                  <Input
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    placeholder="12345678"
                  />
                  <p className="text-xs text-muted-foreground">Debe ser única. Déjelo vacío si no dispone.</p>
                </div>
                <div className="space-y-2">
                  <Label>Fecha de Nacimiento</Label>
                  <Input
                    type="date"
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="70012345"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Seguro Médico</Label>
                  <Input
                    value={seguroMedico}
                    onChange={(e) => setSeguroMedico(e.target.value)}
                    placeholder="Ej: CNS, COSSMIL"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Dirección</Label>
                <Input
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Av. 6 de Agosto, Zona Sopocachi, La Paz"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Registrando...' : 'Registrar Paciente'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
