'use client';

import { useState, useEffect } from 'react';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { getCamas } from '@/services/camasService';
import { Cama } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BedDouble, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MapaCamasPage() {
  const [camas, setCamas] = useState<Cama[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCamas = async () => {
      try {
        // Fetch all camas (ignoring pagination for the map view to show all)
        // Adjust page size if backend supports it, or use multiple requests if necessary
        const res = await getCamas({ page: 1 });
        setCamas(res.results);
      } catch (error) {
        console.error('Error fetching camas', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCamas();
  }, []);

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'Disponible': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'Ocupada': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case 'Mantenimiento': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'Disponible': return <CheckCircle size={24} className="text-green-500" />;
      case 'Ocupada': return <Clock size={24} className="text-red-500" />;
      case 'Mantenimiento': return <AlertTriangle size={24} className="text-yellow-500" />;
      default: return <BedDouble size={24} />;
    }
  };

  const camasPorHabitacion = camas.reduce((acc, cama) => {
    if (!acc[cama.nro_habitacion]) {
      acc[cama.nro_habitacion] = [];
    }
    acc[cama.nro_habitacion].push(cama);
    return acc;
  }, {} as Record<string, Cama[]>);

  const stats = {
    total: camas.length,
    disponibles: camas.filter(c => c.estado_cama === 'Disponible').length,
    ocupadas: camas.filter(c => c.estado_cama === 'Ocupada').length,
    mantenimiento: camas.filter(c => c.estado_cama === 'Mantenimiento').length,
  };

  return (
    <RoleGuard allowedRoles={['Administrador', 'Médico', 'Enfermera']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mapa de Camas</h1>
          <p className="text-muted-foreground">
            Monitoreo en tiempo real del estado de camas y habitaciones.
          </p>
        </div>

        {/* Resumen */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Camas</CardTitle>
              <BedDouble className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Disponibles</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.disponibles}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Ocupadas</CardTitle>
              <Clock className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.ocupadas}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">En Mantenimiento</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.mantenimiento}</div>
            </CardContent>
          </Card>
        </div>

        {/* Mapa */}
        {loading ? (
          <div className="py-12 text-center text-muted-foreground">Cargando mapa...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Object.entries(camasPorHabitacion).map(([habitacion, camasHabitacion]) => (
              <Card key={habitacion} className="overflow-hidden">
                <CardHeader className="bg-secondary/50 py-3">
                  <CardTitle className="text-base flex justify-between items-center">
                    Habitación {habitacion}
                    <span className="text-xs font-normal text-muted-foreground bg-background px-2 py-1 rounded-full border">
                      {camasHabitacion[0]?.tipo_habitacion}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 grid gap-3">
                  {camasHabitacion.map(cama => (
                    <div 
                      key={cama.id_cama}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border",
                        getStatusColor(cama.estado_cama)
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(cama.estado_cama)}
                        <div>
                          <p className="font-medium text-sm">Cama {cama.nro_cama}</p>
                          <p className="text-xs opacity-80">{cama.estado_cama}</p>
                        </div>
                      </div>
                      <div className="text-right text-xs opacity-70">
                        Bs. {parseFloat(cama.costo_por_dia).toFixed(0)}/día
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
