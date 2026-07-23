import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

// ─── URLs de backend ─────────────────────────────────────────────
const LOCAL_API_URL = 'http://localhost:8000/api/v1';
const REMOTE_API_URL = process.env.NEXT_PUBLIC_API_REMOTE_URL
  || 'https://siih-sistema-integrado-hospitalaria.onrender.com/api/v1';

// URL explícita forzada (si se define, no hay fallback)
const EXPLICIT_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ─── Resolución inteligente de URL ───────────────────────────────
let resolvedBaseURL: string | null = EXPLICIT_URL || null;
let isResolving = false;
let resolvePromise: Promise<string> | null = null;

/**
 * Resuelve la URL base de la API de forma inteligente:
 * 1. Si NEXT_PUBLIC_API_BASE_URL está definida → la usa directamente
 * 2. Si no, intenta un health-check al backend local (timeout 1.5s)
 * 3. Si el local responde → usa localhost
 * 4. Si no responde → usa el backend remoto (Render)
 * 5. Cachea el resultado para no repetir el health-check
 */
async function resolveApiUrl(): Promise<string> {
  // Ya resuelto previamente
  if (resolvedBaseURL) return resolvedBaseURL;

  // Evitar múltiples health-checks simultáneos
  if (isResolving && resolvePromise) return resolvePromise;

  isResolving = true;
  resolvePromise = (async () => {
    try {
      // Intentar conectar al backend local con timeout corto
      await axios.get(LOCAL_API_URL.replace('/api/v1', '/api/v1/'), {
        timeout: 1500,
      });
      resolvedBaseURL = LOCAL_API_URL;
      console.log('[LOCAL] SIIH API: Conectado al backend LOCAL');
    } catch (error: any) {
      // Si el servidor local responde (ej. con 401 o 403), significa que ESTÁ ENCENDIDO
      if (error.response) {
        resolvedBaseURL = LOCAL_API_URL;
        console.log('[LOCAL] SIIH API: Conectado al backend LOCAL (respondió con código', error.response.status, ')');
      } else {
        // Network error o timeout -> Servidor apagado
        resolvedBaseURL = REMOTE_API_URL;
        console.log('[REMOTO] SIIH API: Backend local no disponible, usando REMOTO (Render)');
      }
    }
    isResolving = false;
    return resolvedBaseURL;
  })();

  return resolvePromise;
}

// ─── Instancia Axios ─────────────────────────────────────────────
export const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ─────────────────────────────────────────
// Resuelve la URL base antes de cada petición (lazy, solo la primera vez)
// y agrega el token JWT.
api.interceptors.request.use(
  async (config) => {
    // Resolver la URL base si aún no se ha hecho
    const baseURL = await resolveApiUrl();
    config.baseURL = baseURL;

    // Agregar token JWT
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor (auto-refresh JWT) ─────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;

      if (refreshToken) {
        try {
          const baseURL = await resolveApiUrl();
          // Attempt to refresh token
          const { data } = await axios.post(`${baseURL}/auth/refresh/`, {
            refresh: refreshToken,
          });

          // Update store with new tokens
          useAuthStore.getState().setTokens(data.access, data.refresh);

          // Update original request header and retry
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh fails, log out
          useAuthStore.getState().clearAuth();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, log out
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// ─── Utilidad: obtener la URL actual del API ─────────────────────
export const getApiBaseUrl = () => resolvedBaseURL;

// ─── Utilidad: forzar re-detección (para debug/testing) ──────────
export const resetApiUrl = () => {
  resolvedBaseURL = EXPLICIT_URL || null;
  resolvePromise = null;
  isResolving = false;
};

