'use client';

import { useState, useEffect } from 'react';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { getAlertasFarmacia } from '@/services/medicamentosService';
import { AlertasFarmacia } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { AlertTriangle, ShieldAlert, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

export default function AlertasFarmaciaPage() {
  const [alertas, setAlertas] = useState<AlertasFarmacia | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAlertas = async () => {
    setLoading(true);
    try {
      const data = await getAlertasFarmacia();
      setAlertas(data);
    } catch (error) {
      toast.error('Error al cargar alertas de farmacia');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertas();
  }, []);

  return (
    // <RoleGuard allowedRoles={['Administrador', 'Farmacéutico', 'Director']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alertas de Farmacia</h1>
          <p className="text-muted-foreground">Monitoreo de medicamentos con stock crítico y lotes cercanos a expirar.</p>
        </div>

        {loading ? (
          <div className="text-center py-12">Cargando alertas...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stock Bajo */}
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                <ShieldAlert className="h-5 w-5 text-red-500" />
                <div>
                  <CardTitle className="text-lg">Medicamentos con Stock Bajo</CardTitle>
                  <CardDescription>Requieren reposición inmediata.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {!alertas?.stock_bajo || alertas.stock_bajo.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-6 text-center">
                    No hay medicamentos con stock bajo. ¡Buen trabajo!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead className="text-right">Stock Actual</TableHead>
                          <TableHead className="text-right">Mínimo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {alertas.stock_bajo.map((item) => (
                          <TableRow key={item.id_medicamento}>
                            <TableCell className="font-medium">{item.nombre_comercial}</TableCell>
                            <TableCell className="text-right text-red-400 font-semibold">{item.stock_actual}</TableCell>
                            <TableCell className="text-right">{item.stock_minimo}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lotes por vencer */}
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                <Calendar className="h-5 w-5 text-yellow-500" />
                <div>
                  <CardTitle className="text-lg">Lotes Próximos a Vencer</CardTitle>
                  <CardDescription>Lotes ordenados por vencimiento.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {!alertas?.lotes_proximos_a_vencer || alertas.lotes_proximos_a_vencer.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-6 text-center">
                    No hay lotes próximos a vencer.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Lote</TableHead>
                          <TableHead>Medicamento</TableHead>
                          <TableHead className="text-right">Cantidad</TableHead>
                          <TableHead className="text-right">Vencimiento</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {alertas.lotes_proximos_a_vencer.map((item) => {
                          const dateObj = parseISO(item.fecha_vencimiento);
                          const formattedDate = format(dateObj, 'dd/MM/yyyy');
                          return (
                            <TableRow key={item.id_lote}>
                              <TableCell className="font-mono text-xs">{item.numero_lote || 'S/N'}</TableCell>
                              <TableCell>{item.id_medicamento__nombre_comercial}</TableCell>
                              <TableCell className="text-right">{item.cantidad_actual}</TableCell>
                              <TableCell className="text-right text-yellow-400 font-semibold">{formattedDate}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    // </RoleGuard>
  );
}
