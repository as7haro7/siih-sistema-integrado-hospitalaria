'use client';
import { useState, useEffect } from 'react';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { DataTable, ColumnDef } from '@/components/shared/DataTable';
import { HorarioMedico, createHorarioMedico, deleteHorarioMedico } from '@/services/horariosService';
import { getUsers } from '@/services/usuariosService';
import { getEspecialidades } from '@/services/especialidadesService';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Trash } from 'lucide-react';
import { Modal, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { SearchableSelect } from '@/components/shared/SearchableSelect';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import toast from 'react-hot-toast';

export default function HorariosMedicosPage() {
  const [selected, setSelected] = useState<HorarioMedico | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [medicos, setMedicos] = useState<{value: string, label: string}[]>([]);
  const [especialidades, setEspecialidades] = useState<{value: string, label: string}[]>([]);

  // Form state
  const [medicoId, setMedicoId] = useState('');
  const [especialidadId, setEspecialidadId] = useState('');
  const [diaSemana, setDiaSemana] = useState('1');
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('12:00');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load Medicos (usuarios con rol medico) and Especialidades for the selects
    const loadCatalogs = async () => {
      try {
        const usersData = await getUsers();
        // Filtrar usuarios que son médicos (simulado aquí buscando la palabra "medico" en cargo o rol)
        const medicosOptions = usersData.results
          .filter((u: any) => (u.roles || []).includes('Médico'))
          .map((u: any) => ({ value: String(u.id), label: `${u.first_name} ${u.last_name}` }));
        setMedicos(medicosOptions);

        const espData = await getEspecialidades();
        const espOptions = espData.results.map((e: any) => ({ value: String(e.id), label: e.nombre }));
        setEspecialidades(espOptions);
      } catch (error) {
        console.error("Error loading catalogs", error);
      }
    };
    if (isModalOpen) loadCatalogs();
  }, [isModalOpen]);

  const openCreateModal = () => {
    setMedicoId('');
    setEspecialidadId('');
    setDiaSemana('1');
    setHoraInicio('08:00');
    setHoraFin('12:00');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicoId || !especialidadId) {
      toast.error('Debe seleccionar médico y especialidad');
      return;
    }
    setLoading(true);
    try {
      await createHorarioMedico({ 
        medico_id: parseInt(medicoId),
        especialidad_id: parseInt(especialidadId),
        dia_semana: parseInt(diaSemana),
        hora_inicio: horaInicio,
        hora_fin: horaFin
      });
      toast.success('Horario creado');
      setIsModalOpen(false);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error('Error al guardar el horario');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await deleteHorarioMedico(selected.id);
      toast.success('Horario eliminado');
      setIsDeleteModalOpen(false);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const columns: ColumnDef<HorarioMedico>[] = [
    { header: 'ID', accessorKey: 'id' },
    { header: 'Médico', cell: (row) => row.medico_nombre || `Médico ID: ${row.medico_id}` },
    { header: 'Especialidad', cell: (row) => row.especialidad_nombre || `Esp ID: ${row.especialidad_id}` },
    { header: 'Día', cell: (row) => dias[row.dia_semana - 1] || '?' },
    { header: 'Horario', cell: (row) => `${row.hora_inicio} - ${row.hora_fin}` },
    { 
      header: 'Estado', 
      cell: (row) => <StatusBadge status={row.is_active ? 'Activo' : 'Baja'} />
    },
    {
      header: 'Acciones',
      cell: (row) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="text-destructive" onClick={() => {
            setSelected(row);
            setIsDeleteModalOpen(true);
          }}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <RoleGuard allowedRoles={['Administrador']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Horarios Médicos</h1>
            <p className="text-muted-foreground">Configuración de disponibilidad de los médicos.</p>
          </div>
          <Button onClick={openCreateModal}>Nuevo Horario</Button>
        </div>

        <DataTable<HorarioMedico> 
          columns={columns} 
          fetchUrl="/horarios-medicos/" 
          searchPlaceholder="Buscar horario..."
          key={refreshKey}
        />

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <ModalHeader>
            <ModalTitle>Nuevo Horario Médico</ModalTitle>
          </ModalHeader>
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Médico</Label>
              <SearchableSelect 
                options={medicos} 
                value={medicoId} 
                onChange={setMedicoId} 
                placeholder="Seleccionar médico..."
              />
            </div>
            <div className="space-y-2">
              <Label>Especialidad</Label>
              <SearchableSelect 
                options={especialidades} 
                value={especialidadId} 
                onChange={setEspecialidadId} 
                placeholder="Seleccionar especialidad..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dia">Día de la Semana</Label>
              <select 
                id="dia"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={diaSemana}
                onChange={e => setDiaSemana(e.target.value)}
              >
                {dias.map((d, i) => (
                  <option key={i} value={i + 1}>{d}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="inicio">Hora Inicio</Label>
                <Input type="time" id="inicio" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fin">Hora Fin</Label>
                <Input type="time" id="fin" value={horaFin} onChange={e => setHoraFin(e.target.value)} required />
              </div>
            </div>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
            </ModalFooter>
          </form>
        </Modal>

        <ConfirmDialog
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Eliminar Horario"
          description={`¿Estás seguro de eliminar el horario seleccionado?`}
          variant="destructive"
        />
      </div>
    </RoleGuard>
  );
}
