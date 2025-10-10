'use client';

import { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import { useTasks, useCalendarEvents } from '@/lib/hooks';
import { 
  Calendar, 
  Plus,
  Filter,
  List,
  Grid3X3,
  Clock,
  Target,
  CheckSquare
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { EventType, EventSourceType } from '@/lib/types';

export default function CalendarPage() {
  const { tasks } = useTasks();
  const { events, createEvent, updateEvent, deleteEvent } = useCalendarEvents();
  
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const calendarRef = useRef<FullCalendar>(null);

  // Convert tasks to calendar events
  const taskEvents = tasks
    .filter(task => task.dueDate)
    .map(task => ({
      id: `task-${task.id}`,
      title: task.title,
      start: new Date(task.dueDate!),
      end: new Date(task.dueDate!),
      allDay: true,
      color: getTaskColor(task.priority),
      extendedProps: {
        type: 'task',
        sourceId: task.id,
        sourceType: EventSourceType.TASK,
        description: task.description,
        priority: task.priority,
        status: task.status
      }
    }));

  // Combine all events
  const allEvents = [
    ...taskEvents,
    ...events.map(event => ({
      id: event.id,
      title: event.title,
      start: new Date(event.start),
      end: new Date(event.end),
      allDay: event.allDay,
      color: event.color,
      extendedProps: {
        type: 'custom',
        sourceId: event.sourceId,
        sourceType: event.sourceType,
        description: event.description
      }
    }))
  ];

  function getTaskColor(priority: string) {
    switch (priority) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F97316';
      case 'medium': return '#EAB308';
      case 'low': return '#22C55E';
      default: return '#6B7280';
    }
  }

  const handleDateSelect = (selectInfo: any) => {
    setSelectedDate(selectInfo.start);
    setShowCreateModal(true);
  };

  const handleEventClick = (clickInfo: any) => {
    setEditingEvent(clickInfo.event);
  };

  const handleCreateEvent = async (eventData: any) => {
    await createEvent({
      ...eventData,
      type: EventType.CUSTOM_EVENT,
    });
    setShowCreateModal(false);
    setSelectedDate(null);
  };

  const handleUpdateEvent = async (eventData: any) => {
    if (editingEvent) {
      await updateEvent(editingEvent.id, {
        title: eventData.title,
        description: eventData.description,
        start: eventData.start,
        end: eventData.end,
        allDay: eventData.allDay,
        color: eventData.color
      });
      setEditingEvent(null);
    }
  };

  const handleDeleteEvent = async () => {
    if (editingEvent) {
      await deleteEvent(editingEvent.id);
      setEditingEvent(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600 mt-1">View your schedule and manage events</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </button>
          </div>
        </div>
        

        {/* Calendar */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, bootstrap5Plugin]}
            initialView={currentView}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,listWeek'
            }}
            events={allEvents}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            height="auto"
            eventDisplay="block"
            eventTextColor="white"
            eventBorderColor="transparent"
            eventClassNames="rounded-lg shadow-sm"
            dayHeaderFormat={{ weekday: 'short' }}
            slotLabelFormat={{
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            }}
            eventTimeFormat={{
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            }}
            buttonText={{
              today: 'Today',
              month: 'Month',
              week: 'Week',
              list: 'List'
            }}
            nowIndicator={true}
            scrollTime="08:00:00"
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5],
              startTime: '09:00',
              endTime: '17:00'
            }}
          />
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          selectedDate={selectedDate}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedDate(null);
          }}
          onSubmit={handleCreateEvent}
        />
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSubmit={handleUpdateEvent}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
}

// Create Event Modal Component
function CreateEventModal({ selectedDate, onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    allDay: true,
    date: '',
    startTime: '',
    endTime: '',
    color: '#3B82F6'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const baseDate = selectedDate ? new Date(selectedDate) : (formData.date ? new Date(formData.date) : new Date());
    // Adjust for timezone offset when creating date from string
    const adjustedDate = formData.date ? new Date(baseDate.getTime() + baseDate.getTimezoneOffset() * 60000) : baseDate;

    const start = new Date(adjustedDate);
    const end = new Date(adjustedDate);
    
    if (!formData.allDay && formData.startTime && formData.endTime) {
      const [startHour, startMinute] = formData.startTime.split(':');
      const [endHour, endMinute] = formData.endTime.split(':');
      
      start.setHours(parseInt(startHour), parseInt(startMinute));
      end.setHours(parseInt(endHour), parseInt(endMinute));
    }
    
    onSubmit({
      ...formData,
      start,
      end
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Event</h2>
        
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.allDay}
                onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">All day event</span>
            </label>
          </div>

          {!formData.allDay && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <div className="flex space-x-2">
              {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'].map(color => (
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Event Modal Component
function EditEventModal({ event, onClose, onSubmit, onDelete }: any) {
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.extendedProps.description || '',
    allDay: event.allDay,
    startTime: event.start ? event.start.toTimeString().slice(0, 5) : '',
    endTime: event.end ? event.end.toTimeString().slice(0, 5) : '',
    color: event.color || '#3B82F6'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const start = new Date(event.start);
    const end = new Date(event.end);
    
    if (!formData.allDay && formData.startTime && formData.endTime) {
      const [startHour, startMinute] = formData.startTime.split(':');
      const [endHour, endMinute] = formData.endTime.split(':');
      
      start.setHours(parseInt(startHour), parseInt(startMinute));
      end.setHours(parseInt(endHour), parseInt(endMinute));
    }
    
    onSubmit({
      ...formData,
      start,
      end
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this event?')) {
      onDelete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Event</h2>
        
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

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.allDay}
                onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">All day event</span>
            </label>
          </div>

          {!formData.allDay && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <div className="flex space-x-2">
              {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'].map(color => (
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

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
            >
              Delete
            </button>
            <div className="flex space-x-3">
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
                Update Event
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
