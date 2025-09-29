import { useState, useEffect, useCallback, useRef } from 'react';
import { authService, AuthState } from './auth';
import { storage } from './storage';
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
  TaskStatus,
  HabitFrequency,
  EventType,
  EventSourceType,
  PomodoroType,
  NotificationType
} from './types';

// Auth Hook
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
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
    changePassword
  };
}

// Tasks Hook
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadTasks = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userTasks = await storage.getTasks(user.id);
      setTasks(userTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const createTask = useCallback(async (taskData: {
    title: string;
    description?: string;
    categoryId?: string;
    priority: TaskPriority;
    dueDate?: Date;
    estimatedTime?: number;
    labels?: string[];
  }) => {
    if (!user) return null;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      ...taskData,
      status: TaskStatus.TODO,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: user.id,
      labels: taskData.labels || [],
      progress: 0,
      subtasks: [],
      attachments: [],
      reminders: []
    };

    try {
      const createdTask = await storage.createTask(newTask);
      setTasks(prev => [...prev, createdTask]);
      return createdTask;
    } catch (error) {
      console.error('Error creating task:', error);
      return null;
    }
  }, [user]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await storage.updateTask(id, updates);
      if (updatedTask) {
        setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
      }
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      return null;
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    try {
      const success = await storage.deleteTask(id);
      if (success) {
        setTasks(prev => prev.filter(task => task.id !== id));
      }
      return success;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }, []);

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    refreshTasks: loadTasks
  };
}

// Categories Hook
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadCategories = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userCategories = await storage.getCategories(user.id);
      setCategories(userCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const createCategory = useCallback(async (categoryData: {
    name: string;
    description?: string;
    color: string;
    icon?: string;
  }) => {
    if (!user) return null;

    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      ...categoryData,
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      taskCount: 0
    };

    try {
      const createdCategory = await storage.createCategory(newCategory);
      setCategories(prev => [...prev, createdCategory]);
      return createdCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      return null;
    }
  }, [user]);

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    try {
      const updatedCategory = await storage.updateCategory(id, updates);
      if (updatedCategory) {
        setCategories(prev => prev.map(cat => cat.id === id ? updatedCategory : cat));
      }
      return updatedCategory;
    } catch (error) {
      console.error('Error updating category:', error);
      return null;
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      const success = await storage.deleteCategory(id);
      if (success) {
        setCategories(prev => prev.filter(cat => cat.id !== id));
      }
      return success;
    } catch (error) {
      console.error('Error deleting category:', error);
      return false;
    }
  }, []);

  return {
    categories,
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
    refreshCategories: loadCategories
  };
}

// Habits Hook
export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadHabits = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userHabits = await storage.getHabits(user.id);
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

  const createHabit = useCallback(async (habitData: {
    title: string;
    description?: string;
    frequency: HabitFrequency;
    target: number;
    unit: string;
    color: string;
    icon?: string;
  }) => {
    if (!user) return null;

    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      ...habitData,
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      streak: 0,
      bestStreak: 0,
      totalCompletions: 0
    };

    try {
      const createdHabit = await storage.createHabit(newHabit);
      setHabits(prev => [...prev, createdHabit]);
      return createdHabit;
    } catch (error) {
      console.error('Error creating habit:', error);
      return null;
    }
  }, [user]);

  const updateHabit = useCallback(async (id: string, updates: Partial<Habit>) => {
    try {
      const updatedHabit = await storage.updateHabit(id, updates);
      if (updatedHabit) {
        setHabits(prev => prev.map(habit => habit.id === id ? updatedHabit : habit));
      }
      return updatedHabit;
    } catch (error) {
      console.error('Error updating habit:', error);
      return null;
    }
  }, []);

  const deleteHabit = useCallback(async (id: string) => {
    try {
      const success = await storage.deleteHabit(id);
      if (success) {
        setHabits(prev => prev.filter(habit => habit.id !== id));
      }
      return success;
    } catch (error) {
      console.error('Error deleting habit:', error);
      return false;
    }
  }, []);

  return {
    habits,
    loading,
    createHabit,
    updateHabit,
    deleteHabit,
    refreshHabits: loadHabits
  };
}

