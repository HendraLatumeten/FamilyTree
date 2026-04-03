import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserState {
  token: string | null;
  name: string | null;
  role: string | null;
  isActive: boolean;
  login: (token: string, name: string, role: string, isActive: boolean) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      token: null,
      name: null,
      role: null,
      isActive: true,
      login: (token, name, role, isActive) => set({ token, name, role, isActive }),
      logout: () => set({ token: null, name: null, role: null, isActive: true }),
    }),
    {
      name: 'family-tree-session',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
