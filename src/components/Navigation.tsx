import React from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  LayoutDashboard,
  CalendarCheck,
  Award,
  CreditCard,
  BookOpen,
  MessageSquare,
  BarChart3,
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, currentRole, threads, fees } = useSchool();

  const overdueFeeCount = fees.filter((f) => f.status === 'overdue' || f.status === 'pending').length;
  const unreadMsgCount = threads.reduce((acc, t) => acc + (t.unreadCount || 0), 0);

  const navItems = [
    {
      id: 'dashboard',
      label: currentRole === 'parent' ? 'Parent Dashboard' : 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: CalendarCheck,
    },
    {
      id: 'results',
      label: 'Results & Grades',
      icon: Award,
    },
    {
      id: 'fees',
      label: 'Fee Invoices',
      icon: CreditCard,
      badge: currentRole === 'parent' && overdueFeeCount > 0 ? `${overdueFeeCount}` : undefined,
      badgeColor: 'bg-amber-100 text-amber-700',
    },
    {
      id: 'assignments',
      label: 'Assignments',
      icon: BookOpen,
    },
    {
      id: 'communication',
      label: 'Communication',
      icon: MessageSquare,
      badge: unreadMsgCount > 0 ? `${unreadMsgCount}` : undefined,
      badgeColor: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'admin',
      label: 'School Analytics',
      icon: BarChart3,
    },
  ];

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                      isActive ? 'bg-indigo-700 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
