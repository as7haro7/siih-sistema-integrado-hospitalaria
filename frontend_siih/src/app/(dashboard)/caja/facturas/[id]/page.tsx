'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { getFacturaById, registrarPago, getPagosFactura } from '@/services/facturasService';
import { Factura, Pago } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PaymentProgress } from '@/components/facturacion/PaymentProgress';
import { Modal, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ArrowLeft, Plus, Receipt, Landmark, Coins, HeartHandshake } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

export default function FacturaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const facturaId = parseInt(id);

  const [factura, setFactura] = useState<Factura | null>(null);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);

  // Register Payment Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [montoPago, setMontoPago] = useState(0);
  const [metodoPago, setMetodoPago] = useState<'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Seguro'>('Efectivo');
  const [paying, setPaying] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const factData = await getFacturaById(facturaId);
      setFactura(factData);

      const pagosData = await getPagosFactura(facturaId);
      setPagos(pagosData);

      // Pre-fill maximum pending amount as default in modal
      const total = parseFloat(factData.total_pagar);
      const pagado = pagosData.reduce((acc, curr) => acc + parseFloat(curr.monto), 0);
      setMontoPago(Math.max(0, total - pagado));
    } catch (error) {
      toast.error('Error al cargar detalle de factura');
      router.push('/caja/facturas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [facturaId]);

  const handleRegisterPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (montoPago <= 0) {
      toast.error('El monto a pagar debe ser mayor que 0');
      return;
    }

    setPaying(true);
    try {
      await registrarPago(facturaId, {
        monto: montoPago,
        metodo_pago: metodoPago,
      });

      toast.success('Pago registrado correctamente');
      setIsModalOpen(false);
      fetchData(); // Reload details and recalculate status
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Error al registrar pago');
    } finally {
      setPaying(false);
    }
  };

  if (loading && !factura) {
    return <div className="text-center py-12">Cargando detalles de factura...</div>;
  }

  if (!factura) return null;

  // Calculate sum of payments
  const totalPagado = pagos.reduce((acc, curr) => acc + parseFloat(curr.monto), 0);
  const isPaid = factura.estado_pago === 'Pagado';
  const isAnulado = factura.estado_pago === 'Anulado';

  return (
    <RoleGuard allowedRoles={['Administrador', 'Cajero']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => router.push('/caja/facturas')}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Factura #{factura.id_factura}</h1>
              <p className="text-muted-foreground">Detalle y cobro de cargos del paciente.</p>
            </div>
          </div>

          {!isPaid && !isAnulado && (
            <Button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-1">
              <Plus className="h-4 w-4" />
              <span>Registrar Pago</span>
            </Button>
          )}
        </div>

        {/* Invoice Summary & Progress */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card md:col-span-2">
            <CardHeader className="pb-3 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base font-semibold">Resumen de Factura</CardTitle>
                  <CardDescription>Datos del cliente y emisión.</CardDescription>
                </div>
                <StatusBadge status={factura.estado_pago} />
              </div>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
              <div>
                <span className="block text-xs font-semibold text-muted-foreground uppercase">Cliente / Razón Social</span>
                <span className="font-medium text-foreground">{factura.razon_social || 'Público General'}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-muted-foreground uppercase">NIT / CI</span>
                <span className="font-medium text-foreground">{factura.nit_factura || '0'}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-muted-foreground uppercase">Fecha Emisión</span>
                <span className="text-muted-foreground">{format(parseISO(factura.fecha_emision), 'dd/MM/yyyy HH:mm')}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-muted-foreground uppercase">Cajero Responsable</span>
                <span className="text-muted-foreground">{factura.cajero_responsable || '-'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Progress */}
          <Card className="glass-card">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-semibold">Estado de Cobro</CardTitle>
              <CardDescription>Avance de pagos recibidos.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <PaymentProgress totalPagar={factura.total_pagar} pagado={totalPagado} />
            </CardContent>
          </Card>
        </div>

        {/* Line Items (Detalles) */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center space-x-2">
              <Receipt className="h-5 w-5 text-primary" />
              <span>Conceptos de Cobro</span>
            </CardTitle>
            <CardDescription>Detalle pormenorizado de servicios facturados.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Concepto / Servicio</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Precio Unitario</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {factura.detalles?.map((det) => (
                  <TableRow key={det.id_factura_detalle}>
                    <TableCell className="font-medium">{det.concepto}</TableCell>
                    <TableCell className="text-right">{det.cantidad}</TableCell>
                    <TableCell className="text-right">Bs. {parseFloat(det.precio_unitario).toFixed(2)}</TableCell>
                    <TableCell className="text-right font-semibold">Bs. {parseFloat(det.subtotal_linea).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Financial Breakdown */}
            <div className="mt-6 flex justify-end">
              <div className="w-80 space-y-2 text-sm border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>Bs. {parseFloat(factura.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Impuestos ({factura.impuesto_descripcion})</span>
                  <span>Bs. {parseFloat(factura.monto_impuesto).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold text-lg text-primary">
                  <span>Total</span>
                  <span>Bs. {parseFloat(factura.total_pagar).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments History */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center space-x-2">
              <Coins className="h-5 w-5 text-yellow-500" />
              <span>Historial de Pagos</span>
            </CardTitle>
            <CardDescription>Registro de cuotas recibidas.</CardDescription>
          </CardHeader>
          <CardContent>
            {pagos.length === 0 ? (
              <div className="text-sm text-muted-foreground py-6 text-center">
                No se han registrado pagos para esta factura.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Pago</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cajero</TableHead>
                    <TableHead className="text-right">Monto Recibido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagos.map((pago) => (
                    <TableRow key={pago.id_pago}>
                      <TableCell>#{pago.id_pago}</TableCell>
                      <TableCell className="font-semibold flex items-center space-x-1.5 pt-3">
                        {pago.metodo_pago === 'Efectivo' && <Coins className="h-4 w-4 text-amber-500" />}
                        {pago.metodo_pago === 'Tarjeta' && <Landmark className="h-4 w-4 text-blue-400" />}
                        {pago.metodo_pago === 'Transferencia' && <Landmark className="h-4 w-4 text-indigo-400" />}
                        {pago.metodo_pago === 'Seguro' && <HeartHandshake className="h-4 w-4 text-emerald-400" />}
                        <span>{pago.metodo_pago}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{format(parseISO(pago.fecha_pago), 'dd/MM/yyyy HH:mm')}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{pago.cajero_responsable}</TableCell>
                      <TableCell className="text-right font-bold text-emerald-400">Bs. {parseFloat(pago.monto).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Modal to Register Payment */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <ModalHeader>
            <ModalTitle>Registrar Pago</ModalTitle>
          </ModalHeader>
          <form onSubmit={handleRegisterPayment} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="monto">Monto a Cancelar (Bs.)</Label>
              <Input 
                id="monto" 
                type="number"
                step="0.01"
                min="0.01"
                max={parseFloat(factura.total_pagar) - totalPagado}
                value={montoPago} 
                onChange={e => setMontoPago(parseFloat(e.target.value))} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metodo">Método de Pago</Label>
              <select
                id="metodo"
                value={metodoPago}
                onChange={e => setMetodoPago(e.target.value as any)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta Débito/Crédito</option>
                <option value="Transferencia">Transferencia Bancaria</option>
                <option value="Seguro">Seguro Médico / Convenio</option>
              </select>
            </div>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={paying}>
                {paying ? 'Procesando...' : 'Confirmar Pago'}
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      </div>
    </RoleGuard>
  );
}
