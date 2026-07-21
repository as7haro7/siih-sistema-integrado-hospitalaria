'use client';

import { useState } from 'react';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { DataTable, ColumnDef } from '@/components/shared/DataTable';
import { Proveedor } from '@/types';
import { createProveedor, updateProveedor, deleteProveedor } from '@/services/comprasService';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Edit, Trash, Plus } from 'lucide-react';
import { Modal, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import toast from 'react-hot-toast';

export default function ProveedoresPage() {
  const { hasRole } = useAuthStore();
  const isWritable = hasRole('Administrador') || hasRole('Farmacéutico');

  const [selected, setSelected] = useState<Proveedor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Form state
  const [nombre, setNombre] = useState('');
  const [nit, setNit] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [loading, setLoading] = useState(false);

  const openModal = (prov?: Proveedor) => {
    if (prov) {
      setSelected(prov);
      setNombre(prov.nombre_proveedor);
      setNit(prov.nit_proveedor || '');
      setTelefono(prov.telefono || '');
      setDireccion(prov.direccion || '');
    } else {
      setSelected(null);
      setNombre('');
      setNit('');
      setTelefono('');
      setDireccion('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (selected) {
        await updateProveedor(selected.id_proveedor, {
          nombre_proveedor: nombre,
          nit_proveedor: nit || null,
          telefono: telefono || null,
          direccion: direccion || null,
        });
        toast.success('Proveedor actualizado');
      } else {
        await createProveedor({
          nombre_proveedor: nombre,
          nit_proveedor: nit || null,
          telefono: telefono || null,
          direccion: direccion || null,
        });
        toast.success('Proveedor creado');
      }
      setIsModalOpen(false);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error('Error al guardar proveedor');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await deleteProveedor(selected.id_proveedor);
      toast.success('Proveedor eliminado');
      setIsDeleteModalOpen(false);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const columns: ColumnDef<Proveedor>[] = [
    { header: 'ID', accessorKey: 'id_proveedor' },
    { header: 'Nombre', accessorKey: 'nombre_proveedor' },
    { header: 'NIT', accessorKey: 'nit_proveedor' },
    { header: 'Teléfono', accessorKey: 'telefono' },
    { header: 'Dirección', accessorKey: 'direccion' },
    {
      header: 'Acciones',
      cell: (row) => (
        <div className="flex space-x-2">
          {isWritable && (
            <>
              <Button variant="outline" size="sm" onClick={() => openModal(row)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-destructive" 
                onClick={() => {
                  setSelected(row);
                  setIsDeleteModalOpen(true);
                }}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <RoleGuard allowedRoles={['Administrador', 'Farmacéutico']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Proveedores de Farmacia</h1>
            <p className="text-muted-foreground">Catálogo de distribuidores y laboratorios farmacéuticos.</p>
          </div>
          {isWritable && (
            <Button onClick={() => openModal()} className="flex items-center space-x-1">
              <Plus className="h-4 w-4" />
              <span>Nuevo Proveedor</span>
            </Button>
          )}
        </div>

        <DataTable<Proveedor> 
          columns={columns} 
          fetchUrl="/proveedores/" 
          searchPlaceholder="Buscar proveedor por nombre..."
          key={refreshKey}
        />

        {/* Modal de Creación / Edición */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <ModalHeader>
            <ModalTitle>{selected ? 'Editar Proveedor' : 'Nuevo Proveedor'}</ModalTitle>
          </ModalHeader>
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre / Razón Social</Label>
              <Input 
                id="nombre" 
                value={nombre} 
                onChange={e => setNombre(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nit">NIT</Label>
              <Input 
                id="nit" 
                value={nit} 
                onChange={e => setNit(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input 
                id="telefono" 
                value={telefono} 
                onChange={e => setTelefono(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input 
                id="direccion" 
                value={direccion} 
                onChange={e => setDireccion(e.target.value)} 
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
          title="Eliminar Proveedor"
          description={`¿Estás seguro de eliminar al proveedor "${selected?.nombre_proveedor}"?`}
          variant="destructive"
        />
      </div>
    </RoleGuard>
  );
}
