import { useState, useEffect, useCallback, useRef } from 'react';
import { authService, AuthState } from './auth';
import { apiClient } from './api';
import { RegisterForm } from './types';
import {
  User,
  Task,
  Category,
  Habit,
  HabitEntry,
  CalendarEvent,
  PomodoroSession,
  Notification,
  TaskPriority,
  HabitFrequency,
  EventType,
  EventSourceType,
  PomodoroType,
  NotificationType,
} from './types';

// -----------------------------
// AUTH HOOK
// -----------------------------
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const unsubscribe = authService.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    return await authService.login({ email, password });
  }, []);

  const register = useCallback(async (userData: RegisterForm) => {
    return await authService.register(userData);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    return await authService.updateProfile(updates);
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    return await authService.changePassword(currentPassword, newPassword);
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };
}

// -----------------------------
// TASKS HOOK
// -----------------------------
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const apiTasks = await apiClient.getTasks();
      const transformedTasks = apiTasks.map((task: any) => ({
        id: task.id.toString(),
        userId: task.user_id.toString(),
        title: task.title,
        description: task.description,
        status: task.status?.toLowerCase().replace(' ', '_') || 'todo',
        priority: task.priority?.toLowerCase() || 'medium',
        categoryId: task.category_id?.toString(),
        dueDate: task.deadline ? new Date(task.deadline) : undefined,
        estimatedTime: task.estimated_time,
        actualTime: task.actual_time,
        progress: task.progress || 0,
        labels: task.labels || [],
        createdAt: new Date(task.created_at),
        updatedAt: new Date(task.updated_at),
        subtasks: [],
        attachments: [],
        reminders: []
      }));
      setTasks(transformedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const createTask = useCallback(async (taskData: any) => {
    if (!user) return;
    try {
      const apiTaskData = {
        title: taskData.title,
        description: taskData.description,
        status: 'To Do',
        priority: taskData.priority === 'urgent' ? 'High' : taskData.priority.charAt(0).toUpperCase() + taskData.priority.slice(1),
        category_id: taskData.categoryId || null,
        deadline: taskData.dueDate ? taskData.dueDate.toISOString().split('T')[0] : null
      };
      await apiClient.createTask(apiTaskData);
      await loadTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  }, [user, loadTasks]);

  const updateTask = useCallback(async (id: string, updates: any) => {
    try {
      await apiClient.updateTask(id, updates);
      await loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }, [loadTasks]);

  const deleteTask = useCallback(async (id: string) => {
    try {
      await apiClient.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }, []);

  return { tasks, loading, createTask, updateTask, deleteTask, refreshTasks: loadTasks };
}

// -----------------------------
// CATEGORIES HOOK
// -----------------------------
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadCategories = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const apiCategories = await apiClient.getCategories();
      const transformedCategories = apiCategories.map((category: any) => ({
        id: category.id.toString(),
        userId: category.user_id.toString(),
        name: category.name,
        description: category.description,
        color: category.color || 'blue',
        icon: category.icon,
        createdAt: new Date(category.created_at),
        updatedAt: new Date(category.updated_at),
        taskCount: 0
      }));
      setCategories(transformedCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const createCategory = useCallback(async (data: any) => {
    try {
      await apiClient.createCategory(data);
      await loadCategories();
    } catch (error) {
      console.error('Error creating category:', error);
    }
  }, [loadCategories]);

  const updateCategory = useCallback(async (id: string, data: any) => {
    try {
      await apiClient.updateCategory(id, data);
      await loadCategories();
    } catch (error) {
      console.error('Error updating category:', error);
    }
  }, [loadCategories]);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      await apiClient.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  }, []);

  return { categories, loading, createCategory, updateCategory, deleteCategory, refreshCategories: loadCategories };
}

// -----------------------------
// HABITS HOOK (Replaced storage)
// -----------------------------
export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadHabits = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userHabits = await apiClient.getHabits();
      setHabits(userHabits);
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  const createHabit = useCallback(async (habitData: any) => {
    try {
      await apiClient.createHabit(habitData);
      await loadHabits();
    } catch (error) {
      console.error('Error creating habit:', error);
    }
  }, [loadHabits]);

  const updateHabit = useCallback(async (id: string, updates: any) => {
    try {
      await apiClient.updateHabit(id, updates);
      await loadHabits();
    } catch (error) {
      console.error('Error updating habit:', error);
    }
  }, [loadHabits]);

  const deleteHabit = useCallback(async (id: string) => {
    try {
      await apiClient.deleteHabit(id);
      setHabits((prev) => prev.filter((h) => h.id !== id));
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  }, []);

  return { habits, loading, createHabit, updateHabit, deleteHabit, refreshHabits: loadHabits };
}

// -----------------------------
// POMODORO SESSIONS HOOK
// -----------------------------
export function usePomodoroSessions() {
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadSessions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userSessions = await apiClient.getPomodoroSessions();
      setSessions(userSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const createSession = useCallback(async (data: any) => {
    try {
      await apiClient.createPomodoroSession(data);
      await loadSessions();
    } catch (error) {
      console.error('Error creating session:', error);
    }
  }, [loadSessions]);

  const deleteSession = useCallback(async (id: string) => {
    try {
      await apiClient.deletePomodoroSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  }, []);

  return { sessions, loading, createSession, deleteSession, refreshSessions: loadSessions };
}

// -----------------------------
// NOTIFICATIONS HOOK
// -----------------------------
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userNotifications = await apiClient.getNotifications();
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await apiClient.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await apiClient.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, []);

  return { notifications, loading, markAsRead, deleteNotification, refreshNotifications: loadNotifications };
}

// -----------------------------
// HABIT ENTRIES HOOK
// -----------------------------
export function useHabitEntries(habitId?: string) {
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      setEntries([]);
    } catch (error) {
      console.error('Error loading habit entries:', error);
    } finally {
      setLoading(false);
    }
  }, [habitId]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const createEntry = useCallback(async (entryData: any) => {
    const newEntry: HabitEntry = {
      id: `entry-${Date.now()}`,
      ...entryData,
      createdAt: new Date()
    };
    try {
      setEntries(prev => [...prev, newEntry]);
      return newEntry;
    } catch (error) {
      console.error('Error creating habit entry:', error);
      return null;
    }
  }, []);

  const updateEntry = useCallback(async (id: string, updates: Partial<HabitEntry>) => {
    try {
      setEntries(prev => prev.map(entry => entry.id === id ? { ...entry, ...updates } : entry));
      return true;
    } catch (error) {
      console.error('Error updating habit entry:', error);
      return null;
    }
  }, []);

  return {
    entries,
    loading,
    createEntry,
    updateEntry,
    refreshEntries: loadEntries
  };
}
