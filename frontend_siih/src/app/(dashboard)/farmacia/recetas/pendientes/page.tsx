'use client';

import { useState, useEffect } from 'react';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { getRecetasPendientes, despacharReceta } from '@/services/recetasService';
import { RecetaDetalle } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DespachoConfirm } from '@/components/farmacia/DespachoConfirm';
import { Pill, Play, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RecetasPendientesPage() {
  const [recetas, setRecetas] = useState<RecetaDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceta, setSelectedReceta] = useState<RecetaDetalle | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [dispatching, setDispatching] = useState(false);

  const fetchRecetas = async () => {
    setLoading(true);
    try {
      const data = await getRecetasPendientes();
      setRecetas(data);
    } catch (error) {
      toast.error('Error al cargar recetas pendientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecetas();
  }, []);

  const handleDispatch = async () => {
    if (!selectedReceta) return;
    setDispatching(true);
    try {
      const res = await despacharReceta(selectedReceta.id_detalle_receta);
      toast.success(`Receta despachada exitosamente.`);
      
      if (res.despacho_info?.alerta_stock_bajo) {
        toast((t) => (
          <span className="flex items-center space-x-2 text-yellow-400">
            <AlertCircle className="h-5 w-5" />
            <span>
              <strong>¡Alerta Stock Bajo!</strong> {res.despacho_info.medicamento} quedó con {res.despacho_info.stock_resultante} unidades (mínimo: {res.despacho_info.stock_minimo}).
            </span>
          </span>
        ), {
          duration: 6000,
          style: {
            background: 'var(--color-dark-900)',
            border: '1px solid var(--color-dark-800)',
            color: '#fff',
          }
        });
      }
      
      setIsConfirmOpen(false);
      setSelectedReceta(null);
      fetchRecetas();
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.detail) {
        toast.error(`Stock Insuficiente: ${error.response.data.detail}`);
      } else {
        toast.error(error.response?.data?.detail || 'Error al despachar receta');
      }
    } finally {
      setDispatching(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['Administrador', 'Farmacéutico']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cola de Despacho de Recetas</h1>
          <p className="text-muted-foreground">Recetas clínicas emitidas por médicos pendientes de entrega.</p>
        </div>

        {loading ? (
          <div className="text-center py-12">Cargando cola de despacho...</div>
        ) : recetas.length === 0 ? (
          <div className="border border-dashed rounded-lg bg-card/40 py-12 text-center">
            <Pill className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No hay recetas pendientes de despacho.</p>
          </div>
        ) : (
          <div className="rounded-md border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Historial ID</TableHead>
                  <TableHead>Medicamento</TableHead>
                  <TableHead className="text-right">Cantidad Recetada</TableHead>
                  <TableHead>Dosis/Duración</TableHead>
                  <TableHead>Estado Despacho</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recetas.map((receta: any) => (
                  <TableRow key={receta.id_detalle_receta}>
                    <TableCell>#{receta.id_historial}</TableCell>
                    <TableCell className="font-semibold">{receta.medicamento_nombre}</TableCell>
                    <TableCell className="text-right">{receta.cantidad_recetada} unid.</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {[receta.dosis, receta.frecuencia, receta.duracion].filter(Boolean).join(' | ')}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={receta.estado_despacho} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setSelectedReceta(receta);
                          setIsConfirmOpen(true);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-1"
                      >
                        <Play className="h-3 w-3" />
                        <span>Despachar</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <DespachoConfirm 
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleDispatch}
          receta={selectedReceta}
          loading={dispatching}
        />
      </div>
    </RoleGuard>
  );
}
