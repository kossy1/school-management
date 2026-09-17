import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { FeeInvoice, FeeStatus } from '../types';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  FileText,
  DollarSign,
  ShieldCheck,
  Building,
  Check,
  X,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface FeesModuleProps {
  selectedInvoiceIdForPayment?: string | null;
  onClearSelectedPayment?: () => void;
}

export const FeesModule: React.FC<FeesModuleProps> = ({
  selectedInvoiceIdForPayment,
  onClearSelectedPayment,
}) => {
  const { currentStudent, fees, payFeeInvoice, currentRole, students, showToast } = useSchool();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(currentStudent.id);

  // Payment checkout modal state
  const [payingInvoice, setPayingInvoice] = useState<FeeInvoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'applepay'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState('Eleanor Vance');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('839');
  const [isProcessing, setIsProcessing] = useState(false);

  // View Receipt Modal state
  const [receiptInvoice, setReceiptInvoice] = useState<FeeInvoice | null>(null);

  // If passed from dashboard
  React.useEffect(() => {
    if (selectedInvoiceIdForPayment) {
      const inv = fees.find((f) => f.id === selectedInvoiceIdForPayment);
      if (inv && inv.status !== 'paid') {
        setPayingInvoice(inv);
      }
    }
  }, [selectedInvoiceIdForPayment, fees]);

  const activeStudent = students.find((s) => s.id === selectedStudentId) || currentStudent;
  const studentFees = fees.filter((f) => f.studentId === activeStudent.id);

  const filteredFees = studentFees.filter((f) => {
    if (statusFilter === 'all') return true;
    return f.status === statusFilter;
  });

  const totalBilled = studentFees.reduce((acc, f) => acc + f.amount, 0);
  const totalPaid = studentFees.filter((f) => f.status === 'paid').reduce((acc, f) => acc + f.amount, 0);
  const totalDue = studentFees.filter((f) => f.status !== 'paid').reduce((acc, f) => acc + f.amount, 0);
  const overdueCount = studentFees.filter((f) => f.status === 'overdue').length;

  const handleOpenPay = (inv: FeeInvoice) => {
    setPayingInvoice(inv);
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;

    setIsProcessing(true);
    setTimeout(() => {
      const methodLabel =
        paymentMethod === 'card'
          ? `Debit Card (${cardNumber.slice(-4)}) via Paystack`
          : paymentMethod === 'applepay'
          ? 'USSD / Mobile Bank App'
          : 'NIP Instant Bank Transfer (Zenith Bank)';

      const result = payFeeInvoice(payingInvoice.id, methodLabel);
      setIsProcessing(false);
      
      // Update local invoice reference to open receipt
      const updatedInv = {
        ...payingInvoice,
        status: 'paid' as FeeStatus,
        paidAt: new Date().toISOString().split('T')[0],
        paymentMethod: methodLabel,
        transactionId: result.transactionId,
      };

      setPayingInvoice(null);
      if (onClearSelectedPayment) onClearSelectedPayment();
      setReceiptInvoice(updatedInv);
    }, 1200);
  };

  const handlePrintReceipt = () => {
    window.print();
    showToast('Sent receipt to printer');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-indigo-600" />
            <span>School Fees, Tuition & Payment Gateway</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent fee schedules, payment receipts, and automated account reconciliation.
          </p>
        </div>

        {/* Student Switcher if Teacher or Admin */}
        {(currentRole === 'teacher' || currentRole === 'admin') && (
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 self-start sm:self-auto">
            <span className="text-xs text-slate-500 font-medium">Student:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-hidden"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.grade}-{st.section})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Invoiced</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">₦{totalBilled.toLocaleString('en-NG')}</div>
          <span className="text-xs text-slate-400">1st & 2nd Term Session 2025/2026</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Settled & Cleared</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">₦{totalPaid.toLocaleString('en-NG')}</div>
          <span className="text-xs text-emerald-700 font-medium flex items-center mt-0.5">
            <Check className="h-3.5 w-3.5 mr-1" />
            Official school receipts issued
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Outstanding Balance</span>
          <div className="text-2xl font-bold text-rose-600 mt-1">₦{totalDue.toLocaleString('en-NG')}</div>
          <span className="text-xs text-rose-700 font-medium flex items-center mt-0.5">
            {overdueCount > 0 ? (
              <>
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                {overdueCount} invoice overdue
              </>
            ) : (
              'All current term fees up to date'
            )}
          </span>
        </div>
      </div>

      {/* Invoices List Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Filter bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-1 sm:space-x-2">
            {(['all', 'pending', 'overdue', 'paid'] as const).map((st) => (
              <button
                key={st}
                id={`filter-fee-${st}`}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  statusFilter === st
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500">
            Showing {filteredFees.length} of {studentFees.length} invoices
          </span>
        </div>

        {/* Table of Invoices */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Term</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFees.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-700 whitespace-nowrap">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {inv.title}
                  </td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {inv.category}
                  </td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {inv.academicTerm}
                  </td>
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                    {inv.dueDate}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 text-sm whitespace-nowrap">
                    ₦{inv.amount.toLocaleString('en-NG')}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                        inv.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inv.status === 'overdue'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inv.status === 'paid' && <CheckCircle2 className="h-3 w-3 mr-0.5" />}
                      {inv.status === 'overdue' && <AlertTriangle className="h-3 w-3 mr-0.5" />}
                      {inv.status === 'pending' && <Clock className="h-3 w-3 mr-0.5" />}
                      <span>{inv.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    {inv.status !== 'paid' ? (
                      <button
                        id={`btn-pay-modal-${inv.id}`}
                        onClick={() => handleOpenPay(inv)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        <span>Pay Now</span>
                      </button>
                    ) : (
                      <button
                        id={`btn-view-receipt-${inv.id}`}
                        onClick={() => setReceiptInvoice(inv)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Receipt</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CHECKOUT MODAL */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Secure Fee Settlement</h3>
                  <p className="text-xs text-slate-500">256-Bit Encrypted School Gateway</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setPayingInvoice(null);
                  if (onClearSelectedPayment) onClearSelectedPayment();
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Bill Summary */}
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Invoice: {payingInvoice.invoiceNumber}</span>
                <span>{payingInvoice.academicTerm}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{payingInvoice.title}</h4>
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 mt-2">
                <span className="text-xs font-semibold text-slate-700">Total Payable:</span>
                <span className="text-2xl font-black text-emerald-800">₦{payingInvoice.amount.toLocaleString('en-NG')}</span>
              </div>
            </div>

            {/* Payment Method Switcher */}
            <form onSubmit={handleProcessPayment} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Select Payment Channel</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                      paymentMethod === 'card'
                        ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    Paystack / Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                      paymentMethod === 'bank'
                        ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    NIP Bank Transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('applepay')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                      paymentMethod === 'applepay'
                        ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    USSD / Remita
                  </button>
                </div>
              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cardholder Full Name</label>
                    <input
                      type="text"
                      required
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:border-emerald-500 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Debit / Credit Card Number (Verve, Mastercard, Visa)</label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full text-xs font-mono border border-slate-200 rounded-xl p-2.5 focus:border-emerald-500 outline-hidden"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Expiration (MM/YY)</label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full text-xs font-mono border border-slate-200 rounded-xl p-2.5 focus:border-emerald-500 outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">CVV (3 Digits)</label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full text-xs font-mono border border-slate-200 rounded-xl p-2.5 focus:border-emerald-500 outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'applepay' && (
                <div className="p-4 rounded-xl bg-slate-100 text-center space-y-2">
                  <p className="text-xs text-slate-600">Dial school USSD collection string on registered parent line:</p>
                  <div className="font-mono font-bold text-sm bg-white border border-slate-200 py-2 px-3 rounded-lg text-emerald-800">
                    *737*000*4190#{' '}
                    <span className="text-[11px] font-normal text-slate-500 block">or *966*000*4190# (Zenith / GTB)</span>
                  </div>
                </div>
              )}

              {paymentMethod === 'bank' && (
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-slate-700 space-y-1.5">
                  <p><span className="font-semibold text-slate-900">Bank Name:</span> Zenith Bank Plc</p>
                  <p><span className="font-semibold text-slate-900">Account Name:</span> Premier Crest College - Tuition Operations</p>
                  <p><span className="font-semibold text-slate-900">Account Number:</span> <span className="font-mono font-bold text-emerald-800 text-sm">1012948019</span></p>
                  <p><span className="font-semibold text-slate-900">Narration / Ref:</span> {activeStudent.rollNumber} / {payingInvoice.invoiceNumber}</p>
                  <p className="text-emerald-700 font-medium text-[11px] pt-1">Automated reconciliation via NIP within 60 seconds.</p>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setPayingInvoice(null);
                    if (onClearSelectedPayment) onClearSelectedPayment();
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="confirm-pay-btn"
                  disabled={isProcessing}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-colors disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing Settlement...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>Confirm & Pay ₦{payingInvoice.amount.toLocaleString('en-NG')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFICIAL PRINTABLE RECEIPT MODAL */}
      {receiptInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Official Bursary Receipt</h3>
                  <p className="text-xs text-slate-500">Transaction Confirmed • Approved for Audit</p>
                </div>
              </div>
              <button
                onClick={() => setReceiptInvoice(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="space-y-4 text-xs border border-slate-200 rounded-xl p-5 bg-slate-50/50">
              <div className="flex justify-between items-start pb-3 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">PREMIER CREST COLLEGE, LAGOS</h4>
                  <p className="text-[11px] text-slate-500">Office of the Bursar & Accounts</p>
                  <p className="text-[11px] text-slate-500">TIN / School Reg: RC-942819 / LGS-9041</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold rounded text-[10px] tracking-wider uppercase">
                    PAID IN FULL
                  </span>
                  <p className="text-[11px] font-mono text-slate-600 mt-1">{receiptInvoice.transactionId || 'TXN-9028192'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">Student Name</span>
                  <span className="font-bold text-slate-800">{activeStudent.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Reg No & Class</span>
                  <span className="font-bold text-slate-800">{activeStudent.rollNumber} ({activeStudent.grade})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Payment Date</span>
                  <span className="font-semibold text-slate-800">{receiptInvoice.paidAt || '2026-03-17'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Payment Method</span>
                  <span className="font-semibold text-slate-800">{receiptInvoice.paymentMethod || 'Paystack / NIP Transfer'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <div className="flex justify-between font-semibold text-slate-800 pb-1">
                  <span>{receiptInvoice.title}</span>
                  <span>₦{receiptInvoice.amount.toLocaleString('en-NG')}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Category</span>
                  <span>{receiptInvoice.category}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Academic Term</span>
                  <span>{receiptInvoice.academicTerm}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-slate-900 pt-2 border-t border-slate-200 mt-2">
                  <span>Amount Paid</span>
                  <span className="text-emerald-700">₦{receiptInvoice.amount.toLocaleString('en-NG')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">Computer generated invoice receipt</span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 shadow-xs"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptInvoice(null)}
                  className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
