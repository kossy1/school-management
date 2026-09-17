import React, { useState } from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { ParentDashboard } from './components/ParentDashboard';
import { AttendanceModule } from './components/AttendanceModule';
import { ResultsModule } from './components/ResultsModule';
import { FeesModule } from './components/FeesModule';
import { AssignmentsModule } from './components/AssignmentsModule';
import { CommunicationModule } from './components/CommunicationModule';
import { AdminOverview } from './components/AdminOverview';
import { CheckCircle2, ShieldCheck, HeartHandshake } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, toastMessage, currentRole } = useSchool();
  const [selectedInvoiceIdForPayment, setSelectedInvoiceIdForPayment] = useState<string | null>(null);

  const handleOpenFeePaymentModal = (invoiceId: string) => {
    setSelectedInvoiceIdForPayment(invoiceId);
    setActiveTab('fees');
  };

  const handleClearSelectedPayment = () => {
    setSelectedInvoiceIdForPayment(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold border border-slate-700">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header with Role and Child Switcher */}
      <Header />

      {/* Main Tab Navigation */}
      <Navigation />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <ParentDashboard onOpenFeePaymentModal={handleOpenFeePaymentModal} />
        )}
        {activeTab === 'attendance' && <AttendanceModule />}
        {activeTab === 'results' && <ResultsModule />}
        {activeTab === 'fees' && (
          <FeesModule
            selectedInvoiceIdForPayment={selectedInvoiceIdForPayment}
            onClearSelectedPayment={handleClearSelectedPayment}
          />
        )}
        {activeTab === 'assignments' && <AssignmentsModule />}
        {activeTab === 'communication' && <CommunicationModule />}
        {activeTab === 'admin' && <AdminOverview />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">Oakridge Academy</span>
            <span>•</span>
            <span>Academic Portal v3.4</span>
            <span>•</span>
            <span className="text-emerald-600 font-medium">All Systems Operational</span>
          </div>

          <div className="flex items-center space-x-4 text-slate-400">
            <span>Attendance</span>
            <span>•</span>
            <span>Gradebook</span>
            <span>•</span>
            <span>Tuition Invoicing</span>
            <span>•</span>
            <span>Parent Gateway</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <SchoolProvider>
      <AppContent />
    </SchoolProvider>
  );
}
