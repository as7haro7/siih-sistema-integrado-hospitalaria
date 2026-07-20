'use client';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Topbar() {
  const { user } = useAuthStore();
  const { toggleMobileSidebar } = useUiStore();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2 md:hidden"
          onClick={toggleMobileSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold text-foreground hidden sm:block">
          {/* Aquí se podría poner un breadcrumb si se desea */}
        </h2>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex flex-col items-end text-sm">
          <span className="font-medium">
            {user ? (user.first_name ? `${user.first_name} ${user.last_name}` : user.username) : 'Cargando...'}
          </span>
          <span className="text-xs text-muted-foreground">
            {user?.roles?.join(', ')}
          </span>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary font-bold uppercase">
          {(user?.first_name || user?.username || 'U').charAt(0)}
        </div>
      </div>
    </header>
  );
}
