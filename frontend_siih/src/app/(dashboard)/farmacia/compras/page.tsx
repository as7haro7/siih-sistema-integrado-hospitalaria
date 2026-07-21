'use client';

import { useRouter } from 'next/navigation';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { DataTable, ColumnDef } from '@/components/shared/DataTable';
import { Compra } from '@/types';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function ComprasPage() {
  const router = useRouter();

  const columns: ColumnDef<Compra>[] = [
    { header: 'ID Compra', accessorKey: 'id_compra' },
    { header: 'Proveedor', accessorKey: 'proveedor_nombre' },
    { 
      header: 'Fecha Compra', 
      cell: (row) => format(parseISO(row.fecha_compra), 'dd/MM/yyyy')
    },
    { 
      header: 'Nro Factura', 
      cell: (row) => row.numero_factura_compra || 'S/N'
    },
    { 
      header: 'Total Compra', 
      cell: (row) => `Bs. ${parseFloat(row.total_compra).toFixed(2)}`
    }
  ];
  return (
    <RoleGuard allowedRoles={['Administrador', 'Farmacéutico']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Compras Realizadas</h1>
            <p className="text-muted-foreground">Listado de compras registradas para reabastecimiento.</p>
          </div>
          <Button onClick={() => router.push('/farmacia/compras/nueva')} className="flex items-center space-x-1">
            <Plus className="h-4 w-4" />
            <span>Registrar Compra</span>
          </Button>
        </div>

        <DataTable<Compra> 
          columns={columns} 
          fetchUrl="/compras/" 
          searchPlaceholder="Buscar por factura..."
        />
      </div>
    </RoleGuard>
  );
}
