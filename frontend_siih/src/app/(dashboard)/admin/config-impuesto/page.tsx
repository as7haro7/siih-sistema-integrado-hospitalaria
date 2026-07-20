'use client';
import { useState } from 'react';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { DataTable, ColumnDef } from '@/components/shared/DataTable';
import { ConfigImpuesto, createConfigImpuesto, updateConfigImpuesto, deleteConfigImpuesto } from '@/services/configImpuestoService';
import { Button } from '@/components/ui/Button';
import { Edit, Trash } from 'lucide-react';
import { Modal, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import toast from 'react-hot-toast';

export default function ConfigImpuestoPage() {
  const [selected, setSelected] = useState<ConfigImpuesto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Form state
  const [descripcion, setDescripcion] = useState('');
  const [porcentaje, setPorcentaje] = useState('0');
  const [loading, setLoading] = useState(false);

  const openEditModal = (impuesto?: ConfigImpuesto) => {
    if (impuesto) {
      setSelected(impuesto);
      setDescripcion(impuesto.descripcion);
      setPorcentaje(String(impuesto.porcentaje));
    } else {
      setSelected(null);
      setDescripcion('');
      setPorcentaje('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (selected) {
        await updateConfigImpuesto(selected.id_impuesto, { 
          descripcion, 
          porcentaje: parseFloat(porcentaje) 
        });
        toast.success('Impuesto actualizado');
      } else {
        await createConfigImpuesto({ 
          descripcion, 
          porcentaje: parseFloat(porcentaje) 
        });
        toast.success('Impuesto creado');
      }
      setIsModalOpen(false);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error('Error al guardar el impuesto');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await deleteConfigImpuesto(selected.id_impuesto);
      toast.success('Impuesto eliminado');
      setIsDeleteModalOpen(false);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const columns: ColumnDef<ConfigImpuesto>[] = [
    { header: 'ID', accessorKey: 'id_impuesto' },
    { header: 'Descripción', accessorKey: 'descripcion' },
    { 
      header: 'Porcentaje', 
      cell: (row) => <span className="font-semibold">{row.porcentaje}%</span>
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
            <h1 className="text-2xl font-bold tracking-tight">Configuración de Impuestos</h1>
            <p className="text-muted-foreground">Catálogo de impuestos aplicables en facturación.</p>
          </div>
          <Button onClick={() => openEditModal()}>Nuevo Impuesto</Button>
        </div>

        <DataTable<ConfigImpuesto> 
          columns={columns} 
          fetchUrl="/facturas/config-impuesto/" 
          searchPlaceholder="Buscar impuesto..."
          key={refreshKey}
        />

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <ModalHeader>
            <ModalTitle>{selected ? 'Editar Impuesto' : 'Nuevo Impuesto'}</ModalTitle>
          </ModalHeader>
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input 
                id="descripcion" 
                value={descripcion} 
                onChange={e => setDescripcion(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="porcentaje">Porcentaje (%)</Label>
              <Input 
                id="porcentaje" 
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={porcentaje} 
                onChange={e => setPorcentaje(e.target.value)} 
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
          title="Eliminar Impuesto"
          description={`¿Estás seguro de eliminar el impuesto "${selected?.descripcion}"?`}
          variant="destructive"
        />
      </div>
    </RoleGuard>
  );
}
