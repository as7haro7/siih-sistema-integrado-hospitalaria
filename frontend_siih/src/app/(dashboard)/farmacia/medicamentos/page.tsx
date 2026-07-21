'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { DataTable, ColumnDef } from '@/components/shared/DataTable';
import { Medicamento } from '@/types';
import { getMedicamentos, createMedicamento, updateMedicamento } from '@/services/medicamentosService';
import { useAuthStore } from '@/stores/authStore';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { StockAlert } from '@/components/farmacia/StockAlert';
import { Button } from '@/components/ui/Button';
import { Edit, Eye, Plus } from 'lucide-react';
import { Modal, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import toast from 'react-hot-toast';

export default function MedicamentosPage() {
  const router = useRouter();
  const { hasRole } = useAuthStore();
  const isWritable = hasRole('Administrador') || hasRole('Farmacéutico');

  const [selected, setSelected] = useState<Medicamento | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Form state
  const [nombreComercial, setNombreComercial] = useState('');
  const [stockMinimo, setStockMinimo] = useState(0);
  const [precioUnitario, setPrecioUnitario] = useState(0);
  const [loading, setLoading] = useState(false);

  const openModal = (med?: Medicamento) => {
    if (med) {
      setSelected(med);
      setNombreComercial(med.nombre_comercial);
      setStockMinimo(med.stock_minimo);
      setPrecioUnitario(parseFloat(med.precio_unitario));
    } else {
      setSelected(null);
      setNombreComercial('');
      setStockMinimo(10);
      setPrecioUnitario(1.0);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (selected) {
        await updateMedicamento(selected.id_medicamento, {
          nombre_comercial: nombreComercial,
          stock_minimo: stockMinimo,
          precio_unitario: precioUnitario.toString(),
        });
        toast.success('Medicamento actualizado');
      } else {
        await createMedicamento({
          nombre_comercial: nombreComercial,
          stock_minimo: stockMinimo,
          precio_unitario: precioUnitario.toString(),
        });
        toast.success('Medicamento creado');
      }
      setIsModalOpen(false);
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Error al guardar el medicamento');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<Medicamento>[] = [
    { header: 'ID', accessorKey: 'id_medicamento' },
    { header: 'Nombre Comercial', accessorKey: 'nombre_comercial' },
    { 
      header: 'Precio Unitario', 
      cell: (row) => `Bs. ${parseFloat(row.precio_unitario).toFixed(2)}`
    },
    { 
      header: 'Stock Mínimo', 
      accessorKey: 'stock_minimo'
    },
    { 
      header: 'Stock Actual', 
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <span>{row.stock_actual}</span>
          <StockAlert stockActual={row.stock_actual} stockMinimo={row.stock_minimo} showBadgeOnly={true} />
        </div>
      )
    },
    {
      header: 'Acciones',
      cell: (row) => (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push(`/farmacia/medicamentos/${row.id_medicamento}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {isWritable && (
            <Button variant="outline" size="sm" onClick={() => openModal(row)}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <RoleGuard allowedRoles={['Administrador', 'Farmacéutico', 'Director']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Inventario de Medicamentos</h1>
            <p className="text-muted-foreground">Catálogo y existencias disponibles en farmacia.</p>
          </div>
          {isWritable && (
            <Button onClick={() => openModal()} className="flex items-center space-x-1">
              <Plus className="h-4 w-4" />
              <span>Nuevo Medicamento</span>
            </Button>
          )}
        </div>

        <DataTable<Medicamento> 
          columns={columns} 
          fetchUrl="/medicamentos/" 
          searchPlaceholder="Buscar medicamento por nombre..."
          key={refreshKey}
        />

        {/* Modal de Creación / Edición */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <ModalHeader>
            <ModalTitle>{selected ? 'Editar Medicamento' : 'Nuevo Medicamento'}</ModalTitle>
          </ModalHeader>
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombreComercial">Nombre Comercial</Label>
              <Input 
                id="nombreComercial" 
                value={nombreComercial} 
                onChange={e => setNombreComercial(e.target.value)} 
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="precioUnitario">Precio Unitario (Bs.)</Label>
                <Input 
                  id="precioUnitario" 
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={precioUnitario} 
                  onChange={e => setPrecioUnitario(parseFloat(e.target.value))} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockMinimo">Stock Mínimo</Label>
                <Input 
                  id="stockMinimo" 
                  type="number"
                  min="1"
                  value={stockMinimo} 
                  onChange={e => setStockMinimo(parseInt(e.target.value))} 
                  required 
                />
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
      </div>
    </RoleGuard>
  );
}
