import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas que no requieren autenticación
const PUBLIC_ROUTES = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip auth for static files and public routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    PUBLIC_ROUTES.includes(pathname)
  ) {
    // Si el usuario está en /login y ya tiene un estado auth (simulado comprobando la cookie si usáramos cookies), 
    // lo ideal sería redirigirlo al dashboard. Como usamos Zustand con localStorage,
    // el middleware de Next.js (server-side) no tiene acceso al localStorage.
    // Por ende, la redirección de login a dashboard se hace client-side en la página de login.
    return NextResponse.next();
  }

  // En un escenario real ideal, los tokens se guardarían en cookies HTTPOnly.
  // Como actualmente se guardan en localStorage (vía Zustand), el middleware del servidor
  // no puede leerlos. Por simplicidad en este MVP y para cumplir con los requerimientos, 
  // permitiremos el paso y el `RoleGuard` (Client Component) hará la protección dura.
  // Sin embargo, si hubiese un token en las cookies, haríamos esto:
  
  // const token = request.cookies.get('access_token');
  // if (!token) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
