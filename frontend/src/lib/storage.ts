import localforage from 'localforage';
const isBrowser = typeof window !== 'undefined';
import { 
  User, 
  Task, 
  Category, 
  Habit, 
  HabitEntry, 
  CalendarEvent, 
  PomodoroSession, 
  Notification,
  UserRole,
  TaskPriority,
  TaskStatus,
  HabitFrequency,
  EventType,
  PomodoroType,
  NotificationType
} from './types';

// Configure localforage only in browser
if (isBrowser) {
  localforage.config({
    name: 'LOCKED_IN',
    storeName: 'productivity_app',
    description: 'Local storage for LOCKED IN productivity application'
  });
}

class StorageService {
  private static instance: StorageService;
  private initialized: boolean = false;
  
  private constructor() {}
  
  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Initialize with default data if empty (browser only)
  private async initializeDefaultData(): Promise<void> {
    if (!isBrowser) return;
    if (this.initialized) return;
    // Mark initialized early to avoid recursive initialization via other methods
    this.initialized = true;

    const existingUsers = await localforage.getItem<User[]>('users');
    if (!existingUsers || existingUsers.length === 0) {
      const defaultUser: User = {
        id: 'user-1',
        username: 'demo_user',
        email: 'demo@lockedin.com',
        password: 'password123',
        role: UserRole.END_USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        preferences: {
          theme: 'light',
          language: 'en',
          timezone: 'UTC',
          notifications: {
            email: true,
            push: true,
            reminders: true,
            deadlines: true,
            habits: true
          },
          pomodoroSettings: {
            workDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            longBreakInterval: 4,
            autoStartBreaks: false,
            autoStartPomodoros: false,
            soundEnabled: true
          }
        }
      };

      const defaultCategories: Category[] = [
        {
          id: 'cat-1',
          name: 'Work',
          description: 'Work-related tasks',
          color: '#3B82F6',
          icon: 'briefcase',
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          taskCount: 0
        },
        {
          id: 'cat-2',
          name: 'Personal',
          description: 'Personal tasks and goals',
          color: '#10B981',
          icon: 'user',
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          taskCount: 0
        },
        {
          id: 'cat-3',
          name: 'Study',
          description: 'Educational and learning tasks',
          color: '#8B5CF6',
          icon: 'book',
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          taskCount: 0
        },
        {
          id: 'cat-4',
          name: 'Health',
          description: 'Health and fitness related tasks',
          color: '#F59E0B',
          icon: 'heart',
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          taskCount: 0
        }
      ];

      const defaultHabits: Habit[] = [
        {
          id: 'habit-1',
          title: 'Read for 30 minutes',
          description: 'Daily reading habit',
          frequency: HabitFrequency.DAILY,
          target: 30,
          unit: 'minutes',
          color: '#3B82F6',
          icon: 'book-open',
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          streak: 0,
          bestStreak: 0,
          totalCompletions: 0
        },
        {
          id: 'habit-2',
          title: 'Exercise',
          description: 'Daily exercise routine',
          frequency: HabitFrequency.DAILY,
          target: 1,
          unit: 'session',
          color: '#10B981',
          icon: 'activity',
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          streak: 0,
          bestStreak: 0,
          totalCompletions: 0
        },
        {
          id: 'habit-3',
          title: 'Meditation',
          description: 'Daily meditation practice',
          frequency: HabitFrequency.DAILY,
          target: 10,
          unit: 'minutes',
          color: '#8B5CF6',
          icon: 'brain',
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          streak: 0,
          bestStreak: 0,
          totalCompletions: 0
        }
      ];

      await localforage.setItem('users', [defaultUser]);
      await localforage.setItem('categories', defaultCategories);
      await localforage.setItem('habits', defaultHabits);
    }
  }

  private async createDefaultUser(): Promise<void> {
    const defaultUser: User = {
      id: 'user-1',
      username: 'demo_user',
      email: 'demo@lockedin.com',
      password: 'password123', // In real app, this would be hashed
      role: UserRole.END_USER,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      preferences: {
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        notifications: {
          email: true,
          push: true,
          reminders: true,
          deadlines: true,
          habits: true
        },
        pomodoroSettings: {
          workDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
          longBreakInterval: 4,
          autoStartBreaks: false,
          autoStartPomodoros: false,
          soundEnabled: true
        }
      }
    };
    
    await this.createUser(defaultUser);
  }

