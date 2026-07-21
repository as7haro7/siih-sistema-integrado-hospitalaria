'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Modal, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/Modal';
import {
  ArrowLeft,
  Edit,
  UserX,
  Calendar,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  ChevronLeft,
  ChevronRight,
  User,
  Shield,
} from 'lucide-react';
import { getPaciente, updatePaciente, getHistorialPaciente, darDeBajaPaciente } from '@/services/pacientesService';
import { Paciente, HistorialClinico, PacienteForm } from '@/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const PAGE_SIZE = 20;

export default function PacienteDetallePage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [loading, setLoading] = useState(true);

  // Historial
  const [historial, setHistorial] = useState<HistorialClinico[]>([]);
  const [historialLoading, setHistorialLoading] = useState(false);
  const [historialPage, setHistorialPage] = useState(1);
  const [historialTotal, setHistorialTotal] = useState(0);
  const [historialTotalPages, setHistorialTotalPages] = useState(1);

  // Edit modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [cedula, setCedula] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [seguroMedico, setSeguroMedico] = useState('');

  // Baja dialog
  const [isBajaOpen, setIsBajaOpen] = useState(false);
  const [motivoBaja, setMotivoBaja] = useState('');

  const fetchPaciente = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPaciente(id);
      setPaciente(data);
    } catch (error) {
      toast.error('Error al cargar datos del paciente');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchHistorial = useCallback(async () => {
    setHistorialLoading(true);
    try {
      const data = await getHistorialPaciente(id, historialPage);
      setHistorial(data.results);
      setHistorialTotal(data.count);
      setHistorialTotalPages(Math.ceil(data.count / PAGE_SIZE));
    } catch (error) {
      console.error('Error fetching historial:', error);
    } finally {
      setHistorialLoading(false);
    }
  }, [id, historialPage]);

  useEffect(() => {
    fetchPaciente();
  }, [fetchPaciente]);

  useEffect(() => {
    fetchHistorial();
  }, [fetchHistorial]);

  const openEditModal = () => {
    if (!paciente) return;
    setNombre(paciente.nombre);
    setApellido(paciente.apellido);
    setCedula(paciente.cedula_paciente || '');
    setFechaNacimiento(paciente.fecha_nacimiento || '');
    setTelefono(paciente.telefono || '');
    setDireccion(paciente.direccion || '');
    setSeguroMedico(paciente.seguro_medico || '');
    setIsEditOpen(true);
  };

  const handleUpdatePaciente = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const payload: Partial<PacienteForm> = {
      nombre,
      apellido,
      cedula_paciente: cedula || null,
      fecha_nacimiento: fechaNacimiento || undefined,
      telefono: telefono || undefined,
      direccion: direccion || undefined,
      seguro_medico: seguroMedico || undefined,
    };

    try {
      await updatePaciente(id, payload);
      toast.success('Paciente actualizado correctamente');
      setIsEditOpen(false);
      fetchPaciente();
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('Ya existe un paciente con esa cédula.');
      } else {
        toast.error('Error al actualizar paciente');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDarDeBaja = async () => {
    setFormLoading(true);
    try {
      await darDeBajaPaciente(id, { motivo_baja: motivoBaja || undefined });
      toast.success('Paciente dado de baja correctamente');
      setIsBajaOpen(false);
      setMotivoBaja('');
      fetchPaciente();
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('El paciente ya se encuentra dado de baja.');
      } else {
        toast.error('Error al dar de baja');
      }
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Paciente no encontrado.</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['Administrador', 'Recepcionista', 'Médico', 'Enfermera']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.push('/recepcion/pacientes')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">
                  {paciente.nombre} {paciente.apellido}
                </h1>
                <StatusBadge status={paciente.estado_baja} />
              </div>
              <p className="text-muted-foreground">Paciente #{paciente.id_paciente}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={openEditModal}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            {paciente.estado_baja === 'Activo' && (
              <Button
                variant="destructive"
                onClick={() => { setMotivoBaja(''); setIsBajaOpen(true); }}
              >
                <UserX className="mr-2 h-4 w-4" />
                Dar de Baja
              </Button>
            )}
          </div>
        </div>

        {/* Patient Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cédula de Identidad</p>
                  <p className="font-medium">{paciente.cedula_paciente || 'No registrada'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Nacimiento</p>
                  <p className="font-medium">{paciente.fecha_nacimiento ? formatDate(paciente.fecha_nacimiento) : 'No registrada'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{paciente.telefono || 'No registrado'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dirección</p>
                  <p className="font-medium">{paciente.direccion || 'No registrada'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Seguro Médico</p>
                  <p className="font-medium">{paciente.seguro_medico || 'Sin seguro'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <StatusBadge status={paciente.estado_baja} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Historial Clínico */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Historial Clínico</CardTitle>
            </div>
            <CardDescription>
              {historialTotal} {historialTotal === 1 ? 'registro' : 'registros'} encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Motivo Consulta</TableHead>
                    <TableHead>Diagnóstico</TableHead>
                    <TableHead>Tratamiento</TableHead>
                    <TableHead>Médico</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historialLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-20 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          Cargando historial...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : historial.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                        Este paciente no tiene registros en el historial clínico.
                      </TableCell>
                    </TableRow>
                  ) : (
                    historial.map((h) => (
                      <TableRow key={h.id_historial}>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(h.fecha_registro, 'dd/MM/yyyy HH:mm')}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {h.motivo_consulta || '—'}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {h.diagnostico || '—'}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {h.tratamiento || '—'}
                        </TableCell>
                        <TableCell>{h.medico_tratante || '—'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Historial pagination */}
            {historialTotalPages > 1 && (
              <div className="flex items-center justify-between px-2 pt-4">
                <div className="text-sm text-muted-foreground">
                  Página {historialPage} de {historialTotalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHistorialPage((p) => Math.max(1, p - 1))}
                    disabled={historialPage === 1 || historialLoading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHistorialPage((p) => Math.min(historialTotalPages, p + 1))}
                    disabled={historialPage === historialTotalPages || historialLoading}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal Editar Paciente */}
        <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
          <ModalHeader>
            <ModalTitle>Editar Paciente</ModalTitle>
          </ModalHeader>
          <form onSubmit={handleUpdatePaciente} className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Apellido *</Label>
                <Input value={apellido} onChange={(e) => setApellido(e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cédula de Identidad</Label>
                <Input value={cedula} onChange={(e) => setCedula(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Fecha de Nacimiento</Label>
                <Input type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Seguro Médico</Label>
                <Input value={seguroMedico} onChange={(e) => setSeguroMedico(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input value={direccion} onChange={(e) => setDireccion(e.target.value)} />
            </div>
            <ModalFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </ModalFooter>
          </form>
        </Modal>

        {/* Modal Dar de Baja */}
        <Modal isOpen={isBajaOpen} onClose={() => setIsBajaOpen(false)}>
          <ModalHeader>
            <ModalTitle>Dar de Baja Paciente</ModalTitle>
          </ModalHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              ¿Está seguro que desea dar de baja al paciente{' '}
              <span className="font-semibold text-foreground">
                {paciente.nombre} {paciente.apellido}
              </span>
              ? Esta acción no se puede deshacer.
            </p>
            <div className="space-y-2">
              <Label>Motivo de baja (opcional)</Label>
              <Input
                value={motivoBaja}
                onChange={(e) => setMotivoBaja(e.target.value)}
                placeholder="Ingrese el motivo de la baja..."
              />
            </div>
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setIsBajaOpen(false)} disabled={formLoading}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDarDeBaja} disabled={formLoading}>
              {formLoading ? 'Procesando...' : 'Confirmar Baja'}
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </RoleGuard>
  );
}
