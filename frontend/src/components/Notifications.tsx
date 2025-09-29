'use client';

import { useState, useEffect } from 'react';
import { useNotifications } from '@/lib/hooks';
import { 
  Bell, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Target,
  CheckSquare,
  Timer
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { NotificationType } from '@/lib/types';

interface NotificationsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Notifications({ isOpen, onClose }: NotificationsProps) {
  const { notifications, markAsRead, deleteNotification } = useNotifications();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.TASK_REMINDER:
        return <CheckSquare className="w-5 h-5 text-blue-600" />;
      case NotificationType.HABIT_REMINDER:
        return <Target className="w-5 h-5 text-green-600" />;
      case NotificationType.DEADLINE_APPROACHING:
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case NotificationType.DEADLINE_OVERDUE:
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case NotificationType.POMODORO_COMPLETE:
        return <Timer className="w-5 h-5 text-purple-600" />;
      case NotificationType.SYSTEM:
        return <Bell className="w-5 h-5 text-gray-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.TASK_REMINDER:
        return 'bg-blue-50 border-blue-200';
      case NotificationType.HABIT_REMINDER:
        return 'bg-green-50 border-green-200';
      case NotificationType.DEADLINE_APPROACHING:
        return 'bg-orange-50 border-orange-200';
      case NotificationType.DEADLINE_OVERDUE:
        return 'bg-red-50 border-red-200';
      case NotificationType.POMODORO_COMPLETE:
        return 'bg-purple-50 border-purple-200';
      case NotificationType.SYSTEM:
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    for (const notification of unreadNotifications) {
      await markAsRead(notification.id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-25" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <Bell className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-500">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="p-1 text-gray-400 hover:text-green-600"
                                title="Mark as read"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notification.id)}
                              className="p-1 text-gray-400 hover:text-red-600"
                              title="Delete"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