  private async createDefaultCategories(): Promise<void> {
    const defaultCategories: Category[] = [
      {
        id: 'cat-1',
        name: 'Work',
        description: 'Work-related tasks',
        color: '#3B82F6',
        icon: 'briefcase',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        taskCount: 0
      },
      {
        id: 'cat-2',
        name: 'Personal',
        description: 'Personal tasks and goals',
        color: '#10B981',
        icon: 'user',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        taskCount: 0
      },
      {
        id: 'cat-3',
        name: 'Study',
        description: 'Educational and learning tasks',
        color: '#8B5CF6',
        icon: 'book',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        taskCount: 0
      },
      {
        id: 'cat-4',
        name: 'Health',
        description: 'Health and fitness related tasks',
        color: '#F59E0B',
        icon: 'heart',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        taskCount: 0
      }
    ];

    for (const category of defaultCategories) {
      await this.createCategory(category);
    }
  }

  private async createDefaultHabits(): Promise<void> {
    const defaultHabits: Habit[] = [
      {
        id: 'habit-1',
        title: 'Read for 30 minutes',
        description: 'Daily reading habit',
        frequency: HabitFrequency.DAILY,
        target: 30,
        unit: 'minutes',
        color: '#3B82F6',
        icon: 'book-open',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        streak: 0,
        bestStreak: 0,
        totalCompletions: 0
      },
      {
        id: 'habit-2',
        title: 'Exercise',
        description: 'Daily exercise routine',
        frequency: HabitFrequency.DAILY,
        target: 1,
        unit: 'session',
        color: '#10B981',
        icon: 'activity',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        streak: 0,
        bestStreak: 0,
        totalCompletions: 0
      },
      {
        id: 'habit-3',
        title: 'Meditation',
        description: 'Daily meditation practice',
        frequency: HabitFrequency.DAILY,
        target: 10,
        unit: 'minutes',
        color: '#8B5CF6',
        icon: 'brain',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        streak: 0,
        bestStreak: 0,
        totalCompletions: 0
      }
    ];

    for (const habit of defaultHabits) {
      await this.createHabit(habit);
    }
  }

