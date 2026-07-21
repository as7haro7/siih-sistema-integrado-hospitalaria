'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { ExamenLaboratorio } from '@/types';
import { getExamenes } from '@/services/examenesService';
import { Button } from '@/components/ui/Button';
import { Eye, FlaskConical, CheckCircle, Clock } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function ExamenesLaboratorioPage() {
  const router = useRouter();
  const [data, setData] = useState<ExamenLaboratorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterEstado, setFilterEstado] = useState<string>('Pendiente');

  const fetchExamenes = async (page: number, estado: string) => {
    try {
      setLoading(true);
      const res = await getExamenes({ page, estado_examen: estado !== 'Todos' ? estado : undefined });
      setData(res.results);
      setTotalCount(res.count);
    } catch (error) {
      console.error('Error cargando exámenes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamenes(currentPage, filterEstado);
  }, [currentPage, filterEstado]);

  return (
    <RoleGuard allowedRoles={['Administrador', 'Técnico de Laboratorio']}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Laboratorio</h1>
            <p className="text-muted-foreground">
              Cola de exámenes pendientes y gestión de resultados.
            </p>
          </div>
        </div>

        {/* Filtros tipo Tabs rápidos */}
        <div className="flex gap-2">
          {['Pendiente', 'En Proceso', 'Completado', 'Todos'].map((estado) => (
            <Button
              key={estado}
              variant={filterEstado === estado ? 'default' : 'outline'}
              onClick={() => {
                setFilterEstado(estado);
                setCurrentPage(1);
              }}
              className="flex items-center gap-2"
            >
              {estado === 'Pendiente' && <Clock size={16} />}
              {estado === 'En Proceso' && <FlaskConical size={16} />}
              {estado === 'Completado' && <CheckCircle size={16} />}
              {estado}
            </Button>
          ))}
        </div>

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Historial</TableHead>
                <TableHead>Examen Solicitado</TableHead>
                <TableHead>Costo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">Cargando...</TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">No se encontraron exámenes.</TableCell>
                </TableRow>
              ) : (
                data.map((row) => (
                  <TableRow key={row.id_examen}>
                    <TableCell>{row.id_examen}</TableCell>
                    <TableCell>{row.id_historial}</TableCell>
                    <TableCell>{row.tipo_examen}</TableCell>
                    <TableCell>Bs. {parseFloat(row.costo_examen).toFixed(2)}</TableCell>
                    <TableCell><StatusBadge status={row.estado_examen} /></TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/laboratorio/examenes/${row.id_examen}`)}
                        className="flex items-center gap-1"
                      >
                        {row.estado_examen === 'Completado' ? (
                          <><Eye size={16} /> Ver Resultados</>
                        ) : (
                          <><FlaskConical size={16} /> Procesar</>
                        )}
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
