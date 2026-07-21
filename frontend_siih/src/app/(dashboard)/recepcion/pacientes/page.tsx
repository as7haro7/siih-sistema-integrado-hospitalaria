'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Search, Plus, ChevronLeft, ChevronRight, Eye, Edit, UserX } from 'lucide-react';
import { Modal, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/Modal';
import { Label } from '@/components/ui/Label';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { getPacientes, createPaciente, updatePaciente, darDeBajaPaciente } from '@/services/pacientesService';
import { PacienteList, PacienteForm } from '@/types';
import toast from 'react-hot-toast';

const PAGE_SIZE = 20;

export default function PacientesPage() {
  const router = useRouter();
  const [data, setData] = useState<PacienteList[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<'Activo' | 'Baja' | ''>('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState<PacienteList | null>(null);
  const [isBajaDialogOpen, setIsBajaDialogOpen] = useState(false);
  const [bajaTarget, setBajaTarget] = useState<PacienteList | null>(null);
  const [motivoBaja, setMotivoBaja] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Form fields
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [cedula, setCedula] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [seguroMedico, setSeguroMedico] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getPacientes({
        search: search || undefined,
        estado_baja: estadoFilter || undefined,
        page,
      });
      setData(response.results);
      setTotalCount(response.count);
      setTotalPages(Math.ceil(response.count / PAGE_SIZE));
    } catch (error) {
      console.error('Error fetching pacientes:', error);
      toast.error('Error al cargar pacientes');
    } finally {
      setLoading(false);
    }
  }, [search, estadoFilter, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const resetForm = () => {
    setNombre('');
    setApellido('');
    setCedula('');
    setFechaNacimiento('');
    setTelefono('');
    setDireccion('');
    setSeguroMedico('');
    setEditingPaciente(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (paciente: PacienteList) => {
    setEditingPaciente(paciente);
    setNombre(paciente.nombre);
    setApellido(paciente.apellido);
    setCedula(paciente.cedula_paciente || '');
    setTelefono(paciente.telefono || '');
    // These fields aren't in list view, so we leave them empty for editing
    setFechaNacimiento('');
    setDireccion('');
    setSeguroMedico('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

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
      if (editingPaciente) {
        await updatePaciente(editingPaciente.id_paciente, payload);
        toast.success('Paciente actualizado correctamente');
      } else {
        await createPaciente(payload);
        toast.success('Paciente registrado correctamente');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('Ya existe un paciente con esa cédula.');
      } else if (error.response?.data) {
        const errors = error.response.data;
        const firstError = Object.values(errors).flat().join(', ');
        toast.error(firstError || 'Error al guardar paciente');
      } else {
        toast.error('Error al guardar paciente');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDarDeBaja = async () => {
    if (!bajaTarget) return;
    setFormLoading(true);
    try {
      await darDeBajaPaciente(bajaTarget.id_paciente, { motivo_baja: motivoBaja || undefined });
      toast.success('Paciente dado de baja correctamente');
      setIsBajaDialogOpen(false);
      setBajaTarget(null);
      setMotivoBaja('');
      fetchData();
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('El paciente ya se encuentra dado de baja.');
      } else {
        toast.error('Error al dar de baja al paciente');
      }
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['Administrador', 'Recepcionista']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pacientes</h1>
            <p className="text-muted-foreground">Registro y gestión de pacientes del hospital.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={openCreateModal}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Paciente
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nombre, apellido o cédula..."
              className="pl-8"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={estadoFilter}
            onChange={(e) => { setEstadoFilter(e.target.value as any); setPage(1); }}
          >
            <option value="">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Baja">Baja</option>
          </select>
        </div>

        {/* Table */}
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Apellido</TableHead>
                <TableHead>Cédula</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Cargando...
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No se encontraron pacientes.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((paciente) => (
                  <TableRow
                    key={paciente.id_paciente}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/recepcion/pacientes/${paciente.id_paciente}`)}
                  >
                    <TableCell className="font-medium">{paciente.nombre}</TableCell>
                    <TableCell>{paciente.apellido}</TableCell>
                    <TableCell>{paciente.cedula_paciente || '—'}</TableCell>
                    <TableCell>{paciente.telefono || '—'}</TableCell>
                    <TableCell>
                      <StatusBadge status={paciente.estado_baja} />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          title="Ver detalle"
                          onClick={() => router.push(`/recepcion/pacientes/${paciente.id_paciente}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          title="Editar"
                          onClick={() => openEditModal(paciente)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {paciente.estado_baja === 'Activo' && (
                          <Button
                            variant="outline"
                            size="sm"
                            title="Dar de baja"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setBajaTarget(paciente);
                              setMotivoBaja('');
                              setIsBajaDialogOpen(true);
                            }}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Mostrando {data.length} de {totalCount} resultados
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <div className="text-sm font-medium">
              Página {page} de {totalPages || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0 || loading}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Modal Crear/Editar Paciente */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <ModalHeader>
            <ModalTitle>{editingPaciente ? 'Editar Paciente' : 'Nuevo Paciente'}</ModalTitle>
          </ModalHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required placeholder="Juan" />
              </div>
              <div className="space-y-2">
                <Label>Apellido *</Label>
                <Input value={apellido} onChange={(e) => setApellido(e.target.value)} required placeholder="Pérez" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cédula de Identidad</Label>
                <Input value={cedula} onChange={(e) => setCedula(e.target.value)} placeholder="12345678" />
              </div>
              <div className="space-y-2">
                <Label>Fecha de Nacimiento</Label>
                <Input type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="70012345" />
              </div>
              <div className="space-y-2">
                <Label>Seguro Médico</Label>
                <Input value={seguroMedico} onChange={(e) => setSeguroMedico(e.target.value)} placeholder="Ej: CNS" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Calle, zona, ciudad" />
            </div>

            <ModalFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? 'Guardando...' : 'Guardar'}
              </Button>
            </ModalFooter>
          </form>
        </Modal>

        {/* Dialog Dar de Baja */}
        <Modal isOpen={isBajaDialogOpen} onClose={() => setIsBajaDialogOpen(false)}>
          <ModalHeader>
            <ModalTitle>Dar de Baja Paciente</ModalTitle>
          </ModalHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              ¿Está seguro que desea dar de baja al paciente{' '}
              <span className="font-semibold text-foreground">
                {bajaTarget?.nombre} {bajaTarget?.apellido}
              </span>
              ? Esta acción no se puede deshacer.
            </p>
            <div className="space-y-2">
              <Label>Motivo de baja (opcional)</Label>
              <Input
                value={motivoBaja}
                onChange={(e) => setMotivoBaja(e.target.value)}
                placeholder="Ingrese el motivo de baja..."
              />
            </div>
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setIsBajaDialogOpen(false)} disabled={formLoading}>
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
