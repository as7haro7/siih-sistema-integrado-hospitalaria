'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { TriageBadge } from '@/components/emergencias/TriageBadge';
import { Search, Plus, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { getEmergencias } from '@/services/emergenciasService';
import { Emergencia, NivelTriage } from '@/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const PAGE_SIZE = 20;
const NIVELES_TRIAGE: NivelTriage[] = ['Rojo', 'Naranja', 'Amarillo', 'Verde', 'Azul'];

export default function EmergenciasPage() {
  const router = useRouter();
  const [data, setData] = useState<Emergencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [triageFilter, setTriageFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getEmergencias({
        search: search || undefined,
        nivel_triage: triageFilter || undefined,
        page,
      });
      setData(response.results);
      setTotalCount(response.count);
      setTotalPages(Math.ceil(response.count / PAGE_SIZE));
    } catch (error) {
      console.error('Error fetching emergencias:', error);
      toast.error('Error al cargar emergencias');
    } finally {
      setLoading(false);
    }
  }, [search, triageFilter, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchData]);

  return (
    <RoleGuard allowedRoles={['Administrador', 'Recepcionista', 'Médico']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Emergencias</h1>
              <p className="text-muted-foreground">Registro y seguimiento de emergencias con triage.</p>
            </div>
          </div>
          <Button onClick={() => router.push('/recepcion/emergencias/nueva')}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Emergencia
          </Button>
        </div>

        {/* Triage Summary Cards */}
        <div className="grid grid-cols-5 gap-2">
          {NIVELES_TRIAGE.map((nivel) => {
            const count = data.filter((e) => e.nivel_triage === nivel).length;
            const isActive = triageFilter === nivel;
            return (
              <button
                key={nivel}
                onClick={() => {
                  setTriageFilter(isActive ? '' : nivel);
                  setPage(1);
                }}
                className={`rounded-lg border p-3 text-center transition-all hover:scale-105 ${
                  isActive ? 'ring-2 ring-primary' : ''
                }`}
              >
                <TriageBadge nivel={nivel} />
                <p className="mt-2 text-lg font-bold">{count}</p>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por paciente..."
              className="pl-8"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={triageFilter}
            onChange={(e) => { setTriageFilter(e.target.value); setPage(1); }}
          >
            <option value="">Todos los niveles</option>
            {NIVELES_TRIAGE.map((nivel) => (
              <option key={nivel} value={nivel}>{nivel}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Triage</TableHead>
                <TableHead>Fecha/Hora Ingreso</TableHead>
                <TableHead>Médico Guardia</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Destino</TableHead>
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
                    No se encontraron emergencias registradas.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((emergencia) => (
                  <TableRow key={emergencia.id_emergencia}>
                    <TableCell className="font-medium">{emergencia.paciente_nombre}</TableCell>
                    <TableCell>
                      <TriageBadge nivel={emergencia.nivel_triage} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(emergencia.fecha_hora_ingreso, 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>{emergencia.medico_nombre}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {emergencia.descripcion_urgencia || '—'}
                    </TableCell>
                    <TableCell>{emergencia.destino_paciente || '—'}</TableCell>
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
