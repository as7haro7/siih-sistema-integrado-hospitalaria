'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();
  const { isAuthenticated, hasRole, _hasHydrated } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!_hasHydrated) return; // Wait for zustand to hydrate

    // Si no está autenticado, pa' fuera
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    // Si no hay roles específicos requeridos, pasa
    if (!allowedRoles || allowedRoles.length === 0) {
      setIsAuthorized(true);
      return;
    }

    // Verifica si tiene al menos uno de los roles permitidos
    const authorized = allowedRoles.some((role) => hasRole(role));
    
    if (!authorized) {
      // Redirigir al dashboard general si no tiene permisos para esta ruta
      router.replace('/dashboard');
    } else {
      setIsAuthorized(true);
    }
  }, [isAuthenticated, allowedRoles, hasRole, router]);

  if (isAuthorized === null) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isAuthorized === false) {
    return null; // El router hará el redirect
  }

  return <>{children}</>;
}
