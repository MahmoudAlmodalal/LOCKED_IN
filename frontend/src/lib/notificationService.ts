import { storage } from './storage';
import { NotificationType } from './types';

interface Notification {
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

class NotificationService {
  private static instance: NotificationService;
  
  private constructor() {}
  
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Create a notification
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    actionUrl?: string,
    metadata?: Record<string, any>
  ): Promise<Notification> {
    const notification: Notification = {
      id: `notification-${Date.now()}`,
      userId,
      type,
      title,
      message,
      read: false,
      createdAt: new Date(),
      actionUrl,
      metadata
    };

    await storage.createNotification(notification);
    
    // Show browser notification if permission is granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        tag: notification.id
      });
    }

    return notification;
  }

  // Task-related notifications
  async notifyTaskDeadlineApproaching(userId: string, taskTitle: string, hoursUntilDeadline: number): Promise<void> {
    await this.createNotification(
      userId,
      NotificationType.DEADLINE_APPROACHING,
      'Task Deadline Approaching',
      `"${taskTitle}" is due in ${hoursUntilDeadline} hours`,
      '/dashboard/tasks'
    );
  }

  async notifyTaskOverdue(userId: string, taskTitle: string): Promise<void> {
    await this.createNotification(
      userId,
      NotificationType.DEADLINE_OVERDUE,
      'Task Overdue',
      `"${taskTitle}" is overdue`,
      '/dashboard/tasks'
    );
  }

  async notifyTaskReminder(userId: string, taskTitle: string, reminderMessage: string): Promise<void> {
    await this.createNotification(
      userId,
      NotificationType.TASK_REMINDER,
      'Task Reminder',
      `"${taskTitle}": ${reminderMessage}`,
      '/dashboard/tasks'
    );
  }

  // Habit-related notifications
  async notifyHabitReminder(userId: string, habitTitle: string): Promise<void> {
    await this.createNotification(
      userId,
      NotificationType.HABIT_REMINDER,
      'Habit Reminder',
      `Don't forget to complete "${habitTitle}" today`,
      '/dashboard/habits'
    );
  }

  async notifyHabitStreak(userId: string, habitTitle: string, streak: number): Promise<void> {
    await this.createNotification(
      userId,
      NotificationType.HABIT_REMINDER,
      'Habit Streak!',
      `"${habitTitle}" streak: ${streak} days! Keep it up!`,
      '/dashboard/habits'
    );
  }

  // Pomodoro-related notifications
  async notifyPomodoroComplete(userId: string, type: 'work' | 'break'): Promise<void> {
    const title = type === 'work' ? 'Work Session Complete!' : 'Break Time!';
    const message = type === 'work' 
      ? 'Great job! Time for a well-deserved break.' 
      : 'Break time is over. Ready to focus again?';
    
    await this.createNotification(
      userId,
      NotificationType.POMODORO_COMPLETE,
      title,
      message,
      '/dashboard/pomodoro'
    );
  }

  // System notifications
  async notifySystem(userId: string, title: string, message: string): Promise<void> {
    await this.createNotification(
      userId,
      NotificationType.SYSTEM,
      title,
      message
    );
  }

  // Check for overdue tasks and send notifications
  async checkOverdueTasks(userId: string): Promise<void> {
    const tasks = await storage.getTasks(userId);
    const now = new Date();
    
    for (const task of tasks) {
      if (task.dueDate && task.status !== 'completed') {
        const dueDate = new Date(task.dueDate);
        const timeDiff = dueDate.getTime() - now.getTime();
        const hoursUntilDeadline = Math.ceil(timeDiff / (1000 * 60 * 60));
        
        if (timeDiff < 0) {
          // Task is overdue
          await this.notifyTaskOverdue(userId, task.title);
        } else if (hoursUntilDeadline <= 24 && hoursUntilDeadline > 0) {
          // Task is due within 24 hours
          await this.notifyTaskDeadlineApproaching(userId, task.title, hoursUntilDeadline);
        }
      }
    }
  }

  // Check for habit reminders
  async checkHabitReminders(userId: string): Promise<void> {
    const habits = await storage.getHabits(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (const habit of habits) {
      if (habit.isActive && habit.frequency === 'daily') {
        const entries = await storage.getHabitEntries(habit.id);
        const todayEntry = entries.find(entry => {
          const entryDate = new Date(entry.date);
          entryDate.setHours(0, 0, 0, 0);
          return entryDate.getTime() === today.getTime() && entry.completed;
        });
        
        if (!todayEntry) {
          // Habit not completed today, send reminder
          await this.notifyHabitReminder(userId, habit.title);
        }
      }
    }
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return Notification.permission === 'granted';
    }
    return false;
  }

  // Schedule periodic checks
  startPeriodicChecks(userId: string): void {
    // Check every hour
    setInterval(async () => {
      await this.checkOverdueTasks(userId);
    }, 60 * 60 * 1000);

    // Check habit reminders every 6 hours
    setInterval(async () => {
      await this.checkHabitReminders(userId);
    }, 6 * 60 * 60 * 1000);
  }
}

export const notificationService = NotificationService.getInstance();
export default notificationService;
