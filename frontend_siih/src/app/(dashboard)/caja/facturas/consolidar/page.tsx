'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { getConfigImpuestos } from '@/services/configImpuestoService';
import { consolidarFactura } from '@/services/facturasService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { SearchableSelect } from '@/components/shared/SearchableSelect';
import { ArrowLeft, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ConsolidarFacturaPage() {
  const router = useRouter();

  const [impuestos, setImpuestos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [tipoConsolidacion, setTipoConsolidacion] = useState<'historial' | 'hospitalizacion'>('historial');
  const [targetId, setTargetId] = useState('');
  const [idImpuesto, setIdImpuesto] = useState('');
  const [nitFactura, setNitFactura] = useState('');
  const [razonSocial, setRazonSocial] = useState('');

  useEffect(() => {
    const fetchImpuestos = async () => {
      try {
        const data = await getConfigImpuestos();
        setImpuestos(data.results || data);
      } catch (error) {
        toast.error('Error al cargar configuraciones de impuestos');
      }
    };
    fetchImpuestos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetId) {
      toast.error(`Ingrese el ID de ${tipoConsolidacion === 'historial' ? 'Historial Clínico' : 'Hospitalización'}`);
      return;
    }
    if (!idImpuesto) {
      toast.error('Seleccione un impuesto');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        id_historial: tipoConsolidacion === 'historial' ? parseInt(targetId) : null,
        id_hospitalizacion: tipoConsolidacion === 'hospitalizacion' ? parseInt(targetId) : null,
        id_impuesto: parseInt(idImpuesto),
        nit_factura: nitFactura || undefined,
        razon_social: razonSocial || undefined,
      };

      const res = await consolidarFactura(payload);
      toast.success('Factura consolidada y emitida con éxito');
      router.push(`/caja/facturas/${res.id_factura}`);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Error al consolidar cargos. Verifique que el ID exista y no tenga factura previa.');
    } finally {
      setLoading(false);
    }
  };

  const impuestoOptions = impuestos.map(imp => ({
    value: imp.id_impuesto?.toString() || imp.id?.toString(),
    label: `${imp.descripcion || imp.nombre} (${parseFloat(imp.porcentaje).toFixed(2)}%)`
  }));

  return (
    <RoleGuard allowedRoles={['Administrador', 'Cajero']}>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Consolidación de Cargos</h1>
            <p className="text-muted-foreground">Genera una factura consolidando recetas despachadas, exámenes de laboratorio o días de hospitalización.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Formulario de Facturación</span>
              </CardTitle>
              <CardDescription>Especifique el origen y los datos de facturación.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tipo Consolidación */}
              <div className="space-y-2">
                <Label>Tipo de Consolidación</Label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="tipo" 
                      checked={tipoConsolidacion === 'historial'}
                      onChange={() => {
                        setTipoConsolidacion('historial');
                        setTargetId('');
                      }}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span>Consulta Externa (Historial Clínico)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="tipo" 
                      checked={tipoConsolidacion === 'hospitalizacion'}
                      onChange={() => {
                        setTipoConsolidacion('hospitalizacion');
                        setTargetId('');
                      }}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span>Hospitalización</span>
                  </label>
                </div>
              </div>

              {/* ID de Origen */}
              <div className="space-y-2">
                <Label htmlFor="targetId">
                  {tipoConsolidacion === 'historial' 
                    ? 'ID de Historial Clínico' 
                    : 'ID de Hospitalización'}
                </Label>
                <Input
                  id="targetId"
                  type="number"
                  placeholder={`Ingrese el ID de ${tipoConsolidacion === 'historial' ? 'Historial Clínico' : 'Hospitalización'}`}
                  value={targetId}
                  onChange={e => setTargetId(e.target.value)}
                  required
                />
              </div>

              {/* Impuesto */}
              <div className="space-y-2">
                <Label>Tipo de Impuesto (IVA/NIT)</Label>
                <SearchableSelect 
                  options={impuestoOptions}
                  value={idImpuesto}
                  onChange={setIdImpuesto}
                  placeholder="Seleccionar impuesto configurado..."
                />
              </div>

              {/* Datos de Factura */}
              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div className="space-y-2">
                  <Label htmlFor="nitFactura">NIT / CI Cliente</Label>
                  <Input
                    id="nitFactura"
                    placeholder="Ej: 83921820"
                    value={nitFactura}
                    onChange={e => setNitFactura(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="razonSocial">Razón Social</Label>
                  <Input
                    id="razonSocial"
                    placeholder="Ej: Juan Pérez"
                    value={razonSocial}
                    onChange={e => setRazonSocial(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {loading ? 'Generando Factura...' : 'Consolidar y Emitir'}
            </Button>
          </div>
        </form>
      </div>
    </RoleGuard>
  );
}
