'use client';

import { useState } from 'react';
import { useHabits, useHabitEntries } from '@/lib/hooks';
import { 
  Target, 
  Plus,
  Calendar,
  TrendingUp,
  Award,
  CheckCircle2,
  Circle,
  Edit,
  Trash2,
  BarChart3,
  Flame,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatDate, getRelativeDate } from '@/lib/utils';
import { HabitFrequency } from '@/lib/types';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { format } from 'date-fns';

export default function HabitsPage() {
  const { habits, loading: habitsLoading, createHabit, updateHabit, deleteHabit } = useHabits();
  const { entries, createEntry, updateEntry } = useHabitEntries();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [togglingHabitId, setTogglingHabitId] = useState<string | null>(null);

  const handleCreateHabit = async (habitData: any) => {
    await createHabit(habitData);
    setShowCreateModal(false);
  };

  const handleUpdateHabit = async (id: string, updates: any) => {
    await updateHabit(id, updates);
    setEditingHabit(null);
  };

  const handleDeleteHabit = async (id: string) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      await deleteHabit(id);
    }
  };

  const handleToggleHabit = async (habit: any) => {
    if (togglingHabitId) return; // Prevent multiple simultaneous toggles
    
    setTogglingHabitId(habit.id);
    
    try {
      const targetDate = new Date(selectedDate);
      targetDate.setHours(0, 0, 0, 0);
      
      const entryForSelectedDate = entries.find(entry => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return String(entry.habitId) === String(habit.id) && 
               entryDate.toDateString() === targetDate.toDateString();
      });

      if (entryForSelectedDate) {
        // Toggle existing entry
        const newCompletedState = !entryForSelectedDate.completed;
        await updateEntry(entryForSelectedDate.id, { 
          completed: newCompletedState,
          value: newCompletedState ? habit.target : 0
        });
      } else {
        // Create new entry
        await createEntry({
          habitId: habit.id,
          date: targetDate,
          completed: true,
          value: habit.target
        });
      }
    } catch (error) {
      console.error('Error toggling habit:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to update habit: ${errorMessage}`);
    } finally {
      setTogglingHabitId(null);
    }
  };

  const getHabitProgress = (habit: any) => {
    const habitEntries = entries.filter(entry => String(entry.habitId) === String(habit.id));
    const completedEntries = habitEntries.filter(entry => entry.completed);
    
    if (habit.frequency === 'daily') {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        return date;
      });
      
      const completedInLast7Days = last7Days.filter(date => 
        habitEntries.some(entry => 
          new Date(entry.date).toDateString() === date.toDateString() && entry.completed
        )
      ).length;
      
      return Math.round((completedInLast7Days / 7) * 100);
    } else if (habit.frequency === 'weekly') {
      const last4Weeks = Array.from({ length: 4 }, (_, i) => {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + (i * 7)));
        weekStart.setHours(0, 0, 0, 0);
        return weekStart;
      });
      
      const completedWeeks = last4Weeks.filter(weekStart => {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        return habitEntries.some(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= weekStart && entryDate <= weekEnd && entry.completed;
        });
      }).length;
      
      return Math.round((completedWeeks / 4) * 100);
    }
    
    return 0;
  };

  const getEntryForSelectedDate = (habit: any) => {
    const targetDate = new Date(selectedDate);
    targetDate.setHours(0, 0, 0, 0);
    
    return entries.find(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return String(entry.habitId) === String(habit.id) && 
             entryDate.toDateString() === targetDate.toDateString();
    });
  };

  // Calculate current streak (consecutive days from today/yesterday going backwards)
  const getCurrentStreak = (habit: any) => {
    const habitEntries = entries
      .filter(entry => String(entry.habitId) === String(habit.id) && entry.completed)
      .map(entry => {
        const date = new Date(entry.date);
        date.setHours(0, 0, 0, 0);
        return date;
      })
      .sort((a, b) => b.getTime() - a.getTime()); // Sort descending (newest first)
    
    if (habitEntries.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if the most recent entry is today or yesterday
    const mostRecentEntry = habitEntries[0];
    const daysDiff = Math.floor((today.getTime() - mostRecentEntry.getTime()) / (1000 * 60 * 60 * 24));
    
    // If the last completion was more than 1 day ago, streak is broken
    if (daysDiff > 1) return 0;
    
    // Count consecutive days
    let streak = 1;
    for (let i = 1; i < habitEntries.length; i++) {
      const currentDate = habitEntries[i];
      const previousDate = habitEntries[i - 1];
      
      const diffDays = Math.floor((previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
      } else {
        break; // Streak is broken
      }
    }
    
    return streak;
  };

  // Calculate the longest streak ever (best streak)
  const getBestStreak = (habit: any) => {
    const habitEntries = entries
      .filter(entry => String(entry.habitId) === String(habit.id) && entry.completed)
      .map(entry => {
        const date = new Date(entry.date);
        date.setHours(0, 0, 0, 0);
        return date;
      })
      .sort((a, b) => a.getTime() - b.getTime()); // Sort ascending (oldest first)
    
    if (habitEntries.length === 0) return 0;
    
    let maxStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < habitEntries.length; i++) {
      const currentDate = habitEntries[i];
      const previousDate = habitEntries[i - 1];
      
      const diffDays = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1; // Reset streak
      }
    }
    
    return maxStreak;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Habit Tracker</h1>
            <p className="text-gray-600 mt-1">Build positive routines and track your progress</p>
          </div>
          <div className="flex items-center space-x-3">

            
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Habit
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Habits</p>
              <p className="text-2xl font-bold text-gray-900">{habits.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Habits</p>
              <p className="text-2xl font-bold text-gray-900">
                {habits.filter(habit => habit.isActive).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Best Streak</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.max(...habits.map(habit => getBestStreak(habit)), 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed on {format(selectedDate, 'MMM d')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {habits.filter(habit => {
                  const entry = getEntryForSelectedDate(habit);
                  return entry && entry.completed;
                }).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Date Navigator */}
      <div className="flex items-center justify-center space-x-4 my-8">
        <button
          onClick={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() - 1);
            setSelectedDate(newDate);
          }}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <span className="text-lg font-semibold text-gray-800">
          {format(selectedDate, 'MMMM d, yyyy')}
        </span>
        <button
          onClick={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() + 1);
            setSelectedDate(newDate);
          }}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Habits List */}
      {habitsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : habits.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No habits yet</h3>
          <p className="text-gray-500 mb-6">Start building positive routines by creating your first habit.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Create Habit
          </button>
        </div>
      ) : (
        <div className="space-y-4">
            {habits.map((habit) => {
              const entryForSelectedDate = getEntryForSelectedDate(habit);
              const isCompleted = entryForSelectedDate && entryForSelectedDate.completed;
              const currentStreak = getCurrentStreak(habit);
              const bestStreak = getBestStreak(habit);
              
              return (
                <div key={habit.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${habit.color}20` }}
                    >
                      <Target className="w-5 h-5" style={{ color: habit.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{habit.title}</h3>
                      <p className="text-sm text-gray-500">{habit.frequency}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span>{currentStreak} day streak</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span>Best: {bestStreak}</span>
                    </div>

                    <button
                      onClick={() => handleToggleHabit(habit)}
                      disabled={togglingHabitId === habit.id}
                      className={`w-40 flex items-center justify-center space-x-2 py-2 rounded-lg font-medium transition-colors ${
                        togglingHabitId === habit.id
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : isCompleted
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {togglingHabitId === habit.id ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                          <span>Updating...</span>
                        </>
                      ) : isCompleted ? (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          <span>Completed</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-5 h-5" />
                          <span>Mark Complete</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setEditingHabit(habit)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                        title="Edit habit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteHabit(habit.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
                        title="Delete habit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      {/* Create Habit Modal */}
      {showCreateModal && (
        <CreateHabitModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateHabit}
        />
      )}

      {/* Edit Habit Modal */}
      {editingHabit && (
        <EditHabitModal
          habit={editingHabit}
          onClose={() => setEditingHabit(null)}
          onSubmit={(updates: any) => handleUpdateHabit(editingHabit.id, updates)}
        />
      )}
      </div>
  );
}

// Create Habit Modal Component
function CreateHabitModal({ onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: 'daily' as HabitFrequency,
    target: 1,
    unit: 'times',
    color: '#10B981'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Habit</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="e.g., Read for 30 minutes"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Optional description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as HabitFrequency })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
              <input
                type="number"
                min="1"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="e.g., minutes, pages, glasses"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <div className="flex space-x-2">
              {['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#6B7280'].map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color ? 'border-gray-900' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Create Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Habit Modal Component
function EditHabitModal({ habit, onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    title: habit.title,
    description: habit.description || '',
    frequency: habit.frequency,
    target: habit.target,
    unit: habit.unit,
    color: habit.color,
    isActive: habit.isActive
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Habit</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as HabitFrequency })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
              <input
                type="number"
                min="1"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <div className="flex space-x-2">
              {['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#6B7280'].map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color ? 'border-gray-900' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700">Active habit</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Update Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
