/**
 * صفحة جلسات الصندوق
 * Cash Register Sessions Management
 * 
 * المميزات:
 * ✅ فتح جلسة صندوق جديدة
 * ✅ عرض الجلسة النشطة
 * ✅ إغلاق الجلسة مع حسابات
 * ✅ تقرير يومي (مبيعات، مصاريف، تحصيل)
 * ✅ الفرق بين الكمية المتوقعة والفعلية
 * ✅ سجل الجلسات السابقة
 */

import { useState, useMemo } from 'react';
import Header from '../components/Header';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { notify, messages } from '../utils/toast';
import {
  Plus,
  X,
  Clock,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Check,
  AlertCircle,
} from 'lucide-react';
import type { CashSession, CashSessionStatus } from '../types/small-shop.types';

// Mock data - in real app, would come from database
const mockSessions: CashSession[] = [
  {
    id: 'session-1',
    session_number: 'SESSION-001',
    date: '2026-03-24',
    user_id: 'user-cashier-001',
    user_name: 'أحمد علي',
    opened_at: '09:00:00',
    opening_balance: 5000,
    closed_at: '18:00:00',
    closing_balance: 8500,
    total_sales_cash: 3200,
    total_sales_credit: 1500,
    total_returns: 200,
    total_expenses: 100,
    total_collections: 500,
    total_supplier_payments: 400,
    expected_balance: 9200,
    actual_balance: 8500,
    difference: -700,
    status: 'closed',
    notes: 'جلسة عادية',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function CashSessionPage() {
  const [sessions, setSessions] = useState<CashSession[]>(mockSessions);
  const [activeSession, setActiveSession] = useState<CashSession | null>(null);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  
  const [openingData, setOpeningData] = useState({
    opening_balance: 0,
    notes: '',
  });
  
  const [closingData, setClosingData] = useState({
    actual_balance: 0,
    notes: '',
  });
  
  // Get today's date
  const today = new Date().toISOString().split('T')[0];
  
  // Check if there's already an active session today
  const todayActive = useMemo(() => {
    return sessions.find(s => s.date === today && s.status === 'open');
  }, [sessions, today]);
  
  // Get today's statistics from mock invoices/expenses
  const getTodayStats = () => ({
    cash_sales: 3200,
    credit_sales: 1500,
    returns: 200,
    expenses: 100,
    collections: 500,
    supplier_payments: 400,
  });
  
  const stats = getTodayStats();
  
  const handleOpenSession = () => {
    if (openingData.opening_balance < 0) {
      notify.error('المبلغ الابتدائي يجب أن يكون موجب');
      return;
    }
    
    const newSession: CashSession = {
      id: `session-${Date.now()}`,
      session_number: `SESSION-${(sessions.length + 1).toString().padStart(3, '0')}`,
      date: today,
      user_id: 'user-cashier-001', // Should come from logged in user
      user_name: 'أحمد علي',
      opened_at: new Date().toLocaleTimeString('en-US', { hour12: false }),
      opening_balance: openingData.opening_balance,
      total_sales_cash: 0,
      total_sales_credit: 0,
      total_returns: 0,
      total_expenses: 0,
      total_collections: 0,
      total_supplier_payments: 0,
      expected_balance: openingData.opening_balance,
      status: 'open' as CashSessionStatus,
      notes: openingData.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    setSessions([...sessions, newSession]);
    setActiveSession(newSession);
    setShowOpenDialog(false);
    setOpeningData({ opening_balance: 0, notes: '' });
  };
  
  const handleCloseSession = () => {
    if (!activeSession) return;
    
    if (closingData.actual_balance < 0) {
      notify.error('المبلغ الختامي يجب أن يكون موجب');
      return;
    }
    
    // Calculate expected balance
    const expected =
      activeSession.opening_balance +
      stats.cash_sales +
      stats.collections -
      stats.expenses -
      stats.supplier_payments -
      stats.returns;
    
    const difference = closingData.actual_balance - expected;
    
    const updatedSession: CashSession = {
      ...activeSession,
      closed_at: new Date().toLocaleTimeString('en-US', { hour12: false }),
      closing_balance: closingData.actual_balance,
      total_sales_cash: stats.cash_sales,
      total_sales_credit: stats.credit_sales,
      total_returns: stats.returns,
      total_expenses: stats.expenses,
      total_collections: stats.collections,
      total_supplier_payments: stats.supplier_payments,
      expected_balance: expected,
      actual_balance: closingData.actual_balance,
      difference: difference,
      status: 'closed' as CashSessionStatus,
      notes: closingData.notes,
      updated_at: new Date().toISOString(),
    };
    
    setSessions(sessions.map(s => s.id === activeSession.id ? updatedSession : s));
    setActiveSession(null);
    setShowCloseDialog(false);
    setClosingData({ actual_balance: 0, notes: '' });
  };
  
  const resetOpenDialog = () => {
    setShowOpenDialog(false);
    setOpeningData({ opening_balance: 0, notes: '' });
  };
  
  const resetCloseDialog = () => {
    setShowCloseDialog(false);
    setClosingData({ actual_balance: 0, notes: '' });
  };
  
  return (
    <div 
      className="min-h-screen transition-theme"
      style={{ backgroundColor: 'var(--page-bg)' }}
    >
      <Header title="جلسات الصندوق" />
      
      <div className="p-7 space-y-6">
        {/* Active Session */}
        {activeSession ? (
          <div className="bg-gradient-to-r from-[#27AE60] to-[#2ECC71] rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[14px] opacity-90">جنسة نشطة</p>
                <p className="text-[28px] font-bold">{activeSession.session_number}</p>
              </div>
              <Clock className="w-12 h-12 opacity-80" />
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-[12px] opacity-80">وقت الفتح</p>
                <p className="text-[18px] font-bold">{activeSession.opened_at}</p>
              </div>
              <div>
                <p className="text-[12px] opacity-80">الرصيد الابتدائي</p>
                <p className="text-[18px] font-bold">
                  {activeSession.opening_balance.toLocaleString('ar-EG')}
                </p>
              </div>
              <div>
                <p className="text-[12px] opacity-80">المستخدم</p>
                <p className="text-[18px] font-bold">{activeSession.user_name}</p>
              </div>
              <div className="text-right">
                <p className="text-[12px] opacity-80">المدة</p>
                <p className="text-[18px] font-bold">
                  {Math.floor(
                    (new Date().getTime() - new Date(`${activeSession.date}T${activeSession.opened_at}`).getTime()) /
                      (1000 * 60 * 60)
                  )}{' '}
                  ساعة
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="danger" 
                onClick={() => setShowCloseDialog(true)}
                className="flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                إغلاق الجلسة
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="success"
            onClick={() => setShowOpenDialog(true)}
            className="w-full h-[60px] text-[18px] font-bold flex items-center justify-center gap-2"
          >
            <Plus className="w-6 h-6" />
            فتح جلسة صندوق جديدة
          </Button>
        )}
        
        {/* Today's Statistics */}
        {activeSession && (
          <div className="grid grid-cols-6 gap-4">
            <div 
              className="rounded-lg p-4 transition-theme"
              style={{ backgroundColor: 'var(--card-bg)' }}
            >
              <p className="text-[12px] mb-1 transition-theme" style={{ color: 'var(--text-muted)' }}>مبيعات نقدية</p>
              <p className="text-[24px] font-bold" style={{ color: 'var(--primary)' }}>
                {stats.cash_sales.toLocaleString('en-US')}
              </p>
            </div>
            
            <div 
              className="rounded-lg p-4 transition-theme"
              style={{ backgroundColor: 'var(--card-bg)' }}
            >
              <p className="text-[12px] mb-1 transition-theme" style={{ color: 'var(--text-muted)' }}>مبيعات آجلة</p>
              <p className="text-[24px] font-bold" style={{ color: 'var(--info)' }}>
                {stats.credit_sales.toLocaleString('en-US')}
              </p>
            </div>
            
            <div 
              className="rounded-lg p-4 transition-theme"
              style={{ backgroundColor: 'var(--card-bg)' }}
            >
              <p className="text-[12px] mb-1 transition-theme" style={{ color: 'var(--text-muted)' }}>تحصيل</p>
              <p className="text-[24px] font-bold" style={{ color: 'var(--warning)' }}>
                {stats.collections.toLocaleString('en-US')}
              </p>
            </div>
            
            <div 
              className="rounded-lg p-4 transition-theme"
              style={{ backgroundColor: 'var(--card-bg)' }}
            >
              <p className="text-[12px] mb-1 transition-theme" style={{ color: 'var(--text-muted)' }}>مصاريف</p>
              <p className="text-[24px] font-bold" style={{ color: 'var(--danger)' }}>
                {stats.expenses.toLocaleString('en-US')}
              </p>
            </div>
            
            <div 
              className="rounded-lg p-4 transition-theme"
              style={{ backgroundColor: 'var(--card-bg)' }}
            >
              <p className="text-[12px] mb-1 transition-theme" style={{ color: 'var(--text-muted)' }}>مرتجعات</p>
              <p className="text-[24px] font-bold" style={{ color: 'var(--accent-orange)' }}>
                {stats.returns.toLocaleString('en-US')}
              </p>
            </div>
            
            <div 
              className="rounded-lg p-4 transition-theme"
              style={{ backgroundColor: 'var(--card-bg)' }}
            >
              <p className="text-[12px] mb-1 transition-theme" style={{ color: 'var(--text-muted)' }}>دفع موردين</p>
              <p className="text-[24px] font-bold" style={{ color: 'var(--accent-purple)' }}>
                {stats.supplier_payments.toLocaleString('en-US')}
              </p>
            </div>
          </div>
        )}
        
        {/* Previous Sessions */}
        <div 
          className="rounded-lg overflow-hidden transition-theme overflow-x-auto"
          style={{ backgroundColor: 'var(--card-bg)' }}
        >
          <div 
            className="p-4 transition-theme"
            style={{ 
              backgroundColor: 'var(--surface-1)',
              borderBottom: '1px solid var(--border-color)'
            }}
          >
            <h3 className="text-[18px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>سجل الجلسات</h3>
          </div>
          
          <div 
            className="divide-y transition-theme"
            style={{ borderColor: 'var(--surface-1)' }}
          >
            {sessions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-[16px] transition-theme" style={{ color: 'var(--text-muted)' }}>لا توجد جلسات</p>
              </div>
            ) : (
              sessions
                .filter(s => s.status === 'closed')
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(session => {
                  const isDifference = (session.difference || 0) !== 0;
                  
                  return (
                    <div 
                      key={session.id} 
                      className="p-4 transition-all"
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-1)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-2">
                          <p className="text-[14px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>
                            {session.session_number}
                          </p>
                          <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>{session.date}</p>
                        </div>
                        
                        <div className="col-span-2">
                          <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>من {session.opened_at} إلى {session.closed_at}</p>
                          <p className="text-[14px] font-medium transition-theme" style={{ color: 'var(--text-primary)' }}>
                            {session.user_name}
                          </p>
                        </div>
                        
                        <div className="col-span-2 text-center">
                          <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>الرصيد الابتدائي</p>
                          <p className="text-[16px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>
                            {session.opening_balance.toLocaleString('en-US')}
                          </p>
                        </div>
                        
                        <div className="col-span-2 text-center">
                          <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>الرصيد الختامي</p>
                          <p className="text-[16px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>
                            {session.closing_balance?.toLocaleString('en-US')}
                          </p>
                        </div>
                        
                        <div className="col-span-2 text-center">
                          <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>إجمالي المبيعات</p>
                          <p className="text-[16px] font-bold" style={{ color: 'var(--primary)' }}>
                            {(session.total_sales_cash + session.total_sales_credit).toLocaleString('en-US')}
                          </p>
                        </div>
                        
                        <div 
                          className="col-span-2 text-center px-3 py-2 rounded-lg"
                          style={{
                            backgroundColor: isDifference
                              ? session.difference! > 0
                                ? 'var(--primary-light)'
                                : 'var(--danger-bg)'
                              : 'var(--primary-light)',
                            color: isDifference
                              ? session.difference! > 0
                                ? 'var(--primary)'
                                : 'var(--danger)'
                              : 'var(--primary)'
                          }}
                        >
                          <p className="text-[12px] mb-1">الفرق</p>
                          <p className="text-[16px] font-bold flex items-center justify-center gap-1">
                            {isDifference ? (
                              session.difference! > 0 ? (
                                <>
                                  <TrendingUp className="w-4 h-4" />
                                  +{session.difference?.toLocaleString('en-US')}
                                </>
                              ) : (
                                <>
                                  <TrendingDown className="w-4 h-4" />
                                  {session.difference?.toLocaleString('en-US')}
                                </>
                              )
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                موازي
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
      
      {/* Open Session Dialog */}
      {showOpenDialog && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'var(--overlay-bg)' }}
        >
          <div 
            className="w-full max-w-[500px] rounded-lg overflow-hidden transition-theme"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div 
              className="p-4 flex items-center justify-between"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <h3 className="text-[21px] font-bold text-white">فتح جلسة جديدة</h3>
              <button
                onClick={resetOpenDialog}
                className="w-8 h-8 bg-white/20 rounded hover:bg-white/30 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[14px] font-medium mb-2 transition-theme" style={{ color: 'var(--text-primary)' }}>
                  التاريخ
                </label>
                <input
                  type="text"
                  disabled
                  value={today}
                  className="w-full h-[44px] rounded-lg px-3 opacity-60 transition-theme"
                  style={{
                    backgroundColor: 'var(--surface-1)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-color)'
                  }}
                />
              </div>
              
              <Input
                label="الرصيد الابتدائي (جنيه) *"
                type="number"
                value={openingData.opening_balance}
                onChange={(e) =>
                  setOpeningData({ ...openingData, opening_balance: Number(e.target.value) })
                }
                placeholder="0"
              />
              
              <div>
                <label className="block text-[14px] font-medium mb-2 transition-theme" style={{ color: 'var(--text-primary)' }}>
                  ملاحظات
                </label>
                <textarea
                  value={openingData.notes}
                  onChange={(e) =>
                    setOpeningData({ ...openingData, notes: e.target.value })
                  }
                  placeholder="ملاحظات اختيارية"
                  className="w-full h-[80px] rounded-lg px-3 py-2 outline-none resize-none transition-theme"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)'
                  }}
                />
              </div>
              
              <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>* الحقول الإلزامية</p>
            </div>
            
            <div 
              className="p-4 flex gap-3 transition-theme"
              style={{ backgroundColor: 'var(--surface-1)' }}
            >
              <Button variant="ghost" onClick={resetOpenDialog} fullWidth>
                إلغاء
              </Button>
              <Button variant="success" onClick={handleOpenSession} fullWidth>
                فتح الجلسة
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Close Session Dialog */}
      {showCloseDialog && activeSession && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'var(--overlay-bg)' }}
        >
          <div 
            className="w-full max-w-[600px] rounded-lg overflow-hidden max-h-[90vh] overflow-y-auto transition-theme"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div 
              className="p-4 flex items-center justify-between sticky top-0"
              style={{ backgroundColor: 'var(--danger)' }}
            >
              <h3 className="text-[21px] font-bold text-white">إغلاق الجلسة</h3>
              <button
                onClick={resetCloseDialog}
                className="w-8 h-8 bg-white/20 rounded hover:bg-white/30 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Session Summary */}
              <div 
                className="rounded-lg p-4 space-y-2 text-[14px] transition-theme"
                style={{ backgroundColor: 'var(--surface-1)' }}
              >
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>الرصيد الابتدائي:</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                    {activeSession.opening_balance.toLocaleString('en-US')} ج
                  </span>
                </div>
                <div className="flex justify-between" style={{ color: 'var(--primary)' }}>
                  <span>+ مبيعات نقدية:</span>
                  <span className="font-bold">
                    +{stats.cash_sales.toLocaleString('en-US')} ج
                  </span>
                </div>
                <div className="flex justify-between" style={{ color: 'var(--warning)' }}>
                  <span>+ تحصيل:</span>
                  <span className="font-bold">
                    +{stats.collections.toLocaleString('en-US')} ج
                  </span>
                </div>
                <div className="flex justify-between" style={{ color: 'var(--danger)' }}>
                  <span>- مصاريف:</span>
                  <span className="font-bold">
                    -{stats.expenses.toLocaleString('en-US')} ج
                  </span>
                </div>
                <div className="flex justify-between" style={{ color: 'var(--accent-orange)' }}>
                  <span>- مرتجعات:</span>
                  <span className="font-bold">
                    -{stats.returns.toLocaleString('en-US')} ج
                  </span>
                </div>
                <div className="flex justify-between" style={{ color: 'var(--accent-purple)' }}>
                  <span>- دفع موردين:</span>
                  <span className="font-bold">
                    -{stats.supplier_payments.toLocaleString('en-US')} ج
                  </span>
                </div>
                
                <div 
                  className="pt-2 mt-2 flex justify-between"
                  style={{ borderTop: '1px solid var(--border-color)' }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>الرصيد المتوقع:</span>
                  <span className="font-bold text-[16px]" style={{ color: 'var(--info)' }}>
                    {(
                      activeSession.opening_balance +
                      stats.cash_sales +
                      stats.collections -
                      stats.expenses -
                      stats.returns -
                      stats.supplier_payments
                    ).toLocaleString('en-US')} ج
                  </span>
                </div>
              </div>
              
              {/* Actual Balance Input */}
              <Input
                label="الرصيد الفعلي (المدخل) *"
                type="number"
                value={closingData.actual_balance}
                onChange={(e) =>
                  setClosingData({ ...closingData, actual_balance: Number(e.target.value) })
                }
                placeholder="0"
              />
              
              {/* Calculate Difference */}
              {closingData.actual_balance > 0 && (
                <div 
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: closingData.actual_balance ===
                      activeSession.opening_balance +
                        stats.cash_sales +
                        stats.collections -
                        stats.expenses -
                        stats.returns -
                        stats.supplier_payments
                      ? 'var(--primary-light)'
                      : 'var(--warning-bg)',
                    color: closingData.actual_balance ===
                      activeSession.opening_balance +
                        stats.cash_sales +
                        stats.collections -
                        stats.expenses -
                        stats.returns -
                        stats.supplier_payments
                      ? 'var(--primary)'
                      : 'var(--warning)'
                  }}
                >
                  <p className="text-[12px] font-medium mb-1">الفرق:</p>
                  <p className="text-[20px] font-bold">
                    {(
                      closingData.actual_balance -
                      (activeSession.opening_balance +
                        stats.cash_sales +
                        stats.collections -
                        stats.expenses -
                        stats.returns -
                        stats.supplier_payments)
                    ).toLocaleString('en-US')}{' '}
                    ج
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-[14px] font-medium mb-2 transition-theme" style={{ color: 'var(--text-primary)' }}>
                  ملاحظات الإغلاق
                </label>
                <textarea
                  value={closingData.notes}
                  onChange={(e) =>
                    setClosingData({ ...closingData, notes: e.target.value })
                  }
                  placeholder="ملاحظات عن سبب الفرق إن وجد (اختياري)"
                  className="w-full h-[80px] rounded-lg px-3 py-2 outline-none resize-none transition-theme"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)'
                  }}
                />
              </div>
            </div>
            
            <div 
              className="p-4 flex gap-3 sticky bottom-0 transition-theme"
              style={{ backgroundColor: 'var(--surface-1)' }}
            >
              <Button variant="ghost" onClick={resetCloseDialog} fullWidth>
                إلغاء
              </Button>
              <Button variant="danger" onClick={handleCloseSession} fullWidth>
                إغلاق الجلسة
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
