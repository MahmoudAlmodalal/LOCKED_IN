'use client';

import { useState } from 'react';
import { useTasks, useCategories } from '@/lib/hooks';
import { 
  CheckSquare, 
  Plus,
  Search,
  Filter,
  Calendar,
  Tag,
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle2,
  Circle,
  AlertCircle
} from 'lucide-react';
import { formatDate, getPriorityColor, getStatusColor, getRelativeDate } from '@/lib/utils';
import { TaskPriority, TaskStatus } from '@/lib/types';

export default function TasksPage() {
  const { tasks, loading: tasksLoading, createTask, updateTask, deleteTask } = useTasks();
  const { categories, loading: categoriesLoading } = useCategories();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || task.categoryId === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  const handleCreateTask = async (taskData: any) => {
    await createTask(taskData);
    setShowCreateModal(false);
  };

  const handleUpdateTask = async (id: string, updates: any) => {
    await updateTask(id, updates);
    setEditingTask(null);
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(id);
    }
  };

  const handleToggleComplete = async (task: any) => {
    const newStatus: TaskStatus = task.status === 'completed' ? TaskStatus.TODO : TaskStatus.COMPLETED;
    await updateTask(task.id, { status: newStatus });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600 mt-1">Manage your tasks and stay organized</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </button>
        </div>
      </div>

      {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-lg border border-gray-200">
          {tasksLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedPriority !== 'all'
                  ? 'Try adjusting your filters to see more tasks.'
                  : 'Get started by creating your first task.'}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Task
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTasks.map((task) => {
                const category = categories.find(cat => cat.id === task.categoryId);
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
                
                return (
                  <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Checkbox */}
                        <button
                          onClick={() => handleToggleComplete(task)}
                          className="mt-1"
                        >
                          {task.status === 'completed' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400 hover:text-green-600" />
                          )}
                        </button>

                        {/* Task Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className={`text-lg font-medium ${
                              task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                            }`}>
                              {task.title}
                            </h3>
                            {isOverdue && (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          
                          {task.description && (
                            <p className="text-gray-600 mb-3">{task.description}</p>
                          )}

                          <div className="flex items-center space-x-4 text-sm">
                            {/* Priority */}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>

                            {/* Status */}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                              {task.status.replace('_', ' ')}
                            </span>

                            {/* Category */}
                            {category && (
                              <span className="flex items-center text-gray-500">
                                <Tag className="w-3 h-3 mr-1" />
                                {category.name}
                              </span>
                            )}

                            {/* Due Date */}
                            {task.dueDate && (
                              <span className={`flex items-center ${
                                isOverdue ? 'text-red-600' : 'text-gray-500'
                              }`}>
                                <Calendar className="w-3 h-3 mr-1" />
                                {getRelativeDate(task.dueDate)}
                              </span>
                            )}

                            {/* Estimated Time */}
                            {task.estimatedTime && (
                              <span className="flex items-center text-gray-500">
                                <Clock className="w-3 h-3 mr-1" />
                                {Math.round(task.estimatedTime / 60)}h
                              </span>
                            )}
                          </div>

                          {/* Progress Bar */}
                          {task.progress > 0 && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                                <span>Progress</span>
                                <span>{task.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${task.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="Edit task"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2 text-gray-400 hover:text-red-600"
                          title="Delete task"
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
        </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          categories={categories}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTask}
        />
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          categories={categories}
          onClose={() => setEditingTask(null)}
          onSubmit={(updates: any) => handleUpdateTask(editingTask.id, updates)}
        />
      )}
      </div>
  );
}

// Create Task Modal Component
function CreateTaskModal({ categories, onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    priority: 'medium' as TaskPriority,
    dueDate: '',
    estimatedTime: '',
    labels: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) * 60 : undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Task</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">No category</option>
                {categories.map((category: any) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Time (hours)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.estimatedTime}
                onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Task Modal Component
function EditTaskModal({ task, categories, onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    categoryId: task.categoryId || '',
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    estimatedTime: task.estimatedTime ? Math.round(task.estimatedTime / 60).toString() : '',
    progress: task.progress
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime as string) * 60 : undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Task</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">No category</option>
                {categories.map((category: any) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Update Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
