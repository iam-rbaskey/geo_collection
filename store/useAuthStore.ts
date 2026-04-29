import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  isChecking: boolean;
  setIsAuthenticated: (val: boolean) => void;
  setIsChecking: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isChecking: true,
  setIsAuthenticated: (val) => set({ isAuthenticated: val }),
  setIsChecking: (val) => set({ isChecking: val }),
}));
