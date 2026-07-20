'use client';
import { useState, useEffect } from 'react';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { DataTable, ColumnDef } from '@/components/shared/DataTable';
import { HorarioMedico, createHorarioMedico, deleteHorarioMedico } from '@/services/horariosService';
import { getMedicos } from '@/services/medicosService';
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

  // Form state
  const [medicoId, setMedicoId] = useState('');
  const [diaSemana, setDiaSemana] = useState('Lunes');
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('12:00');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const data = await getMedicos();
        const medicosOptions = data.results.map((m: any) => ({ 
          value: String(m.id_medico), 
          label: `${m.nombre_medico} (${m.especialidad_nombre})` 
        }));
        setMedicos(medicosOptions);
      } catch (error) {
        console.error("Error loading catalogs", error);
      }
    };
    loadCatalogs();
  }, []);

  const openCreateModal = () => {
    setMedicoId('');
    setDiaSemana('Lunes');
    setHoraInicio('08:00');
    setHoraFin('12:00');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicoId) {
      toast.error('Debe seleccionar médico');
      return;
    }
    setLoading(true);
    try {
      await createHorarioMedico({ 
        id_medico: parseInt(medicoId),
        dia_semana: diaSemana,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        estado_turno: 'Activo'
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
      await deleteHorarioMedico(selected.id_horario);
      toast.success('Horario eliminado');
      setIsDeleteModalOpen(false);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];

  const columns: ColumnDef<HorarioMedico>[] = [
    { header: 'ID', accessorKey: 'id_horario' },
    { 
      header: 'Médico', 
      cell: (row) => medicos.find(m => m.value === String(row.id_medico))?.label || `ID Médico: ${row.id_medico}` 
    },
    { header: 'Día', accessorKey: 'dia_semana' },
    { header: 'Horario', cell: (row) => `${row.hora_inicio} - ${row.hora_fin}` },
    { 
      header: 'Estado', 
      cell: (row) => <StatusBadge status={row.estado_turno === 'Activo' ? 'Activo' : 'Baja'} />
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
              <Label htmlFor="dia">Día de la Semana</Label>
              <select 
                id="dia"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={diaSemana}
                onChange={e => setDiaSemana(e.target.value)}
              >
                {dias.map((d, i) => (
                  <option key={i} value={d}>{d}</option>
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
