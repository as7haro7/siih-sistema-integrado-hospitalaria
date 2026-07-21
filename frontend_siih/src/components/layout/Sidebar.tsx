'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  Stethoscope, 
  BedDouble, 
  TestTube, 
  Pill,
  CreditCard,
  FileBarChart,
  LogOut,
  ChevronLeft,
  Menu,
  X
} from 'lucide-react';
import { logout } from '@/lib/auth';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard size={20} />,
    roles: ['Administrador', 'Recepcionista', 'Médico', 'Enfermera', 'Técnico de Laboratorio', 'Farmacéutico', 'Cajero', 'Director'],
  },
  {
    title: 'Usuarios',
    href: '/admin/usuarios',
    icon: <Users size={20} />,
    roles: ['Administrador'],
  },
  {
    title: 'Especialidades',
    href: '/admin/especialidades',
    icon: <Stethoscope size={20} />,
    roles: ['Administrador'],
  },
  {
    title: 'Horarios',
    href: '/admin/horarios-medicos',
    icon: <Activity size={20} />,
    roles: ['Administrador'],
  },
  {
    title: 'Tarifas',
    href: '/admin/tarifas-habitacion',
    icon: <BedDouble size={20} />,
    roles: ['Administrador'],
  },
  {
    title: 'Impuestos',
    href: '/admin/config-impuesto',
    icon: <CreditCard size={20} />,
    roles: ['Administrador'],
  },
  {
    title: 'Auditoría',
    href: '/admin/auditoria',
    icon: <FileBarChart size={20} />,
    roles: ['Administrador'],
  },
  {
    title: 'Pacientes',
    href: '/recepcion/pacientes',
    icon: <Users size={20} />,
    roles: ['Administrador', 'Recepcionista'],
  },
  {
    title: 'Citas Médicas',
    href: '/recepcion/citas',
    icon: <Stethoscope size={20} />,
    roles: ['Administrador', 'Recepcionista', 'Médico'],
  },
  {
    title: 'Emergencias',
    href: '/recepcion/emergencias',
    icon: <Activity size={20} />,
    roles: ['Administrador', 'Recepcionista', 'Médico'],
  },
  {
    title: 'Consultorio',
    href: '/consultorio',
    icon: <Stethoscope size={20} />,
    roles: ['Administrador', 'Médico'],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isMobileSidebarOpen, setMobileSidebarOpen } = useUiStore();

  // Filter items based on user roles
  const filteredNavItems = navItems.filter((item) => {
    if (!user || !user.roles) return false;
    return item.roles.some((role) => user.roles.includes(role));
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card transition-all duration-300 md:static md:translate-x-0",
          isCollapsed ? "w-20" : "w-64",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!isCollapsed && (
            <div className="flex items-center space-x-2 font-bold text-primary">
              <Activity size={24} />
              <span className="text-xl">SIIH</span>
            </div>
          )}
          {isCollapsed && (
            <div className="mx-auto flex items-center justify-center text-primary hidden md:flex">
              <Activity size={24} />
            </div>
          )}
          
          {/* Desktop Collapse Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "hidden rounded-full p-1.5 hover:bg-secondary md:block",
              isCollapsed && "absolute -right-3 top-5 border bg-background"
            )}
          >
            {isCollapsed ? <ChevronLeft size={16} className="rotate-180" /> : <Menu size={20} />}
          </button>
          
          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden rounded-full p-1.5 hover:bg-secondary text-muted-foreground"
          >
            <X size={20} />
          </button>
        </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileSidebarOpen(false)}
                className={cn(
                  "flex items-center space-x-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  isCollapsed && "justify-center"
                )}
                title={isCollapsed ? item.title : undefined}
              >
                {item.icon}
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t p-4">
        <button
          onClick={logout}
          className={cn(
            "flex w-full items-center space-x-3 rounded-md px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10",
            isCollapsed && "justify-center"
          )}
          title={isCollapsed ? "Cerrar sesión" : undefined}
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
    </>
  );
}
