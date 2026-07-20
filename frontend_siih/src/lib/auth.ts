import { api } from './api';
import { useAuthStore } from '@/stores/authStore';

export const login = async (username: string, password: string) => {
  const { data } = await api.post('/auth/login/', { username, password });
  return data; // { access, refresh }
};

export const logout = () => {
  useAuthStore.getState().clearAuth();
  window.location.href = '/login';
};

export const fetchCurrentUserProfile = async () => {
  try {
    const token = useAuthStore.getState().accessToken;
    if (!token) throw new Error('No access token');

    // Decodificar JWT para obtener el user_id
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.user_id;

    if (!userId) throw new Error('Invalid token payload');

    // Obtener datos reales del usuario
    const { data: user } = await api.get(`/usuarios/${userId}/`);
    
    // DRF devuelve el usuario con el formato de UserSerializer
    return user;
  } catch (error) {
    console.error("Error fetching profile", error);
    throw error;
  }
};
