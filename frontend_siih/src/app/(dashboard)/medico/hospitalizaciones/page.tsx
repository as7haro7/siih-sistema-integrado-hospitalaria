'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { Hospitalizacion } from '@/types';
import { getHospitalizaciones } from '@/services/hospitalizacionService';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Plus, Eye, BedDouble } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function HospitalizacionesPage() {
  const router = useRouter();
  const [data, setData] = useState<Hospitalizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterEstado, setFilterEstado] = useState<string>('Activo');

  const fetchHospitalizaciones = async (page: number, estado: string) => {
    try {
      setLoading(true);
      const res = await getHospitalizaciones({ page, estado_internacion: estado !== 'Todos' ? estado : undefined });
      setData(res.results);
      setTotalCount(res.count);
    } catch (error) {
      console.error('Error cargando hospitalizaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitalizaciones(currentPage, filterEstado);
  }, [currentPage, filterEstado]);

  return (
    <RoleGuard allowedRoles={['Administrador', 'Médico', 'Enfermera']}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hospitalizaciones</h1>
            <p className="text-muted-foreground">
              Gestión de internaciones y altas médicas.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push('/medico/camas')} className="gap-2">
              <BedDouble size={16} /> Mapa de Camas
            </Button>
            <Button onClick={() => router.push('/medico/hospitalizaciones/nueva')} className="gap-2">
              <Plus size={16} /> Nueva Internación
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          {['Activo', 'Alta', 'Trasladado', 'Todos'].map((estado) => (
            <Button
              key={estado}
              variant={filterEstado === estado ? 'default' : 'outline'}
              onClick={() => {
                setFilterEstado(estado);
                setCurrentPage(1);
              }}
            >
              {estado}
            </Button>
          ))}
        </div>

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Cama</TableHead>
                <TableHead>Médico</TableHead>
                <TableHead>F. Ingreso</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">Cargando...</TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">No se encontraron hospitalizaciones.</TableCell>
                </TableRow>
              ) : (
                data.map((row) => (
                  <TableRow key={row.id_hospitalizacion}>
                    <TableCell>{row.id_hospitalizacion}</TableCell>
                    <TableCell>{row.paciente_nombre}</TableCell>
                    <TableCell>{row.cama_info}</TableCell>
                    <TableCell>{row.medico_nombre}</TableCell>
                    <TableCell>{format(parseISO(row.fecha_ingreso), 'dd/MM/yyyy HH:mm')}</TableCell>
                    <TableCell><StatusBadge status={row.estado_internacion} /></TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/medico/hospitalizaciones/${row.id_hospitalizacion}`)}
                        className="flex items-center gap-1"
                      >
                        <Eye size={16} /> Detalle
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {data.length} de {totalCount} resultados
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
            >
              Anterior
            </Button>
            <div className="text-sm font-medium">
              Página {currentPage} de {Math.max(1, Math.ceil(totalCount / 20))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalCount / 20), p + 1))}
              disabled={currentPage === Math.ceil(totalCount / 20) || totalCount === 0 || loading}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
