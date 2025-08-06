import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
   theme: 'light' | 'dark'
   toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
  //new
  theme: 'light',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
}));