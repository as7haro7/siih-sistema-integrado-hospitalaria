import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  
  // Actions
  setAuth: (access: string, refresh: string, user: User) => void;
  setTokens: (access: string, refresh: string) => void;
  clearAuth: () => void;
  hasRole: (roleName: string) => boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      setAuth: (access, refresh, user) => set({
        accessToken: access,
        refreshToken: refresh,
        user,
        isAuthenticated: true,
      }),

      setTokens: (access, refresh) => set({
        accessToken: access,
        refreshToken: refresh,
      }),

      clearAuth: () => set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      }),

      hasRole: (roleName: string) => {
        const { user } = get();
        if (!user || !user.roles) return false;
        // Superuser overrides everything (if needed, but roles is better)
        return user.roles.includes('Administrador') || user.roles.includes(roleName);
      },
    }),
    {
      name: 'siih-auth-storage', // name of item in storage (localStorage)
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    }
  )
);
