import { create } from 'zustand';
import { PlannerTask } from '../types';

interface PlannerState {
  tasks: PlannerTask[];
  selectedDate: Date | null;
  setTasks: (tasks: PlannerTask[]) => void;
  addTask: (task: PlannerTask) => void;
  updateTask: (id: string, updates: Partial<PlannerTask>) => void;
  setSelectedDate: (date: Date) => void;
}

export const usePlannerStore = create<PlannerState>((set) => ({
  tasks: [],
  selectedDate: null,
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ 
    tasks: [...state.tasks, task] 
  })),
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    )
  })),
  setSelectedDate: (date) => set({ selectedDate: date }),
}));
