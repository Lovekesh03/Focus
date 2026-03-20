import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleTaskReminder, cancelTaskReminder } from '@/lib/notifications';

export interface Task {
  id: string;
  title: string;
  notes?: string;
  completed: boolean;
  createdAt: number; 
  priority: 'low' | 'medium' | 'high';
}

interface AppState {
  tasks: Task[];
  currentStreak: number;
  lastCompletedDate: string | null; // YYYY-MM-DD format
  badges: string[]; // unlocked badges
  themeOverride: 'light' | 'dark' | 'system';

  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTaskNotes: (id: string, notes: string) => void;
  setThemeOverride: (theme: 'light' | 'dark' | 'system') => void;

  evaluateStreak: () => void;
}

export const useTaskStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: [],
      currentStreak: 0,
      lastCompletedDate: null,
      badges: [],
      themeOverride: 'system',

      addTask: (task) => set((state) => {
        const id = Math.random().toString(36).substring(7);
        scheduleTaskReminder(id, task.title);
        return {
          tasks: [...state.tasks, {
            ...task,
            id,
            createdAt: Date.now(),
            completed: false
          }]
        };
      }),

      toggleTask: (id) => set((state) => {
        const tasks = state.tasks.map(t => {
          if (t.id === id) {
            const nextState = !t.completed;
            if (nextState) cancelTaskReminder(id);
            else scheduleTaskReminder(id, t.title);
            return { ...t, completed: nextState };
          }
          return t;
        });
        return { ...state, tasks };
      }),

      deleteTask: (id) => set((state) => {
        cancelTaskReminder(id);
        return { tasks: state.tasks.filter(t => t.id !== id) };
      }),

      updateTaskNotes: (id, notes) => set((state) => ({
        tasks: state.tasks.map(t =>
          t.id === id ? { ...t, notes } : t
        )
      })),

      evaluateStreak: () => {
        // Evaluate daily streak logic
      },

      setThemeOverride: (themeOverride) => set({ themeOverride })
    }),
    {
      name: 'aura-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
