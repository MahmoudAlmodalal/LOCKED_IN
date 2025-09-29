// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // In real app, this would be hashed
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  avatar?: string;
  preferences: UserPreferences;
}

export enum UserRole {
  END_USER = 'end_user',
  TASK_MANAGER = 'task_manager',
  ADMIN = 'admin'
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: NotificationSettings;
  pomodoroSettings: PomodoroSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  reminders: boolean;
  deadlines: boolean;
  habits: boolean;
}

export interface PomodoroSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  longBreakInterval: number; // after how many pomodoros
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
}

// Task Types
export interface Task {
  id: string;
  title: string;
  description?: string;
  categoryId?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  assignedBy?: string; // For tasks assigned by managers
  labels: string[];
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  progress: number; // 0-100
  subtasks: Subtask[];
  attachments: Attachment[];
  reminders: Reminder[];
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export interface Reminder {
  id: string;
  type: ReminderType;
  time: Date;
  message: string;
  isActive: boolean;
}

export enum ReminderType {
  EMAIL = 'email',
  PUSH = 'push',
  IN_APP = 'in_app'
}

// Category Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  taskCount: number;
}

// Habit Types
export interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency: HabitFrequency;
  target: number; // target per frequency period
  unit: string; // e.g., "minutes", "times", "pages"
  color: string;
  icon?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  streak: number;
  bestStreak: number;
  totalCompletions: number;
}

export enum HabitFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

export interface HabitEntry {
  id: string;
  habitId: string;
  date: Date;
  completed: boolean;
  value: number; // actual value achieved
  notes?: string;
  createdAt: Date;
}

// Calendar Types
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay: boolean;
  type: EventType;
  sourceId?: string; // ID of the source (task, habit, etc.)
  sourceType?: EventSourceType;
  color: string;
  userId: string;
  createdAt: Date;
}

export enum EventType {
  TASK_DEADLINE = 'task_deadline',
  HABIT_REMINDER = 'habit_reminder',
  CUSTOM_EVENT = 'custom_event',
  MEETING = 'meeting'
}

export enum EventSourceType {
  TASK = 'task',
  HABIT = 'habit',
  MANUAL = 'manual'
}

// Pomodoro Types
export interface PomodoroSession {
  id: string;
  userId: string;
  taskId?: string;
  type: PomodoroType;
  duration: number; // in minutes
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  notes?: string;
}

export enum PomodoroType {
  WORK = 'work',
  SHORT_BREAK = 'short_break',
  LONG_BREAK = 'long_break'
}

// Report Types
export interface ReportData {
  userId: string;
  period: ReportPeriod;
  startDate: Date;
  endDate: Date;
  tasks: TaskReportData;
  habits: HabitReportData;
  pomodoros: PomodoroReportData;
  productivity: ProductivityMetrics;
}

export interface TaskReportData {
  total: number;
  completed: number;
  overdue: number;
  byPriority: Record<TaskPriority, number>;
  byCategory: Record<string, number>;
  averageCompletionTime: number;
}

export interface HabitReportData {
  totalHabits: number;
  activeHabits: number;
  totalCompletions: number;
  averageStreak: number;
  bestStreak: number;
  completionRate: number;
}

export interface PomodoroReportData {
  totalSessions: number;
  totalWorkTime: number; // in minutes
  averageSessionLength: number;
  completedSessions: number;
  byTask: Record<string, number>;
}

export interface ProductivityMetrics {
  focusScore: number; // 0-100
  consistencyScore: number; // 0-100
  efficiencyScore: number; // 0-100
  overallScore: number; // 0-100
}

export enum ReportPeriod {
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  CUSTOM = 'custom'
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export enum NotificationType {
  TASK_REMINDER = 'task_reminder',
  HABIT_REMINDER = 'habit_reminder',
  DEADLINE_APPROACHING = 'deadline_approaching',
  DEADLINE_OVERDUE = 'deadline_overdue',
  POMODORO_COMPLETE = 'pomodoro_complete',
  SYSTEM = 'system'
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface TaskForm {
  title: string;
  description?: string;
  categoryId?: string;
  priority: TaskPriority;
  dueDate?: Date;
  estimatedTime?: number;
  labels: string[];
}

export interface CategoryForm {
  name: string;
  description?: string;
  color: string;
  icon?: string;
}

export interface HabitForm {
  title: string;
  description?: string;
  frequency: HabitFrequency;
  target: number;
  unit: string;
  color: string;
  icon?: string;
}

// Dashboard Types
export interface DashboardStats {
  tasks: {
    total: number;
    completed: number;
    overdue: number;
    dueToday: number;
  };
  habits: {
    total: number;
    completedToday: number;
    streak: number;
  };
  pomodoros: {
    today: number;
    thisWeek: number;
    totalTime: number;
  };
  productivity: {
    score: number;
    trend: 'up' | 'down' | 'stable';
  };
}

// Search Types
export interface SearchResult {
  type: 'task' | 'category' | 'habit' | 'event';
  id: string;
  title: string;
  description?: string;
  url: string;
  metadata?: Record<string, any>;
}

// Theme Types
export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}
