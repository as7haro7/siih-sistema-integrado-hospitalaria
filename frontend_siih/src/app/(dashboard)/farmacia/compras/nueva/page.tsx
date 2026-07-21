'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { getProveedores, createCompra } from '@/services/comprasService';
import { getMedicamentos } from '@/services/medicamentosService';
import { Proveedor, Medicamento } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { SearchableSelect } from '@/components/shared/SearchableSelect';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NuevaCompraPage() {
  const router = useRouter();

  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [idProveedor, setIdProveedor] = useState('');
  const [fechaCompra, setFechaCompra] = useState(new Date().toISOString().split('T')[0]);
  const [nroFactura, setNroFactura] = useState('');
  
  // Lot/Details Form State
  const [idMedicamento, setIdMedicamento] = useState('');
  const [nroLote, setNroLote] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [precioCompra, setPrecioCompra] = useState(1.0);
  const [fechaVencimiento, setFechaVencimiento] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const provData = await getProveedores();
        setProveedores(provData);

        // Fetch first page of medications (up to 100 or paginated)
        const medData = await getMedicamentos();
        setMedicamentos(medData.results || medData);
      } catch (error) {
        toast.error('Error al cargar proveedores o medicamentos');
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idProveedor) {
      toast.error('Seleccione un proveedor');
      return;
    }
    if (!idMedicamento) {
      toast.error('Seleccione un medicamento');
      return;
    }
    if (!fechaVencimiento) {
      toast.error('Seleccione la fecha de vencimiento');
      return;
    }

    if (new Date(fechaVencimiento) <= new Date(fechaCompra)) {
      toast.error('La fecha de vencimiento debe ser posterior a la fecha de compra');
      return;
    }

    setLoading(true);
    try {
      await createCompra({
        id_proveedor: parseInt(idProveedor),
        fecha_compra: fechaCompra,
        numero_factura_compra: nroFactura || undefined,
        id_medicamento: parseInt(idMedicamento),
        numero_lote: nroLote || undefined,
        cantidad: cantidad,
        precio_compra_unitario: precioCompra,
        fecha_vencimiento: fechaVencimiento,
      });

      toast.success('Compra registrada y lote ingresado en stock');
      router.push('/farmacia/compras');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Error al registrar la compra');
    } finally {
      setLoading(false);
    }
  };

  const proveedorOptions = Array.isArray(proveedores) 
  ? proveedores.map((p: any) => ({
      value: p.id_proveedor.toString(),
      label: p.nombre_proveedor
    }))
  : [];

  const medOptions = medicamentos.map((m: any) => ({
    value: m.id_medicamento.toString(),
    label: `${m.nombre_comercial} (Stock: ${m.stock_actual})`
  }));

  return (
    <RoleGuard allowedRoles={['Administrador', 'Farmacéutico']}>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Registrar Compra y Lote</h1>
            <p className="text-muted-foreground">Ingreso atómico de compra de medicamentos y lote correspondiente.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Purchase general info */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  <span>Datos de la Factura / Compra</span>
                </CardTitle>
                <CardDescription>Información del proveedor y datos de emisión.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Proveedor</Label>
                  <SearchableSelect 
                    options={proveedores.map(p => ({ label: p.nombre_proveedor, value: p.id_proveedor.toString() }))}
                    value={idProveedor}
                    onChange={setIdProveedor}
                    placeholder="Seleccionar proveedor..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fechaCompra">Fecha Compra</Label>
                    <Input 
                      id="fechaCompra" 
                      type="date"
                      value={fechaCompra} 
                      onChange={e => setFechaCompra(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nroFactura">Número de Factura</Label>
                    <Input 
                      id="nroFactura" 
                      placeholder="Factura/Comprobante"
                      value={nroFactura} 
                      onChange={e => setNroFactura(e.target.value)} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lot and Medicamento info */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <ShoppingBag className="h-5 w-5 text-emerald-500" />
                  <span>Medicamento y Lote</span>
                </CardTitle>
                <CardDescription>Detalles del lote recibido y cantidades.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Medicamento</Label>
                  <SearchableSelect 
                    options={medOptions}
                    value={idMedicamento}
                    onChange={setIdMedicamento}
                    placeholder="Seleccionar medicamento..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nroLote">Número de Lote</Label>
                    <Input 
                      id="nroLote" 
                      placeholder="Ej: LOT-10293"
                      value={nroLote} 
                      onChange={e => setNroLote(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fechaVencimiento">Fecha Vencimiento</Label>
                    <Input 
                      id="fechaVencimiento" 
                      type="date"
                      value={fechaVencimiento} 
                      onChange={e => setFechaVencimiento(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cantidad">Cantidad Recibida</Label>
                    <Input 
                      id="cantidad" 
                      type="number"
                      min="1"
                      value={cantidad} 
                      onChange={e => setCantidad(parseInt(e.target.value))} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="precioCompra">Precio Compra Unitario (Bs.)</Label>
                    <Input 
                      id="precioCompra" 
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={precioCompra} 
                      onChange={e => setPrecioCompra(parseFloat(e.target.value))} 
                      required 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {loading ? 'Registrando...' : 'Registrar Ingreso'}
            </Button>
          </div>
        </form>
      </div>
    </RoleGuard>
  );
}
