'use client';
import { useState } from 'react';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { DataTable, ColumnDef } from '@/components/shared/DataTable';
import { TarifaHabitacion, createTarifa, updateTarifa, deleteTarifa } from '@/services/tarifasService';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Edit, Trash } from 'lucide-react';
import { Modal, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function TarifasHabitacionPage() {
  const [selected, setSelected] = useState<TarifaHabitacion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Form state
  const [tipoHabitacion, setTipoHabitacion] = useState('');
  const [precio, setPrecio] = useState('0');
  const [loading, setLoading] = useState(false);

  const openEditModal = (tarifa?: TarifaHabitacion) => {
    if (tarifa) {
      setSelected(tarifa);
      setTipoHabitacion(tarifa.tipo_habitacion);
      setPrecio(String(tarifa.precio_por_dia));
    } else {
      setSelected(null);
      setTipoHabitacion('');
      setPrecio('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (selected) {
        await updateTarifa(selected.id, { 
          tipo_habitacion: tipoHabitacion, 
          precio_por_dia: parseFloat(precio) 
        });
        toast.success('Tarifa actualizada');
      } else {
        await createTarifa({ 
          tipo_habitacion: tipoHabitacion, 
          precio_por_dia: parseFloat(precio) 
        });
        toast.success('Tarifa creada');
      }
      setIsModalOpen(false);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error('Error al guardar la tarifa');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await deleteTarifa(selected.id);
      toast.success('Tarifa eliminada');
      setIsDeleteModalOpen(false);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const columns: ColumnDef<TarifaHabitacion>[] = [
    { header: 'Tipo Habitación', accessorKey: 'tipo_habitacion' },
    { 
      header: 'Precio por Día', 
      cell: (row) => fontBoldCurrency(row.precio_por_dia)
    },
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

  const fontBoldCurrency = (amount: number) => {
    return <span className="font-semibold">{formatCurrency(amount)}</span>;
  };

  return (
    <RoleGuard allowedRoles={['Administrador']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tarifas de Habitación</h1>
            <p className="text-muted-foreground">Catálogo de costos de internación.</p>
          </div>
          <Button onClick={() => openEditModal()}>Nueva Tarifa</Button>
        </div>

        <DataTable<TarifaHabitacion> 
          columns={columns} 
          fetchUrl="/tarifas-habitacion/" 
          searchPlaceholder="Buscar tarifa..."
          key={refreshKey}
        />

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <ModalHeader>
            <ModalTitle>{selected ? 'Editar Tarifa' : 'Nueva Tarifa'}</ModalTitle>
          </ModalHeader>
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Habitación</Label>
              <Input 
                id="tipo" 
                value={tipoHabitacion} 
                onChange={e => setTipoHabitacion(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="precio">Precio por Día (Bs)</Label>
              <Input 
                id="precio" 
                type="number"
                step="0.01"
                min="0"
                value={precio} 
                onChange={e => setPrecio(e.target.value)} 
                required
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

        <ConfirmDialog
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Eliminar Tarifa"
          description={`¿Estás seguro de eliminar la tarifa de "${selected?.tipo_habitacion}"?`}
          variant="destructive"
        />
      </div>
    </RoleGuard>
  );
}
