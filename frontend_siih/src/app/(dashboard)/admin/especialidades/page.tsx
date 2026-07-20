'use client';
import { useState } from 'react';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { DataTable, ColumnDef } from '@/components/shared/DataTable';
import { Especialidad, createEspecialidad, updateEspecialidad, deleteEspecialidad } from '@/services/especialidadesService';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Edit, Trash } from 'lucide-react';
import { Modal, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import toast from 'react-hot-toast';

export default function EspecialidadesPage() {
  const [selected, setSelected] = useState<Especialidad | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Form state
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);

  const openEditModal = (esp?: Especialidad) => {
    if (esp) {
      setSelected(esp);
      setNombre(esp.nombre);
      setDescripcion(esp.descripcion);
    } else {
      setSelected(null);
      setNombre('');
      setDescripcion('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (selected) {
        await updateEspecialidad(selected.id, { nombre, descripcion });
        toast.success('Especialidad actualizada');
      } else {
        await createEspecialidad({ nombre, descripcion });
        toast.success('Especialidad creada');
      }
      setIsModalOpen(false);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error('Error al guardar la especialidad');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await deleteEspecialidad(selected.id);
      toast.success('Especialidad eliminada');
      setIsDeleteModalOpen(false);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const columns: ColumnDef<Especialidad>[] = [
    { header: 'ID', accessorKey: 'id' },
    { header: 'Nombre', accessorKey: 'nombre' },
    { header: 'Descripción', accessorKey: 'descripcion' },
    { 
      header: 'Estado', 
      cell: (row) => <StatusBadge status={row.is_active ? 'Activo' : 'Baja'} />
    },
    {
      header: 'Acciones',
      cell: (row) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => openEditModal(row)}>
            <Edit className="h-4 w-4" />
          </Button>
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
            <h1 className="text-2xl font-bold tracking-tight">Especialidades</h1>
            <p className="text-muted-foreground">Catálogo de especialidades médicas.</p>
          </div>
          <Button onClick={() => openEditModal()}>Nueva Especialidad</Button>
        </div>

        <DataTable<Especialidad> 
          columns={columns} 
          fetchUrl="/especialidades/" 
          searchPlaceholder="Buscar especialidad..."
          key={refreshKey}
        />

        {/* Modal de Creación / Edición */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <ModalHeader>
            <ModalTitle>{selected ? 'Editar Especialidad' : 'Nueva Especialidad'}</ModalTitle>
          </ModalHeader>
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input 
                id="nombre" 
                value={nombre} 
                onChange={e => setNombre(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input 
                id="descripcion" 
                value={descripcion} 
                onChange={e => setDescripcion(e.target.value)} 
              />
            </div>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
            </ModalFooter>
          </form>
        </Modal>

        {/* ConfirmDialog de Eliminación */}
        <ConfirmDialog
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Eliminar Especialidad"
          description={`¿Estás seguro de eliminar la especialidad "${selected?.nombre}"? Esta acción suele ser un borrado lógico en el backend.`}
          variant="destructive"
        />
      </div>
    </RoleGuard>
  );
}
