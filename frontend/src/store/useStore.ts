import { create } from 'zustand'

interface AppState {
  candidateId: string | null;
  resumeId: string | null;
  sessionId: string | null;
  roleId: string | null;
  setCandidateData: (candidateId: string, resumeId: string) => void;
  setRoleData: (roleId: string) => void;
  setSessionId: (sessionId: string) => void;
  reset: () => void;
}

export const useStore = create<AppState>((set) => ({
  candidateId: null,
  resumeId: null,
  sessionId: null,
  roleId: null,
  setCandidateData: (candidateId, resumeId) => set({ candidateId, resumeId }),
  setRoleData: (roleId) => set({ roleId }),
  setSessionId: (sessionId) => set({ sessionId }),
  reset: () => set({ candidateId: null, resumeId: null, sessionId: null, roleId: null }),
}))
