'use client';

import { RoleGuard } from '@/components/layout/RoleGuard';
import { DataTable, ColumnDef } from '@/components/shared/DataTable';
import { LoteMedicamento } from '@/types';
import { format, parseISO } from 'date-fns';

export default function LotesPage() {
  const columns: ColumnDef<LoteMedicamento>[] = [
    { header: 'ID Lote', accessorKey: 'id_lote' },
    { header: 'Medicamento', accessorKey: 'medicamento_nombre' },
    { 
      header: 'Número Lote', 
      cell: (row) => <span className="font-mono text-xs font-semibold">{row.numero_lote || 'S/N'}</span>
    },
    { header: 'Cant. Inicial', accessorKey: 'cantidad_inicial' },
    { header: 'Cant. Actual', accessorKey: 'cantidad_actual' },
    { 
      header: 'Precio Compra', 
      cell: (row) => `Bs. ${parseFloat(row.precio_compra_unitario).toFixed(2)}`
    },
    { 
      header: 'Ingreso', 
      cell: (row) => row.fecha_ingreso ? format(parseISO(row.fecha_ingreso), 'dd/MM/yyyy') : '-'
    },
    { 
      header: 'Vencimiento', 
      cell: (row) => {
        const isVencido = new Date(row.fecha_vencimiento) <= new Date();
        return (
          <span className={isVencido ? 'text-red-400 font-semibold' : 'text-yellow-400'}>
            {format(parseISO(row.fecha_vencimiento), 'dd/MM/yyyy')}
          </span>
        );
      }
    }
  ];

  return (
    <RoleGuard allowedRoles={['Administrador', 'Farmacéutico']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lotes de Medicamentos</h1>
          <p className="text-muted-foreground">Listado de lotes ingresados en almacén.</p>
        </div>

        <DataTable<LoteMedicamento> 
          columns={columns} 
          fetchUrl="/lotes-medicamentos/" 
          searchPlaceholder="Buscar lote por número de lote..."
        />
      </div>
    </RoleGuard>
  );
}
