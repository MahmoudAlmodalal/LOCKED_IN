'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useTasks, useCategories, useHabits, usePomodoroSessions } from '@/lib/hooks';
import { 
  CheckSquare, 
  Calendar, 
  Target, 
  Clock, 
  BarChart3, 
  Plus,
  Bell,
  Settings,
  LogOut,
  User,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Timer,
  ArrowRight
} from 'lucide-react';
import { formatDate, getGreeting, calculateProgress } from '@/lib/utils';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { tasks, loading: tasksLoading } = useTasks();
  const { categories, loading: categoriesLoading } = useCategories();
  const { habits, loading: habitsLoading } = useHabits();
  const { sessions, loading: sessionsLoading } = usePomodoroSessions();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Calculate dashboard statistics
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const overdueTasks = tasks.filter(task => 
    task.dueDate && 
    new Date(task.dueDate) < new Date() && 
    task.status !== 'completed'
  ).length;
  const dueTodayTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    return dueDate.toDateString() === today.toDateString() && task.status !== 'completed';
  }).length;

  const activeHabits = habits.filter(habit => habit.isActive).length;
  const completedHabitsToday = habits.filter(habit => {
    // This would need to check habit entries for today
    return habit.isActive;
  }).length;

  const todaySessions = sessions.filter(session => {
    const today = new Date();
    const sessionDate = new Date(session.startTime);
    return sessionDate.toDateString() === today.toDateString();
  }).length;

  const totalWorkTime = sessions
    .filter(session => session.type === 'work' && session.completed)
    .reduce((total, session) => total + session.duration, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getGreeting()}, {user.username}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your productivity today.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Tasks Completed */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedTasks}</p>
                <p className="text-xs text-gray-500">of {tasks.length} total</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${calculateProgress(completedTasks, tasks.length)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Due Today */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Due Today</p>
                <p className="text-2xl font-bold text-gray-900">{dueTodayTasks}</p>
                <p className="text-xs text-gray-500">tasks to complete</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            {dueTodayTasks > 0 && (
              <div className="mt-4">
                <div className="flex items-center text-sm text-blue-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {dueTodayTasks} tasks need attention
                </div>
              </div>
            )}
          </div>

          {/* Overdue Tasks */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{overdueTasks}</p>
                <p className="text-xs text-gray-500">tasks past due</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            {overdueTasks > 0 && (
              <div className="mt-4">
                <div className="flex items-center text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {overdueTasks} tasks overdue
                </div>
              </div>
            )}
          </div>

          {/* Pomodoro Sessions */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pomodoro Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{todaySessions}</p>
                <p className="text-xs text-gray-500">completed today</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Timer className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-orange-600">
                <Clock className="w-4 h-4 mr-1" />
                {Math.round(totalWorkTime / 60)}h total focus time
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Tasks */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
                  <button className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Task
                  </button>
                </div>
              </div>
              <div className="p-6">
                {tasksLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No tasks yet</p>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Create your first task
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            task.status === 'completed' ? 'bg-green-500' : 
                            task.priority === 'urgent' ? 'bg-red-500' :
                            task.priority === 'high' ? 'bg-orange-500' :
                            task.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}></div>
                          <div>
                            <p className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {task.title}
                            </p>
                            {task.dueDate && (
                              <p className="text-sm text-gray-500">
                                Due: {formatDate(task.dueDate)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                    {tasks.length > 5 && (
                      <div className="text-center pt-4">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          View all {tasks.length} tasks
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Habits & Quick Actions */}
          <div className="space-y-6">
            {/* Habits */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Habits</h2>
                  <button className="flex items-center text-green-600 hover:text-green-700 text-sm font-medium">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Habit
                  </button>
                </div>
              </div>
              <div className="p-6">
                {habitsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                  </div>
                ) : habits.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No habits yet</p>
                    <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                      Create your first habit
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {habits.slice(0, 3).map((habit) => (
                      <div key={habit.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Target className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{habit.title}</p>
                            <p className="text-sm text-gray-500">{habit.streak} day streak</p>
                          </div>
                        </div>
                        <button className="w-6 h-6 border-2 border-gray-300 rounded hover:border-green-500 hover:bg-green-50 transition-colors">
                          <CheckCircle2 className="w-4 h-4 text-green-600 hidden" />
                        </button>
                      </div>
                    ))}
                    {habits.length > 3 && (
                      <div className="text-center pt-4">
                        <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                          View all {habits.length} habits
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Start Pomodoro</span>
                    </div>
                    <Clock className="w-4 h-4 text-blue-600" />
                  </button>
                  
                  <button className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <Target className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-900">Log Habit</span>
                    </div>
                    <Plus className="w-4 h-4 text-green-600" />
                  </button>
                  
                  <button className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-purple-900">View Calendar</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-purple-600" />
                  </button>
                  
                  <button className="w-full flex items-center justify-between p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="w-5 h-5 text-orange-600" />
                      <span className="font-medium text-orange-900">View Reports</span>
                    </div>
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
