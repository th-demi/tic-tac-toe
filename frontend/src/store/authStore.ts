import { create } from 'zustand';
import type { NakamaSession } from '../services/nakamaClient';

interface AuthState {
  nickname: string;
  session: NakamaSession | null;
  setNickname: (nickname: string) => void;
  setSession: (session: NakamaSession) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  nickname: '',
  session: null,

  setNickname: (nickname) => set({ nickname }),

  setSession: (session) => set({ session })
}));