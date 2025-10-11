import { apiClient } from "./api";
import { User, UserRole, LoginForm, RegisterForm } from "./types";
import storage from "./storage";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const isBrowser = typeof window !== 'undefined';

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private listeners: ((state: AuthState) => void)[] = [];

  private constructor() {
    if (isBrowser) {
      this.loadUserFromStorage();
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Load user from localStorage on initialization
  private async loadUserFromStorage(): Promise<void> {
    try {
      if (!isBrowser) return;
      const savedUser = window.localStorage.getItem('currentUser');
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      this.currentUser = null;
    }
  }

  // Save user to localStorage
  private saveUserToStorage(user: User | null): void {
    if (!isBrowser) return;
    if (user) {
      window.localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      window.localStorage.removeItem('currentUser');
    }
  }

  // Notify all listeners of state changes
  private notifyListeners(): void {
    const state: AuthState = {
      user: this.currentUser,
      isAuthenticated: !!this.currentUser,
      isLoading: false
    };
    this.listeners.forEach(listener => listener(state));
  }

  // Subscribe to auth state changes
  public subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    
    // Immediately call with current state
    listener({
      user: this.currentUser,
      isAuthenticated: !!this.currentUser,
      isLoading: false
    });

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Login user
  public async login(credentials: LoginForm): Promise<{ success: boolean; message?: string; user?: User }> {
    try {
      const { email, password } = credentials;
      
      const response = await apiClient.login(email, password);
      
      // Store token
      if (response.access_token) {
        localStorage.setItem('auth_token', response.access_token);
      }

      // Get user data
      const userData = await apiClient.getUser();
      
      const user: User = {
        id: userData.id.toString(),
        username: userData.name,
        email: userData.email,
        password: '', // Don't store password
        role: UserRole.END_USER,
        isActive: true,
        createdAt: new Date(userData.created_at),
        updatedAt: new Date(userData.updated_at),
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

      this.currentUser = user;
      this.saveUserToStorage(user);
      this.notifyListeners();

      return { success: true, user };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, message: error.message || 'An error occurred during login' };
    }
  }

  // Register new user
  public async register(userData: RegisterForm): Promise<{ success: boolean; message?: string; user?: User }> {
    try {
      const { username, email, password, confirmPassword } = userData;

      // Validate input
      if (password !== confirmPassword) {
        return { success: false, message: 'Passwords do not match' };
      }

      if (password.length < 8) {
        return { success: false, message: 'Password must be at least 8 characters long' };
      }

      if (username.length < 3) {
        return { success: false, message: 'Username must be at least 3 characters long' };
      }

      const response = await apiClient.register(username, email, password, confirmPassword);
      
      // Store token
      if (response.access_token) {
        localStorage.setItem('auth_token', response.access_token);
      }

      // Get user data
      const userResponse = await apiClient.getUser();
      
      const newUser: User = {
        id: userResponse.id.toString(),
        username: userResponse.name,
        email: userResponse.email,
        password: '',
        role: UserRole.END_USER,
        isActive: true,
        createdAt: new Date(userResponse.created_at),
        updatedAt: new Date(userResponse.updated_at),
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

      this.currentUser = newUser;
      this.saveUserToStorage(newUser);
      this.notifyListeners();

      return { success: true, user: newUser };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { success: false, message: error.message || 'An error occurred during registration' };
    }
  }

  // Logout user
  public async logout(): Promise<void> {
    try {
      await apiClient.logout();
    } catch (error) {
      // Even if logout fails, we clear the client-side session
      console.error("Logout error:", error);
    } finally {
      // Always clear local storage and update state
      if (isBrowser) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("currentUser");
      }
      this.currentUser = null;
      this.notifyListeners();
    }
  }

  // Get current user
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  // Check if user has specific role
  public hasRole(role: UserRole): boolean {
    return this.currentUser?.role === role;
  }

  // Check if user is admin
  public isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN);
  }

  // Check if user is task manager
  public isTaskManager(): boolean {
    return this.hasRole(UserRole.TASK_MANAGER);
  }

  // Update user profile
  public async updateProfile(updates: Partial<User>): Promise<{ success: boolean; message?: string; user?: User }> {
    try {
      if (!this.currentUser) {
        return { success: false, message: 'No user logged in' };
      }

      const updatedUser = await storage.updateUser(this.currentUser.id, updates);
      if (!updatedUser) {
        return { success: false, message: 'Failed to update user' };
      }

      this.currentUser = updatedUser;
      this.saveUserToStorage(updatedUser);
      this.notifyListeners();

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, message: 'An error occurred while updating profile' };
    }
  }

  // Change password
  public async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    try {
      if (!this.currentUser) {
        return { success: false, message: 'No user logged in' };
      }

      // Verify current password
      if (this.currentUser.password !== currentPassword) {
        return { success: false, message: 'Current password is incorrect' };
      }

      // Validate new password
      if (newPassword.length < 8) {
        return { success: false, message: 'New password must be at least 8 characters long' };
      }

      // Update password
      const updatedUser = await storage.updateUser(this.currentUser.id, { 
        password: newPassword,
        updatedAt: new Date()
      });

      if (!updatedUser) {
        return { success: false, message: 'Failed to update password' };
      }

      this.currentUser = updatedUser;
      this.saveUserToStorage(updatedUser);
      this.notifyListeners();

      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, message: 'An error occurred while changing password' };
    }
  }

  // Reset password (simplified version for demo)
  public async resetPassword(email: string): Promise<{ success: boolean; message?: string }> {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // In a real app, you would send an email with a reset link
      // For demo purposes, we'll just return success
      return { success: true, message: 'Password reset instructions sent to your email' };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, message: 'An error occurred while resetting password' };
    }
  }

  // Get user statistics
  public async getUserStats(): Promise<{
    tasks: { total: number; completed: number; overdue: number };
    habits: { total: number; active: number; streak: number };
    pomodoros: { today: number; thisWeek: number };
  }> {
    try {
      if (!this.currentUser) {
        throw new Error('No user logged in');
      }

      const tasks = await apiClient.getTasks();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return {
        tasks: {
          total: tasks.length,
          completed: tasks.filter((task: any) => task.status === 'Done').length,
          overdue: tasks.filter((task: any) => 
            task.due_date && 
            new Date(task.due_date) < today && 
            task.status !== 'Done'
          ).length
        },
        habits: {
          total: 0,
          active: 0,
          streak: 0
        },
        pomodoros: {
          today: 0,
          thisWeek: 0
        }
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        tasks: { total: 0, completed: 0, overdue: 0 },
        habits: { total: 0, active: 0, streak: 0 },
        pomodoros: { today: 0, thisWeek: 0 }
      };
    }
  }
}

export const authService = AuthService.getInstance();
export default authService;