  // User Management
  async getUsers(): Promise<User[]> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    await this.initializeDefaultData();
    return await localforage.getItem<User[]>('users') || [];
  }

  async getUserById(id: string): Promise<User | null> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const users = await this.getUsers();
    return users.find(user => user.id === id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const users = await this.getUsers();
    return users.find(user => user.email === email) || null;
  }

  async createUser(user: User): Promise<User> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const users = await this.getUsers();
    users.push(user);
    await localforage.setItem('users', users);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const users = await this.getUsers();
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return null;
    
    users[index] = { ...users[index], ...updates, updatedAt: new Date() };
    await localforage.setItem('users', users);
    return users[index];
  }

  async deleteUser(id: string): Promise<boolean> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const users = await this.getUsers();
    const filteredUsers = users.filter(user => user.id !== id);
    await localforage.setItem('users', filteredUsers);
    return true;
  }

  // Task Management
  async getTasks(userId?: string): Promise<Task[]> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const tasks = await localforage.getItem<Task[]>('tasks') || [];
    if (userId) {
      return tasks.filter(task => task.userId === userId);
    }
    return tasks;
  }

  async getTaskById(id: string): Promise<Task | null> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const tasks = await this.getTasks();
    return tasks.find(task => task.id === id) || null;
  }

  async createTask(task: Task): Promise<Task> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const tasks = await this.getTasks();
    tasks.push(task);
    await localforage.setItem('tasks', tasks);
    
    // Update category task count
    if (task.categoryId) {
      await this.updateCategoryTaskCount(task.categoryId);
    }
    
    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const tasks = await this.getTasks();
    const index = tasks.findIndex(task => task.id === id);
    if (index === -1) return null;
    
    const oldCategoryId = tasks[index].categoryId;
    tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date() };
    await localforage.setItem('tasks', tasks);
    
    // Update category task counts if category changed
    if (oldCategoryId !== tasks[index].categoryId) {
      if (oldCategoryId) await this.updateCategoryTaskCount(oldCategoryId);
      if (tasks[index].categoryId) await this.updateCategoryTaskCount(tasks[index].categoryId!);
    }
    
    return tasks[index];
  }

  async deleteTask(id: string): Promise<boolean> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const tasks = await this.getTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) return false;
    
    const task = tasks[taskIndex];
    tasks.splice(taskIndex, 1);
    await localforage.setItem('tasks', tasks);
    
    // Update category task count
    if (task.categoryId) {
      await this.updateCategoryTaskCount(task.categoryId);
    }
    
    return true;
  }

  // Category Management
  async getCategories(userId?: string): Promise<Category[]> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const categories = await localforage.getItem<Category[]>('categories') || [];
    if (userId) {
      return categories.filter(category => category.userId === userId);
    }
    return categories;
  }

  async getCategoryById(id: string): Promise<Category | null> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const categories = await this.getCategories();
    return categories.find(category => category.id === id) || null;
  }

  async createCategory(category: Category): Promise<Category> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const categories = await this.getCategories();
    categories.push(category);
    await localforage.setItem('categories', categories);
    return category;
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const categories = await this.getCategories();
    const index = categories.findIndex(category => category.id === id);
    if (index === -1) return null;
    
    categories[index] = { ...categories[index], ...updates, updatedAt: new Date() };
    await localforage.setItem('categories', categories);
    return categories[index];
  }

  async deleteCategory(id: string): Promise<boolean> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const categories = await this.getCategories();
    const filteredCategories = categories.filter(category => category.id !== id);
    await localforage.setItem('categories', filteredCategories);
    
    // Update tasks that were using this category
    const tasks = await this.getTasks();
    const updatedTasks = tasks.map(task => 
      task.categoryId === id ? { ...task, categoryId: undefined, updatedAt: new Date() } : task
    );
    await localforage.setItem('tasks', updatedTasks);
    
    return true;
  }

  private async updateCategoryTaskCount(categoryId: string): Promise<void> {
    if (!isBrowser) return;
    const tasks = await this.getTasks();
    const taskCount = tasks.filter(task => task.categoryId === categoryId).length;
    
    const categories = await this.getCategories();
    const index = categories.findIndex(category => category.id === categoryId);
    if (index !== -1) {
      categories[index].taskCount = taskCount;
      await localforage.setItem('categories', categories);
    }
  }

  // Habit Management
  async getHabits(userId?: string): Promise<Habit[]> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const habits = await localforage.getItem<Habit[]>('habits') || [];
    if (userId) {
      return habits.filter(habit => habit.userId === userId);
    }
    return habits;
  }

  async getHabitById(id: string): Promise<Habit | null> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const habits = await this.getHabits();
    return habits.find(habit => habit.id === id) || null;
  }

  async createHabit(habit: Habit): Promise<Habit> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const habits = await this.getHabits();
    habits.push(habit);
    await localforage.setItem('habits', habits);
    return habit;
  }

  async updateHabit(id: string, updates: Partial<Habit>): Promise<Habit | null> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const habits = await this.getHabits();
    const index = habits.findIndex(habit => habit.id === id);
    if (index === -1) return null;
    
    habits[index] = { ...habits[index], ...updates, updatedAt: new Date() };
    await localforage.setItem('habits', habits);
    return habits[index];
  }

  async deleteHabit(id: string): Promise<boolean> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const habits = await this.getHabits();
    const filteredHabits = habits.filter(habit => habit.id !== id);
    await localforage.setItem('habits', filteredHabits);
    
    // Delete related habit entries
    const entries = await this.getHabitEntries();
    const filteredEntries = entries.filter(entry => entry.habitId !== id);
    await localforage.setItem('habitEntries', filteredEntries);
    
    return true;
  }

  // Habit Entry Management
  async getHabitEntries(habitId?: string): Promise<HabitEntry[]> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const entries = await localforage.getItem<HabitEntry[]>('habitEntries') || [];
    if (habitId) {
      return entries.filter(entry => entry.habitId === habitId);
    }
    return entries;
  }

  async createHabitEntry(entry: HabitEntry): Promise<HabitEntry> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const entries = await this.getHabitEntries();
    entries.push(entry);
    await localforage.setItem('habitEntries', entries);
    
    // Update habit statistics
    await this.updateHabitStats(entry.habitId);
    
    return entry;
  }

  async updateHabitEntry(id: string, updates: Partial<HabitEntry>): Promise<HabitEntry | null> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const entries = await this.getHabitEntries();
    const index = entries.findIndex(entry => entry.id === id);
    if (index === -1) return null;
    
    const oldEntry = entries[index];
    entries[index] = { ...entries[index], ...updates };
    await localforage.setItem('habitEntries', entries);
    
    // Update habit statistics
    await this.updateHabitStats(oldEntry.habitId);
    
    return entries[index];
  }

  private async updateHabitStats(habitId: string): Promise<void> {
    if (!isBrowser) return;
    const entries = await this.getHabitEntries(habitId);
    const habit = await this.getHabitById(habitId);
    if (!habit) return;
    
    const totalCompletions = entries.filter(entry => entry.completed).length;
    const currentStreak = this.calculateStreak(entries, habit.frequency);
    const bestStreak = Math.max(habit.bestStreak, currentStreak);
    
    await this.updateHabit(habitId, {
      totalCompletions,
      streak: currentStreak,
      bestStreak
    });
  }

  private calculateStreak(entries: HabitEntry[], frequency: HabitFrequency): number {
    if (entries.length === 0) return 0;
    
    const sortedEntries = entries
      .filter(entry => entry.completed)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    
    if (sortedEntries.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      entryDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - (i * this.getFrequencyDays(frequency)));
      
      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  private getFrequencyDays(frequency: HabitFrequency): number {
    switch (frequency) {
      case HabitFrequency.DAILY: return 1;
      case HabitFrequency.WEEKLY: return 7;
      case HabitFrequency.MONTHLY: return 30;
      default: return 1;
    }
  }

  // Calendar Event Management
  async getEvents(userId?: string): Promise<CalendarEvent[]> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const events = await localforage.getItem<CalendarEvent[]>('events') || [];
    if (userId) {
      return events.filter(event => event.userId === userId);
    }
    return events;
  }

  async createEvent(event: CalendarEvent): Promise<CalendarEvent> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const events = await this.getEvents();
    events.push(event);
    await localforage.setItem('events', events);
    return event;
  }

  async updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const events = await this.getEvents();
    const index = events.findIndex(event => event.id === id);
    if (index === -1) return null;
    
    events[index] = { ...events[index], ...updates };
    await localforage.setItem('events', events);
    return events[index];
  }

  async deleteEvent(id: string): Promise<boolean> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const events = await this.getEvents();
    const filteredEvents = events.filter(event => event.id !== id);
    await localforage.setItem('events', filteredEvents);
    return true;
  }

  // Pomodoro Session Management
  async getPomodoroSessions(userId?: string): Promise<PomodoroSession[]> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const sessions = await localforage.getItem<PomodoroSession[]>('pomodoroSessions') || [];
    if (userId) {
      return sessions.filter(session => session.userId === userId);
    }
    return sessions;
  }

  async createPomodoroSession(session: PomodoroSession): Promise<PomodoroSession> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const sessions = await this.getPomodoroSessions();
    sessions.push(session);
    await localforage.setItem('pomodoroSessions', sessions);
    return session;
  }

  async updatePomodoroSession(id: string, updates: Partial<PomodoroSession>): Promise<PomodoroSession | null> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const sessions = await this.getPomodoroSessions();
    const index = sessions.findIndex(session => session.id === id);
    if (index === -1) return null;
    
    sessions[index] = { ...sessions[index], ...updates };
    await localforage.setItem('pomodoroSessions', sessions);
    return sessions[index];
  }

  // Notification Management
  async getNotifications(userId?: string): Promise<Notification[]> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const notifications = await localforage.getItem<Notification[]>('notifications') || [];
    if (userId) {
      return notifications.filter(notification => notification.userId === userId);
    }
    return notifications;
  }

  async createNotification(notification: Notification): Promise<Notification> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const notifications = await this.getNotifications();
    notifications.push(notification);
    await localforage.setItem('notifications', notifications);
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const notifications = await this.getNotifications();
    const index = notifications.findIndex(notification => notification.id === id);
    if (index === -1) return false;
    
    notifications[index].read = true;
    await localforage.setItem('notifications', notifications);
    return true;
  }

  async deleteNotification(id: string): Promise<boolean> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const notifications = await this.getNotifications();
    const filteredNotifications = notifications.filter(notification => notification.id !== id);
    await localforage.setItem('notifications', filteredNotifications);
    return true;
  }

  // Utility Methods
  async clearAllData(): Promise<void> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    await localforage.clear();
  }

  async exportData(): Promise<string> {
    if (!isBrowser) throw new Error('Storage is only available in the browser environment');
    const data = {
      users: await this.getUsers(),
      tasks: await this.getTasks(),
      categories: await this.getCategories(),
      habits: await this.getHabits(),
      habitEntries: await this.getHabitEntries(),
      events: await this.getEvents(),
      pomodoroSessions: await this.getPomodoroSessions(),
      notifications: await this.getNotifications()
    };
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData: string): Promise<boolean> {
    try {
      if (!isBrowser) throw new Error('Storage is only available in the browser environment');
      const data = JSON.parse(jsonData);
      
      if (data.users) await localforage.setItem('users', data.users);
      if (data.tasks) await localforage.setItem('tasks', data.tasks);
      if (data.categories) await localforage.setItem('categories', data.categories);
      if (data.habits) await localforage.setItem('habits', data.habits);
      if (data.habitEntries) await localforage.setItem('habitEntries', data.habitEntries);
      if (data.events) await localforage.setItem('events', data.events);
      if (data.pomodoroSessions) await localforage.setItem('pomodoroSessions', data.pomodoroSessions);
      if (data.notifications) await localforage.setItem('notifications', data.notifications);
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

export const storage = StorageService.getInstance();
export default storage;
