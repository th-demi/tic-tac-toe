import { useMatchStore } from '../store/matchStore';

export function useMatch() {
  return useMatchStore();
}