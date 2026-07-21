'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { getMedicamentoById } from '@/services/medicamentosService';
import { getLotesMedicamento } from '@/services/comprasService';
import { Medicamento, LoteMedicamento } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Pill, TrendingUp, ShieldAlert, Award } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { StockAlert } from '@/components/farmacia/StockAlert';
import toast from 'react-hot-toast';

export default function MedicamentoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const medId = parseInt(id);

  const [med, setMed] = useState<Medicamento | null>(null);
  const [lotes, setLotes] = useState<LoteMedicamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const medData = await getMedicamentoById(medId);
        setMed(medData);

        // Fetch lotes filtering by medicamento
        const lotesData = await getLotesMedicamento(medId);
        setLotes(lotesData.results || lotesData); // depending on format
      } catch (error) {
        toast.error('Error al cargar detalle del medicamento');
        router.push('/farmacia/medicamentos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [medId, router]);

  if (loading) {
    return <div className="text-center py-12">Cargando detalles...</div>;
  }

  if (!med) return null;

  return (
    <RoleGuard allowedRoles={['Administrador', 'Farmacéutico', 'Director']}>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{med.nombre_comercial}</h1>
            <p className="text-muted-foreground">ID Medicamento: #{med.id_medicamento}</p>
          </div>
        </div>

        {/* Stock status alert */}
        <StockAlert stockActual={med.stock_actual} stockMinimo={med.stock_minimo} />

        {/* Medication Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card">
            <CardContent className="pt-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">Stock Disponible</p>
                <p className="text-3xl font-bold">{med.stock_actual}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <Pill className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">Precio Unitario</p>
                <p className="text-3xl font-bold text-emerald-400">Bs. {parseFloat(med.precio_unitario).toFixed(2)}</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-400">
                <TrendingUp className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">Stock Mínimo</p>
                <p className="text-3xl font-bold">{med.stock_minimo}</p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-full text-yellow-400">
                <ShieldAlert className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lotes sub-table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Award className="h-5 w-5 text-primary" />
              <span>Lotes Ingresados</span>
            </CardTitle>
            <CardDescription>
              Lotes activos de este medicamento. Despachados con algoritmo FIFO.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lotes.length === 0 ? (
              <div className="text-sm text-muted-foreground py-6 text-center">
                No hay lotes ingresados para este medicamento.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número de Lote</TableHead>
                      <TableHead className="text-right">Cantidad Inicial</TableHead>
                      <TableHead className="text-right">Cantidad Actual</TableHead>
                      <TableHead className="text-right">Precio de Compra</TableHead>
                      <TableHead className="text-right">Ingreso</TableHead>
                      <TableHead className="text-right">Vencimiento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lotes.map((lote) => {
                      const fIngreso = lote.fecha_ingreso ? format(parseISO(lote.fecha_ingreso), 'dd/MM/yyyy') : '-';
                      const fVence = lote.fecha_vencimiento ? format(parseISO(lote.fecha_vencimiento), 'dd/MM/yyyy') : '-';
                      
                      const isVencido = new Date(lote.fecha_vencimiento) <= new Date();
                      
                      return (
                        <TableRow key={lote.id_lote}>
                          <TableCell className="font-mono text-xs font-semibold">{lote.numero_lote || 'S/N'}</TableCell>
                          <TableCell className="text-right">{lote.cantidad_inicial}</TableCell>
                          <TableCell className="text-right font-medium">{lote.cantidad_actual}</TableCell>
                          <TableCell className="text-right">Bs. {parseFloat(lote.precio_compra_unitario).toFixed(2)}</TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">{fIngreso}</TableCell>
                          <TableCell className={`text-right font-semibold ${isVencido ? 'text-red-400' : 'text-foreground'}`}>{fVence}</TableCell>
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
    </RoleGuard>
  );
}
