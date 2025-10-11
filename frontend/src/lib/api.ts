const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

class ApiClient {
  // -------------------------------
  // ✅ PRIVATE: Build request headers
  // -------------------------------
  private getHeaders(): HeadersInit {
    if (typeof window === "undefined") return {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    const token = localStorage.getItem("auth_token");
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // -------------------------------
  // ✅ GENERIC FETCH WRAPPER
  // -------------------------------
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      credentials: 'include',
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    // Handle unauthorized requests
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
      }
      throw new Error("Unauthorized: Please log in again.");
    }

    // Parse JSON safely
    let data: any = null;
    try {
      data = await response.json();
    } catch {
      data = { message: "Network error" };
    }

    // Handle errors
    if (!response.ok) {
      const message =
        data?.message ||
        (data?.errors
          ? Object.values(data.errors).flat().join(", ")
          : `HTTP ${response.status}`);
      throw new Error(message);
    }

    return data;
  }

  // -------------------------------
  // ✅ AUTH ENDPOINTS
  // -------------------------------
  async register(
    username: string,
    email: string,
    password: string,
    password_confirmation: string
  ) {
    return this.request("/register", {
      method: "POST",
      body: JSON.stringify({
        name: username,
        email,
        password,
        password_confirmation,
      }),
    });
  }

  async login(email: string, password: string) {
    const res = await this.request<any>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // Store token
    if (typeof window !== "undefined" && res.access_token) {
      localStorage.setItem("auth_token", res.access_token);
    }

    return res;
  }

  async logout() {
    try {
      const res = await this.request("/logout", { method: "POST" });
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
      }
      return res;
    } catch (error: any) {
      if (error.message.includes("Unauthorized")) {
        // If already unauthorized, just clear the token and resolve
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
        }
        return { message: "Logged out" };
      }
      // Re-throw other errors
      throw error;
    }
  }

  async getUser() {
    return this.request("/user");
  }

  // -------------------------------
  // ✅ HABITS ENDPOINTS
  // -------------------------------
  async getHabits() {
    return this.request("/habits");
  }

  async createHabit(habit: any) {
    return this.request("/habits", {
      method: "POST",
      body: JSON.stringify(habit),
    });
  }

  async updateHabit(id: string, habit: any) {
    return this.request(`/habits/${id}`, {
      method: "PUT",
      body: JSON.stringify(habit),
    });
  }

  async deleteHabit(id: string) {
    return this.request(`/habits/${id}`, { method: "DELETE" });
  }

  async getHabitEntries(habitId?: string) {
    return this.request(`/habit-entries${habitId ? `?habit_id=${habitId}` : ''}`);
  }

  async createHabitEntry(data: any) {
    return this.request("/habit-entries", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateHabitEntry(id: string, data: any) {
    return this.request(`/habit-entries/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteHabitEntry(id: string) {
    return this.request(`/habit-entries/${id}`, { method: "DELETE" });
  }

  // -------------------------------
  // ✅ POMODORO SESSIONS ENDPOINTS
  // -------------------------------
  async getPomodoroSessions() {
    return this.request("/pomodoro-sessions");
  }

  async createPomodoroSession(session: any) {
    return this.request("/pomodoro-sessions", {
      method: "POST",
      body: JSON.stringify(session),
    });
  }

  async deletePomodoroSession(id: string) {
    return this.request(`/pomodoro-sessions/${id}`, { method: "DELETE" });
  }

  // -------------------------------
  // ✅ NOTIFICATIONS ENDPOINTS
  // -------------------------------
  async getNotifications() {
    return this.request("/notifications");
  }

  async markNotificationAsRead(id: string) {
    return this.request(`/notifications/${id}/read`, { method: "POST" });
  }

  async deleteNotification(id: string) {
    return this.request(`/notifications/${id}`, { method: "DELETE" });
  }

  // -------------------------------
  // ✅ TASKS ENDPOINTS
  // -------------------------------
  async getTasks() {
    return this.request("/tasks");
  }

  async createTask(task: any) {
    return this.request("/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    });
  }

  async updateTask(id: string, task: any) {
    return this.request(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(task),
    });
  }

  async deleteTask(id: string) {
    return this.request(`/tasks/${id}`, { method: "DELETE" });
  }

  // -------------------------------
  // ✅ CALENDAR EVENTS ENDPOINTS
  // -------------------------------
  async getCalendarEvents() {
    return this.request("/calendar-events");
  }

  async createCalendarEvent(event: any) {
    return this.request("/calendar-events", {
      method: "POST",
      body: JSON.stringify(event),
    });
  }

  async updateCalendarEvent(id: string, event: any) {
    return this.request(`/calendar-events/${id}`, {
      method: "PUT",
      body: JSON.stringify(event),
    });
  }

  async deleteCalendarEvent(id: string) {
    return this.request(`/calendar-events/${id}`, { method: "DELETE" });
  }

  // -------------------------------
  // ✅ CATEGORIES ENDPOINTS
  // -------------------------------
  async getCategories() {
    return this.request("/categories");
  }

  async createCategory(category: any) {
    return this.request("/categories", {
      method: "POST",
      body: JSON.stringify(category),
    });
  }

  async updateCategory(id: string, category: any) {
    return this.request(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(category),
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/categories/${id}`, { method: "DELETE" });
  }
}

// Export a single instance for global use
export const apiClient = new ApiClient();
