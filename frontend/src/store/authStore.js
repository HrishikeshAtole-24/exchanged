import { create } from 'zustand';
import { authService } from '@/services/auth.service';

const useAuthStore = create((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('exchanged_token') : null,
  loading: false,
  error: null,

  login: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const res = await authService.login(email, password);
      const { token, ...user } = res.data;
      localStorage.setItem('exchanged_token', token);
      set({ user, token, loading: false });
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  register: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const res = await authService.register(email, password);
      const { token, ...user } = res.data;
      localStorage.setItem('exchanged_token', token);
      set({ user, token, loading: false });
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  fetchMe: async () => {
    try {
      const res = await authService.getMe();
      set({ user: res.data });
    } catch {
      set({ user: null, token: null });
      localStorage.removeItem('exchanged_token');
    }
  },

  logout: () => {
    localStorage.removeItem('exchanged_token');
    set({ user: null, token: null });
  },
}));

export default useAuthStore;
