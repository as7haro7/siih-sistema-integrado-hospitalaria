'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Search, Plus, ChevronLeft, ChevronRight, Check, X, Clock, UserCheck, UserX } from 'lucide-react';
import { getCitas, updateCitaEstado } from '@/services/citasService';
import { Cita } from '@/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const PAGE_SIZE = 20;
const ESTADOS_CITA = ['Pendiente', 'Confirmada', 'Atendida', 'Cancelada', 'No Asistio'] as const;

export default function CitasPage() {
  const router = useRouter();
  const [data, setData] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [fechaFilter, setFechaFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getCitas({
        search: search || undefined,
        estado_cita: estadoFilter || undefined,
        fecha_cita: fechaFilter || undefined,
        ordering: '-fecha_cita,-hora_cita',
        page,
      });
      setData(response.results);
      setTotalCount(response.count);
      setTotalPages(Math.ceil(response.count / PAGE_SIZE));
    } catch (error) {
      console.error('Error fetching citas:', error);
      toast.error('Error al cargar citas');
    } finally {
      setLoading(false);
    }
  }, [search, estadoFilter, fechaFilter, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleEstadoChange = async (citaId: number, nuevoEstado: string) => {
    setUpdatingId(citaId);
    try {
      await updateCitaEstado(citaId, { estado_cita: nuevoEstado as any });
      toast.success(`Cita actualizada a "${nuevoEstado}"`);
      fetchData();
    } catch (error: any) {
      toast.error('Error al actualizar el estado de la cita');
    } finally {
      setUpdatingId(null);
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'Pendiente': return <Clock className="h-3.5 w-3.5" />;
      case 'Confirmada': return <Check className="h-3.5 w-3.5" />;
      case 'Atendida': return <UserCheck className="h-3.5 w-3.5" />;
      case 'Cancelada': return <X className="h-3.5 w-3.5" />;
      case 'No Asistio': return <UserX className="h-3.5 w-3.5" />;
      default: return null;
    }
  };

  return (
    <RoleGuard allowedRoles={['Administrador', 'Recepcionista', 'Médico']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Citas Médicas</h1>
            <p className="text-muted-foreground">Gestión y seguimiento de citas médicas programadas.</p>
          </div>
          <Button onClick={() => router.push('/recepcion/citas/nueva')}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Cita
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar paciente o médico..."
              className="pl-8"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={estadoFilter}
            onChange={(e) => { setEstadoFilter(e.target.value); setPage(1); }}
          >
            <option value="">Todos los estados</option>
            {ESTADOS_CITA.map((estado) => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>
          <Input
            type="date"
            className="w-auto"
            value={fechaFilter}
            onChange={(e) => { setFechaFilter(e.target.value); setPage(1); }}
          />
          {fechaFilter && (
            <Button variant="ghost" size="sm" onClick={() => setFechaFilter('')}>
              Limpiar fecha
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Médico</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Cambiar Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Cargando...
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No se encontraron citas médicas.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((cita) => (
                  <TableRow key={cita.id_cita}>
                    <TableCell className="font-medium">{cita.paciente_nombre}</TableCell>
                    <TableCell>{cita.medico_nombre}</TableCell>
                    <TableCell>{formatDate(cita.fecha_cita)}</TableCell>
                    <TableCell className="font-mono">{cita.hora_cita?.slice(0, 5)}</TableCell>
                    <TableCell>
                      <StatusBadge status={cita.estado_cita} />
                    </TableCell>
                    <TableCell>
                      <select
                        className="flex h-8 rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                        value={cita.estado_cita}
                        disabled={updatingId === cita.id_cita}
                        onChange={(e) => handleEstadoChange(cita.id_cita, e.target.value)}
                      >
                        {ESTADOS_CITA.map((estado) => (
                          <option key={estado} value={estado}>{estado}</option>
                        ))}
                      </select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Mostrando {data.length} de {totalCount} resultados
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <div className="text-sm font-medium">
              Página {page} de {totalPages || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0 || loading}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
