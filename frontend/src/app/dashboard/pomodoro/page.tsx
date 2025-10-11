'use client';

import { useState, useEffect, useRef } from 'react';
import { usePomodoroSessions, useAuth } from '@/lib/hooks';
import { 
  Play, 
  Pause, 
  Square, 
  Settings,
  Clock,
  CheckCircle2,
  Target,
  Coffee,
  ArrowRight
} from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import { PomodoroType } from '@/lib/types';

export default function PomodoroPage() {
  const { sessions, createSession, refreshSessions } = usePomodoroSessions();
  const { user } = useAuth();
  
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [currentType, setCurrentType] = useState<PomodoroType>(PomodoroType.WORK);
  const [sessionCount, setSessionCount] = useState(0);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Pomodoro settings
  const [settings, setSettings] = useState({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 3, // After 3 work sessions, take a long break
    autoStartBreaks: false,
    autoStartPomodoros: false,
    soundEnabled: true
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    if (user?.id) {
      const savedSettings = localStorage.getItem(`pomodoro_settings_${user.id}`);
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings(parsed);
          // Update timer with saved work duration
          setTimeLeft(parsed.workDuration * 60);
        } catch (error) {
          console.error('Failed to load settings:', error);
        }
      }
    }
  }, [user?.id]);

  // Save settings to localStorage
  const saveSettings = (newSettings: typeof settings) => {
    if (user?.id) {
      localStorage.setItem(`pomodoro_settings_${user.id}`, JSON.stringify(newSettings));
      setSettings(newSettings);
    }
  };

  // Initialize audio
  useEffect(() => {
    // Only initialize audio if the file exists to avoid console errors
    // You can add a notification.mp3 file to the public folder later
    try {
      audioRef.current = new Audio('/notification.mp3');
      audioRef.current.volume = 0.5;
    } catch (error) {
      console.log('Audio notification not available');
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  // Handle timer completion
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      handleTimerComplete();
    }
  }, [timeLeft, isRunning]);

  const handleTimerComplete = async () => {
    setIsRunning(false);
    
    // Play notification sound
    if (settings.soundEnabled && audioRef.current) {
      audioRef.current.play().catch((error) => {
        // Silently fail if audio can't play (file doesn't exist or user hasn't interacted with page)
        console.log('Audio notification not available:', error.message);
      });
    }

    // Refresh sessions to update the counter
    await refreshSessions();
    
    // Mark session as complete in local state
    setCurrentSession(null);

    // Show completion notification
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Pomodoro Complete!', {
          body: currentType === PomodoroType.WORK 
            ? 'Time for a break!' 
            : 'Ready to get back to work?',
          icon: '/favicon.ico'
        });
      }
    }

    // Determine next phase
    if (currentType === PomodoroType.WORK) {
      const newCount = sessionCount + 1;
      setSessionCount(newCount);
      
      // After 3 work sessions, take a long break. Otherwise, short break.
      const nextType = newCount % 3 === 0 
        ? PomodoroType.LONG_BREAK 
        : PomodoroType.SHORT_BREAK;
      
      setCurrentType(nextType);
      setTimeLeft((nextType === PomodoroType.LONG_BREAK ? settings.longBreakDuration : settings.shortBreakDuration) * 60);
      
      if (settings.autoStartBreaks) {
        startTimer();
      }
    } else {
      // After any break (short or long), go back to work
      setCurrentType(PomodoroType.WORK);
      setTimeLeft(settings.workDuration * 60);
      
      if (settings.autoStartPomodoros) {
        startTimer();
      }
    }
  };

  const startTimer = async () => {
    if (!isRunning) {
      // Create new session if starting
      if (!currentSession) {
        try {
          // Convert to MySQL datetime format: YYYY-MM-DD HH:MM:SS
          const now = new Date();
          const mysqlDateTime = now.getFullYear() + '-' + 
            String(now.getMonth() + 1).padStart(2, '0') + '-' + 
            String(now.getDate()).padStart(2, '0') + ' ' + 
            String(now.getHours()).padStart(2, '0') + ':' + 
            String(now.getMinutes()).padStart(2, '0') + ':' + 
            String(now.getSeconds()).padStart(2, '0');
          
          const newSession = await createSession({
            type: currentType,
            duration: timeLeft,
            start_time: mysqlDateTime
          });
          setCurrentSession(newSession);
        } catch (error) {
          console.error('Failed to create session:', error);
          // Continue anyway - we can still track locally
        }
      }
      setIsRunning(true);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setCurrentSession(null);
    setTimeLeft(currentType === PomodoroType.WORK ? settings.workDuration * 60 : 
                currentType === PomodoroType.SHORT_BREAK ? settings.shortBreakDuration * 60 :
                settings.longBreakDuration * 60);
  };

  const skipPhase = () => {
    handleTimerComplete();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalTime = currentType === PomodoroType.WORK ? settings.workDuration * 60 :
                     currentType === PomodoroType.SHORT_BREAK ? settings.shortBreakDuration * 60 :
                     settings.longBreakDuration * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const getPhaseInfo = () => {
    switch (currentType) {
      case PomodoroType.WORK:
        return {
          title: 'Focus Time',
          description: 'Work on your tasks',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case PomodoroType.SHORT_BREAK:
        return {
          title: 'Short Break',
          description: 'Take a quick rest',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case PomodoroType.LONG_BREAK:
        return {
          title: 'Long Break',
          description: 'Take a longer rest',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
    }
  };

  const phaseInfo = getPhaseInfo();

  // Request notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pomodoro Timer</h1>
            <p className="text-gray-600 mt-1">Stay focused and productive</p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-gray-400 hover:text-gray-600"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Timer */}
          <div className="lg:col-span-2">
            <div className={`bg-white rounded-2xl border-2 ${phaseInfo.borderColor} p-8 text-center`}>
              {/* Phase Info */}
              <div className={`inline-flex items-center px-4 py-2 rounded-full ${phaseInfo.bgColor} mb-6`}>
                <Clock className={`w-5 h-5 mr-2 ${phaseInfo.color}`} />
                <span className={`font-medium ${phaseInfo.color}`}>{phaseInfo.title}</span>
              </div>

              {/* Timer Display */}
              <div className="mb-8">
                <div className="text-6xl font-mono font-bold text-gray-900 mb-2">
                  {formatTime(timeLeft)}
                </div>
                <p className="text-gray-600">{phaseInfo.description}</p>
              </div>

              {/* Progress Circle */}
              <div className="relative w-48 h-48 mx-auto mb-8">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                    className={phaseInfo.color.replace('text-', 'text-')}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round(getProgress())}%
                    </div>
                    <div className="text-sm text-gray-500">Complete</div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-4">
                {!isRunning ? (
                  <button
                    onClick={startTimer}
                    className="bg-green-600 text-white p-4 rounded-full hover:bg-green-700 transition-colors shadow-lg"
                  >
                    <Play className="w-6 h-6" />
                  </button>
                ) : (
                  <button
                    onClick={pauseTimer}
                    className="bg-yellow-600 text-white p-4 rounded-full hover:bg-yellow-700 transition-colors shadow-lg"
                  >
                    <Pause className="w-6 h-6" />
                  </button>
                )}
                
                <button
                  onClick={resetTimer}
                  className="bg-gray-600 text-white p-4 rounded-full hover:bg-gray-700 transition-colors shadow-lg"
                >
                  <Square className="w-6 h-6" />
                </button>
                
                <button
                  onClick={skipPhase}
                  className="bg-blue-600 text-white p-4 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                  title="Skip to next phase"
                >
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Session Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Sessions</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="text-gray-700">Work Sessions</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {sessions.filter(s => {
                      const startTime = (s as any).start_time || s.startTime;
                      return s.type === PomodoroType.WORK && 
                        new Date(startTime).toDateString() === new Date().toDateString();
                    }).length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Coffee className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">Short Breaks</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {sessions.filter(s => {
                      const startTime = (s as any).start_time || s.startTime;
                      return s.type === PomodoroType.SHORT_BREAK && 
                        new Date(startTime).toDateString() === new Date().toDateString();
                    }).length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-gray-700">Long Breaks</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {sessions.filter(s => {
                      const startTime = (s as any).start_time || s.startTime;
                      return s.type === PomodoroType.LONG_BREAK && 
                        new Date(startTime).toDateString() === new Date().toDateString();
                    }).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pomodoro Tips</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Eliminate distractions during work sessions</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Take breaks away from your workspace</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Use long breaks for meals or exercise</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Track your sessions to improve focus</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onClose={() => setShowSettings(false)}
          onSave={(newSettings: any) => {
            saveSettings(newSettings);
            setShowSettings(false);
            // Reset timer with new settings
            setTimeLeft(newSettings.workDuration * 60);
          }}
        />
      )}
      </div>
  );
}

// Settings Modal Component
function SettingsModal({ settings, onClose, onSave }: any) {
  const [formData, setFormData] = useState(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Pomodoro Settings</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Duration (min)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={formData.workDuration}
                onChange={(e) => setFormData({ ...formData, workDuration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Break (min)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={formData.shortBreakDuration}
                onChange={(e) => setFormData({ ...formData, shortBreakDuration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Long Break (min)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={formData.longBreakDuration}
                onChange={(e) => setFormData({ ...formData, longBreakDuration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Long Break Interval</label>
              <input
                type="number"
                min="2"
                max="10"
                value={formData.longBreakInterval}
                onChange={(e) => setFormData({ ...formData, longBreakInterval: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.autoStartBreaks}
                onChange={(e) => setFormData({ ...formData, autoStartBreaks: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Auto-start breaks</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.autoStartPomodoros}
                onChange={(e) => setFormData({ ...formData, autoStartPomodoros: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Auto-start work sessions</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.soundEnabled}
                onChange={(e) => setFormData({ ...formData, soundEnabled: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Enable notification sounds</span>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
