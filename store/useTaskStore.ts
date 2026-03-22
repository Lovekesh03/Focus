import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleTaskReminder, cancelTaskReminder, scheduleTargetDeadlineReminder, cancelTargetReminder } from '@/lib/notifications';

export interface Task {
  id: string;
  title: string;
  notes?: string;
  completed: boolean;
  createdAt: number; 
  priority: 'low' | 'medium' | 'high';
}

export interface MonthNote {
  aims: string;
  achievements: string;
}

export interface Target {
  id: string;
  title: string;
  notes?: string;
  deadline: string; // YYYY-MM-DD
  color: string;
  completed: boolean;
  createdAt: number;
}

interface AppState {
  tasks: Task[];
  targets: Target[];
  currentStreak: number;
  lastCompletedDate: string | null; // YYYY-MM-DD format
  badges: string[]; // unlocked badges
  themeOverride: 'light' | 'dark' | 'system';
  monthNotes: Record<string, MonthNote>; // Key: YYYY-MM

  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTaskNotes: (id: string, notes: string) => void;

  addTarget: (target: Omit<Target, 'id' | 'createdAt' | 'completed'>) => void;
  toggleTarget: (id: string) => void;
  deleteTarget: (id: string) => void;

  setThemeOverride: (theme: 'light' | 'dark' | 'system') => void;

  updateMonthNote: (yearMonth: string, note: Partial<MonthNote>) => void;

  evaluateStreak: () => void;
}

export const useTaskStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: [],
      targets: [],
      currentStreak: 0,
      lastCompletedDate: null,
      badges: [],
      themeOverride: 'system',
      monthNotes: {},

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

      addTarget: (target) => set((state) => {
        const id = Math.random().toString(36).substring(7);
        scheduleTargetDeadlineReminder(id, target.title, target.deadline);
        return {
          targets: [...state.targets, {
            ...target,
            id,
            createdAt: Date.now(),
            completed: false
          }]
        };
      }),

      toggleTarget: (id) => set((state) => {
        const targets = state.targets.map(t => {
          if (t.id === id) {
            const nextState = !t.completed;
            if (nextState) cancelTargetReminder(id);
            else scheduleTargetDeadlineReminder(id, t.title, t.deadline);
            return { ...t, completed: nextState };
          }
          return t;
        });
        return { ...state, targets };
      }),

      deleteTarget: (id) => set((state) => {
        cancelTargetReminder(id);
        return { targets: state.targets.filter(t => t.id !== id) };
      }),

      evaluateStreak: () => {
        // Evaluate daily streak logic
      },

      updateMonthNote: (yearMonth, note) => set((state) => ({
        monthNotes: {
          ...state.monthNotes,
          [yearMonth]: {
            ... (state.monthNotes[yearMonth] || { aims: '', achievements: '' }),
            ...note
          }
        }
      })),

      setThemeOverride: (themeOverride) => set({ themeOverride })
    }),
    {
      name: 'aura-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
