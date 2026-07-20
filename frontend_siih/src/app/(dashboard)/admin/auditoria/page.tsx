'use client';
import { useState } from 'react';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { DataTable, ColumnDef } from '@/components/shared/DataTable';
import { AuditoriaLog } from '@/services/auditoriaService';
import { formatDate } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal, ModalHeader, ModalTitle } from '@/components/ui/Modal';

export default function AuditoriaPage() {
  const [selectedLog, setSelectedLog] = useState<AuditoriaLog | null>(null);
  
  // Extra filters
  const [tabla, setTabla] = useState('');
  const [accion, setAccion] = useState('');
  
  // Custom fetch url constructor for DataTable to include extra query params
  const fetchUrl = `/auditoria/${tabla ? `?tabla_afectada=${tabla}` : ''}${accion ? (tabla ? '&' : '?') + `tipo_operacion=${accion}` : ''}`;

  const columns: ColumnDef<AuditoriaLog>[] = [
    { header: 'ID', accessorKey: 'id_auditoria' },
    { 
      header: 'Fecha y Hora', 
      cell: (row) => formatDate(row.fecha_hora_evento, 'dd/MM/yyyy HH:mm:ss') 
    },
    { header: 'Usuario', accessorKey: 'usuario_accion' },
    { header: 'Tabla', accessorKey: 'tabla_afectada' },
    { header: 'Registro ID', accessorKey: 'id_registro_afectado' },
    { 
      header: 'Operación', 
      cell: (row) => (
        <span className={`font-semibold ${
          row.tipo_operacion === 'INSERCION' ? 'text-medical-500' : 
          row.tipo_operacion === 'EDICION' ? 'text-blue-500' : 
          row.tipo_operacion === 'ELIMINACION' ? 'text-destructive' : ''
        }`}>
          {row.tipo_operacion}
        </span>
      ) 
    },
    { header: 'IP', accessorKey: 'direccion_ip' },
  ];

  return (
    <RoleGuard allowedRoles={['Administrador']}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Auditoría del Sistema</h1>
            <p className="text-muted-foreground">Registro histórico de todas las operaciones de la base de datos.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-4 p-4 rounded-lg bg-card border border-border">
          <div className="space-y-1.5 w-full sm:w-auto">
            <label className="text-xs text-muted-foreground">Tabla Afectada</label>
            <Input 
              value={tabla} 
              onChange={e => setTabla(e.target.value)}
              className="h-9 w-full sm:w-48"
            />
          </div>
          <div className="space-y-1.5 w-full sm:w-auto">
            <label className="text-xs text-muted-foreground">Operación</label>
            <select 
              className="flex h-9 w-full sm:w-40 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background"
              value={accion}
              onChange={e => setAccion(e.target.value)}
            >
              <option value="">Todas</option>
              <option value="INSERCION">INSERCION</option>
              <option value="LECTURA">LECTURA</option>
              <option value="EDICION">EDICION</option>
              <option value="ELIMINACION">ELIMINACION</option>
            </select>
          </div>
        </div>

        <DataTable<AuditoriaLog> 
          columns={columns} 
          fetchUrl={fetchUrl} 
          searchPlaceholder="Buscar en auditoría..."
          onRowClick={(log) => setSelectedLog(log)}
        />

        <Modal isOpen={!!selectedLog} onClose={() => setSelectedLog(null)}>
          <ModalHeader>
            <ModalTitle>Detalles de Auditoría #{selectedLog?.id_auditoria}</ModalTitle>
          </ModalHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="font-semibold text-muted-foreground">Usuario:</span> {selectedLog?.usuario_accion}</div>
              <div><span className="font-semibold text-muted-foreground">Tabla:</span> {selectedLog?.tabla_afectada}</div>
              <div><span className="font-semibold text-muted-foreground">Operación:</span> {selectedLog?.tipo_operacion}</div>
              <div><span className="font-semibold text-muted-foreground">IP:</span> {selectedLog?.direccion_ip}</div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Valores Anteriores:</h4>
              <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-32">
                {selectedLog?.valores_anteriores || 'Ninguno'}
              </pre>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Valores Nuevos:</h4>
              <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-32">
                {selectedLog?.valores_nuevos || 'Ninguno'}
              </pre>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setSelectedLog(null)}>Cerrar</Button>
          </div>
        </Modal>
      </div>
    </RoleGuard>
  );
}