// Habit Entries Hook
export function useHabitEntries(habitId?: string) {
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const habitEntries = await storage.getHabitEntries(habitId);
      setEntries(habitEntries);
    } catch (error) {
      console.error('Error loading habit entries:', error);
    } finally {
      setLoading(false);
    }
  }, [habitId]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const createEntry = useCallback(async (entryData: {
    habitId: string;
    date: Date;
    completed: boolean;
    value: number;
    notes?: string;
  }) => {
    const newEntry: HabitEntry = {
      id: `entry-${Date.now()}`,
      ...entryData,
      createdAt: new Date()
    };

    try {
      const createdEntry = await storage.createHabitEntry(newEntry);
      setEntries(prev => [...prev, createdEntry]);
      return createdEntry;
    } catch (error) {
      console.error('Error creating habit entry:', error);
      return null;
    }
  }, []);

  const updateEntry = useCallback(async (id: string, updates: Partial<HabitEntry>) => {
    try {
      const updatedEntry = await storage.updateHabitEntry(id, updates);
      if (updatedEntry) {
        setEntries(prev => prev.map(entry => entry.id === id ? updatedEntry : entry));
      }
      return updatedEntry;
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

// Calendar Events Hook
export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadEvents = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userEvents = await storage.getEvents(user.id);
      setEvents(userEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const createEvent = useCallback(async (eventData: {
    title: string;
    description?: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    type: EventType;
    sourceId?: string;
    sourceType?: EventSourceType;
    color: string;
  }) => {
    if (!user) return null;

    const newEvent: CalendarEvent = {
      id: `event-${Date.now()}`,
      ...eventData,
      userId: user.id,
      createdAt: new Date(),
      allDay: eventData.allDay ?? false
    };

    try {
      const createdEvent = await storage.createEvent(newEvent);
      setEvents(prev => [...prev, createdEvent]);
      return createdEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      return null;
    }
  }, [user]);

  const updateEvent = useCallback(async (id: string, updates: Partial<CalendarEvent>) => {
    try {
      const updatedEvent = await storage.updateEvent(id, updates);
      if (updatedEvent) {
        setEvents(prev => prev.map(event => event.id === id ? updatedEvent : event));
      }
      return updatedEvent;
    } catch (error) {
      console.error('Error updating event:', error);
      return null;
    }
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    try {
      const success = await storage.deleteEvent(id);
      if (success) {
        setEvents(prev => prev.filter(event => event.id !== id));
      }
      return success;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  }, []);

  return {
    events,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    refreshEvents: loadEvents
  };
}

// Pomodoro Sessions Hook
export function usePomodoroSessions() {
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadSessions = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userSessions = await storage.getPomodoroSessions(user.id);
      setSessions(userSessions);
    } catch (error) {
      console.error('Error loading pomodoro sessions:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const createSession = useCallback(async (sessionData: {
    taskId?: string;
    type: PomodoroType;
    duration: number;
    startTime: Date;
    notes?: string;
  }) => {
    if (!user) return null;

    const newSession: PomodoroSession = {
      id: `session-${Date.now()}`,
      ...sessionData,
      userId: user.id,
      endTime: undefined,
      completed: false
    };

    try {
      const createdSession = await storage.createPomodoroSession(newSession);
      setSessions(prev => [...prev, createdSession]);
      return createdSession;
    } catch (error) {
      console.error('Error creating pomodoro session:', error);
      return null;
    }
  }, [user]);

  const updateSession = useCallback(async (id: string, updates: Partial<PomodoroSession>) => {
    try {
      const updatedSession = await storage.updatePomodoroSession(id, updates);
      if (updatedSession) {
        setSessions(prev => prev.map(session => session.id === id ? updatedSession : session));
      }
      return updatedSession;
    } catch (error) {
      console.error('Error updating pomodoro session:', error);
      return null;
    }
  }, []);

  return {
    sessions,
    loading,
    createSession,
    updateSession,
    refreshSessions: loadSessions
  };
}

// Notifications Hook
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userNotifications = await storage.getNotifications(user.id);
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

  const createNotification = useCallback(async (notificationData: {
    type: NotificationType;
    title: string;
    message: string;
    actionUrl?: string;
    metadata?: Record<string, any>;
  }) => {
    if (!user) return null;

    const newNotification: Notification = {
      id: `notification-${Date.now()}`,
      ...notificationData,
      userId: user.id,
      read: false,
      createdAt: new Date()
    };

    try {
      const createdNotification = await storage.createNotification(newNotification);
      setNotifications(prev => [createdNotification, ...prev]);
      return createdNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }, [user]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const success = await storage.markNotificationAsRead(id);
      if (success) {
        setNotifications(prev => prev.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        ));
      }
      return success;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      const success = await storage.deleteNotification(id);
      if (success) {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
      }
      return success;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }, []);

  return {
    notifications,
    loading,
    createNotification,
    markAsRead,
    deleteNotification,
    refreshNotifications: loadNotifications
  };
}

// Local Storage Hook
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}

// Debounced Value Hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Previous Value Hook
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
}

// Interval Hook
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

// Timeout Hook
export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setTimeout(() => savedCallback.current(), delay);
    return () => clearTimeout(id);
  }, [delay]);
}

export default {
  useAuth,
  useTasks,
  useCategories,
  useHabits,
  useHabitEntries,
  useCalendarEvents,
  usePomodoroSessions,
  useNotifications,
  useLocalStorage,
  useDebounce,
  usePrevious,
  useInterval,
  useTimeout
};
