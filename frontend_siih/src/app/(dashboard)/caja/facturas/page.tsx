'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { DataTable, ColumnDef } from '@/components/shared/DataTable';
import { Factura } from '@/types';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Eye, Plus, Receipt } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function FacturasPage() {
  const router = useRouter();
  const [estadoPago, setEstadoPago] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchUrl = `/facturas/${estadoPago ? `?estado_pago=${estadoPago}` : ''}`;

  const columns: ColumnDef<Factura>[] = [
    { header: 'Nro Factura', accessorKey: 'id_factura' },
    { 
      header: 'Cliente / Razón Social', 
      cell: (row) => row.razon_social || 'S/N'
    },
    { 
      header: 'NIT', 
      cell: (row) => row.nit_factura || 'S/N' 
    },
    { 
      header: 'Fecha Emisión', 
      cell: (row) => format(parseISO(row.fecha_emision), 'dd/MM/yyyy HH:mm')
    },
    { 
      header: 'Total a Pagar', 
      cell: (row) => `Bs. ${parseFloat(row.total_pagar).toFixed(2)}`
    },
    { 
      header: 'Estado Pago', 
      cell: (row) => <StatusBadge status={row.estado_pago} />
    },
    {
      header: 'Acciones',
      cell: (row) => (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push(`/caja/facturas/${row.id_factura}`)}
          >
            <Eye className="h-4 w-4 mr-1" />
            <span>Detalle</span>
          </Button>
        </div>
      )
    }
  ];

  return (
    <RoleGuard allowedRoles={['Administrador', 'Cajero']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Caja y Facturación</h1>
            <p className="text-muted-foreground">Listado de facturas emitidas por cargos médicos, recetas y hospitalizaciones.</p>
          </div>
          <Button onClick={() => router.push('/caja/facturas/consolidar')} className="flex items-center space-x-1">
            <Plus className="h-4 w-4" />
            <span>Consolidar Cargos</span>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 bg-card/40 p-4 border rounded-lg">
          <div className="flex flex-col space-y-1.5 w-60">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Filtrar por Estado de Pago</label>
            <select
              value={estadoPago}
              onChange={(e) => {
                setEstadoPago(e.target.value);
                setRefreshKey(p => p + 1);
              }}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendientes</option>
              <option value="Parcial">Pagos Parciales</option>
              <option value="Pagado">Pagadas</option>
              <option value="Anulado">Anuladas</option>
            </select>
          </div>
        </div>

        <DataTable<Factura> 
          columns={columns} 
          fetchUrl={fetchUrl} 
          searchPlaceholder="Buscar factura por Razón Social o NIT..."
          key={refreshKey}
        />
      </div>
    </RoleGuard>
  );
}
