'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks';
import { 
  CheckSquare, 
  Calendar, 
  Target, 
  Clock, 
  BarChart3, 
  Users, 
  ArrowRight,
  Star
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <CheckSquare className="w-5 h-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">LOCKED IN</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Unlock Your
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Productivity</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The ultimate productivity suite that combines task management, habit tracking, 
              Pomodoro timer, and calendar integration to help you achieve your goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Stay Productive
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to help you manage tasks, build habits, 
              and maximize your productivity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Task Management */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                <CheckSquare className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Task Management</h3>
              <p className="text-gray-600 mb-6">
                Create, organize, and track tasks with categories, priorities, and deadlines. 
                Never miss an important task again.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-blue-600 mr-2" />
                  Priority-based organization
                </li>
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-blue-600 mr-2" />
                  Progress tracking
                </li>
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-blue-600 mr-2" />
                  Deadline reminders
                </li>
              </ul>
            </div>

            {/* Calendar Integration */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl border border-purple-200">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Calendar Integration</h3>
              <p className="text-gray-600 mb-6">
                Visualize your schedule with our integrated calendar. See deadlines, 
                events, and tasks in one unified view.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-purple-600 mr-2" />
                  FullCalendar integration
                </li>
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-purple-600 mr-2" />
                  Multiple view modes
                </li>
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-purple-600 mr-2" />
                  Event management
                </li>
              </ul>
            </div>

            {/* Habit Tracker */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl border border-green-200">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Habit Tracker</h3>
              <p className="text-gray-600 mb-6">
                Build positive routines and track your progress. Monitor streaks 
                and celebrate your achievements.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-green-600 mr-2" />
                  Streak tracking
                </li>
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-green-600 mr-2" />
                  Progress visualization
                </li>
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-green-600 mr-2" />
                  Daily reminders
                </li>
              </ul>
            </div>

            {/* Pomodoro Timer */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl border border-orange-200">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Pomodoro Timer</h3>
              <p className="text-gray-600 mb-6">
                Boost your focus with the Pomodoro technique. Work in focused intervals 
                with built-in break reminders.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-orange-600 mr-2" />
                  Customizable intervals
                </li>
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-orange-600 mr-2" />
                  Audio notifications
                </li>
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-orange-600 mr-2" />
                  Session tracking
                </li>
              </ul>
            </div>

            {/* Analytics */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 rounded-2xl border border-indigo-200">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Analytics & Reports</h3>
              <p className="text-gray-600 mb-6">
                Get insights into your productivity patterns. Generate PDF reports 
                and track your progress over time.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-indigo-600 mr-2" />
                  PDF report generation
                </li>
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-indigo-600 mr-2" />
                  Productivity metrics
                </li>
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-indigo-600 mr-2" />
                  Progress visualization
                </li>
              </ul>
            </div>

            {/* Team Collaboration */}
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-8 rounded-2xl border border-pink-200">
              <div className="w-12 h-12 bg-pink-600 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Team Collaboration</h3>
              <p className="text-gray-600 mb-6">
                Work together with your team. Assign tasks, track progress, 
                and collaborate effectively.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-pink-600 mr-2" />
                  Task assignment
                </li>
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-pink-600 mr-2" />
                  Role-based access
                </li>
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-pink-600 mr-2" />
                  Team analytics
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Productivity?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who have already unlocked their potential with LOCKED IN.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all duration-200 flex items-center justify-center"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <CheckSquare className="w-5 h-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold">LOCKED IN</span>
              </div>
              <p className="text-gray-400">
                The ultimate productivity suite for modern professionals.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Updates</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Status</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 LOCKED IN. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
