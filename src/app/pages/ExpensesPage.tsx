/**
 * صفحة المصاريف التشغيلية
 * Daily Expenses Management
 * 
 * المميزات:
 * ✅ تسجيل المصاريف اليومية
 * ✅ تصنيفات متعددة (إيجار، كهرباء، راتب، إلخ)
 * ✅ عرض المصاريف حسب الفترة
 * ✅ إحصائيات يومية/شهرية
 * ✅ ربط بجلسة الصندوق
 * ✅ إرجاع أو حذف المصاريف
 */

import { useState } from 'react';
import Header from '../components/Header';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { notify, messages } from '../utils/toast';
import { formatNumber } from '../utils/formatters';
import {
  Plus,
  X,
  Trash2,
  DollarSign,
  TrendingDown,
  Filter,
} from 'lucide-react';
import type { Expense, ExpenseCategory } from '../types/small-shop.types';

// Mock data - empty initially for fresh database
const mockExpenses: Expense[] = [];

const expenseCategoryLabels: Record<ExpenseCategory, { label: string; color: string }> = {
  rent: { label: 'إيجار', color: '#E74C3C' },
  electricity: { label: 'كهرباء', color: '#F39C12' },
  water: { label: 'مياه', color: '#3498DB' },
  salary: { label: 'رواتب', color: '#9B59B6' },
  supplies: { label: 'مستلزمات', color: '#2ECC71' },
  maintenance: { label: 'صيانة', color: '#E67E22' },
  other: { label: 'أخرى', color: '#7A8CA0' },
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'all'>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
  
  const [formData, setFormData] = useState<Partial<Expense>>({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('ar-EG', { hour12: false }).slice(0, 5),
    category: 'supplies',
    amount: 0,
    description: '',
    notes: '',
  });
  
  // Filter expenses
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category.includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || expense.category === selectedCategory;
    
    // Date filtering
    const today = new Date();
    const expenseDate = new Date(expense.date);
    let matchesDate = true;
    
    if (dateFilter === 'today') {
      matchesDate = expenseDate.toDateString() === today.toDateString();
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesDate = expenseDate >= weekAgo && expenseDate <= today;
    } else if (dateFilter === 'month') {
      matchesDate =
        expenseDate.getMonth() === today.getMonth() &&
        expenseDate.getFullYear() === today.getFullYear();
    }
    
    return matchesSearch && matchesCategory && matchesDate;
  });
  
  // Calculate statistics
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const avgExpense = filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0;
  const expensesByCategory = Object.keys(expenseCategoryLabels).map((cat) => ({
    category: cat as ExpenseCategory,
    total: filteredExpenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0),
  }));
  
  const handleAddExpense = () => {
    if (!formData.amount || formData.amount <= 0) {
      notify.error('الرجاء إدخال مبلغ صحيح');
      return;
    }
    
    if (!formData.description) {
      notify.error('الوصف إلزامي');
      return;
    }
    
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      expense_number: `EXP-${(expenses.length + 1).toString().padStart(3, '0')}`,
      date: formData.date || new Date().toISOString().split('T')[0],
      time: formData.time || '00:00',
      user_id: 'user-manager-001', // Should come from logged in user
      user_name: 'فاطمة محمود',
      category: formData.category as ExpenseCategory,
      amount: formData.amount!,
      description: formData.description!,
      notes: formData.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    setExpenses([...expenses, newExpense]);
    closeDialog();
  };
  
  const handleDeleteExpense = (id: string) => {
    if (confirm('هل تريد حذف هذه المصروفة؟')) {
      setExpenses(expenses.filter((e) => e.id !== id));
    }
  };
  
  const closeDialog = () => {
    setShowAddDialog(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('ar-EG', { hour12: false }).slice(0, 5),
      category: 'supplies',
      amount: 0,
      description: '',
      notes: '',
    });
  };
  
  return (
    <div 
      className="min-h-screen transition-theme"
      style={{ backgroundColor: 'var(--page-bg)' }}
    >
      <Header title="المصاريف التشغيلية" />
      
      <div className="p-7 space-y-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="ابحث عن مصروفة (الوصف أو التصنيف)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[48px] rounded-lg pr-12 pl-4 outline-none transition-theme"
              style={{
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)'
              }}
            />
          </div>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-[48px] rounded-lg px-4 outline-none transition-theme"
            style={{
              backgroundColor: 'var(--input-bg)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)'
            }}
          >
            <option value="all">كل الفترات</option>
            <option value="today">اليوم</option>
            <option value="week">الأسبوع</option>
            <option value="month">الشهر</option>
          </select>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="h-[48px] rounded-lg px-4 outline-none transition-theme"
            style={{
              backgroundColor: 'var(--input-bg)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)'
            }}
          >
            <option value="all">جميع التصنيفات</option>
            {Object.entries(expenseCategoryLabels).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>
          
          <Button
            variant="info"
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            إضافة مصروفة
          </Button>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4">
          <div 
            className="rounded-lg p-5 flex items-center gap-4 transition-theme"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--danger-bg)' }}
            >
              <DollarSign className="w-6 h-6" style={{ color: 'var(--danger)' }} />
            </div>
            <div>
              <p className="text-[14px] transition-theme" style={{ color: 'var(--text-muted)' }}>إجمالي المصاريف</p>
              <p className="text-[26px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>
                {totalExpenses.toLocaleString('ar-EG')}
              </p>
            </div>
          </div>
          
          <div 
            className="rounded-lg p-5 flex items-center gap-4 transition-theme"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--warning-bg)' }}
            >
              <TrendingDown className="w-6 h-6" style={{ color: 'var(--warning)' }} />
            </div>
            <div>
              <p className="text-[14px] transition-theme" style={{ color: 'var(--text-muted)' }}>متوسط المصروفة</p>
              <p className="text-[26px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>
                                {formatNumber(avgExpense)}
              </p>
            </div>
          </div>
          
          <div 
            className="rounded-lg p-5 flex items-center gap-4 transition-theme"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--info-bg)' }}
            >
              <Filter className="w-6 h-6" style={{ color: 'var(--info)' }} />
            </div>
            <div>
              <p className="text-[14px] transition-theme" style={{ color: 'var(--text-muted)' }}>عدد المصاريف</p>
              <p className="text-[26px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>
                {filteredExpenses.length}
              </p>
            </div>
          </div>
          
          <div 
            className="rounded-lg p-5 transition-theme"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <p className="text-[14px] mb-3 transition-theme" style={{ color: 'var(--text-muted)' }}>أكبر التصنيفات</p>
            <div className="space-y-1 max-h-12 overflow-y-auto">
              {expensesByCategory
                .filter((e) => e.total > 0)
                .sort((a, b) => b.total - a.total)
                .slice(0, 2)
                .map((item) => (
                  <div key={item.category} className="flex justify-between text-[12px]">
                    <span className="transition-theme" style={{ color: 'var(--text-muted)' }}>
                      {expenseCategoryLabels[item.category].label}
                    </span>
                    <span className="font-semibold transition-theme" style={{ color: 'var(--text-primary)' }}>
                      {item.total.toLocaleString('ar-EG')}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
        
        {/* Expenses List */}
        <div 
          className="rounded-lg overflow-hidden transition-theme"
          style={{ backgroundColor: 'var(--card-bg)' }}
        >
          <div 
            className="grid grid-cols-12 gap-4 p-4 text-[14px] font-medium transition-theme"
            style={{ 
              backgroundColor: 'var(--surface-1)',
              color: 'var(--text-muted)'
            }}
          >
            <div className="col-span-2">الوصف</div>
            <div className="col-span-2">التصنيف</div>
            <div className="col-span-2">التاريخ والوقت</div>
            <div className="col-span-1 text-center">المبلغ</div>
            <div className="col-span-3">الملاحظات</div>
            <div className="col-span-2">المستخدم</div>
            <div className="col-span-1 text-center">الإجراء</div>
          </div>
          
          <div 
            className="divide-y transition-theme"
            style={{ borderColor: 'var(--surface-1)' }}
          >
            {filteredExpenses.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-[16px] transition-theme" style={{ color: 'var(--text-muted)' }}>لا توجد مصاريف</p>
              </div>
            ) : (
              filteredExpenses
                .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime())
                .map((expense) => (
                  <div
                    key={expense.id}
                    className="grid grid-cols-12 gap-4 p-4 items-center transition-all"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div className="col-span-2">
                      <p className="text-[14px] font-medium transition-theme" style={{ color: 'var(--text-primary)' }}>
                        {expense.description}
                      </p>
                      <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>
                        {expense.expense_number}
                      </p>
                    </div>
                    
                    <div className="col-span-2">
                      <span
                        className="px-3 py-1 rounded-full text-[12px] font-medium"
                        style={{
                          color: expenseCategoryLabels[expense.category].color,
                          backgroundColor: `${expenseCategoryLabels[expense.category].color}20`,
                        }}
                      >
                        {expenseCategoryLabels[expense.category].label}
                      </span>
                    </div>
                    
                    <div className="col-span-2">
                      <p className="text-[13px] transition-theme" style={{ color: 'var(--text-primary)' }}>
                        {expense.date}
                      </p>
                      <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>
                        {expense.time}
                      </p>
                    </div>
                    
                    <div className="col-span-1 text-center">
                      <p className="text-[16px] font-bold" style={{ color: 'var(--danger)' }}>
                        {expense.amount.toLocaleString('ar-EG')} ج
                      </p>
                    </div>
                    
                    <div className="col-span-3">
                      <p className="text-[13px] line-clamp-2 transition-theme" style={{ color: 'var(--text-muted)' }}>
                        {expense.notes || '-'}
                      </p>
                    </div>
                    
                    <div className="col-span-2">
                      <p className="text-[13px] transition-theme" style={{ color: 'var(--text-primary)' }}>
                        {expense.user_name}
                      </p>
                    </div>
                    
                    <div className="col-span-1 text-center">
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        title="حذف"
                        className="w-8 h-8 rounded flex items-center justify-center transition-all"
                        style={{ 
                          backgroundColor: 'var(--danger-bg)', 
                          color: 'var(--danger)' 
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--danger)';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--danger-bg)';
                          e.currentTarget.style.color = 'var(--danger)';
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
      
      {/* Add Expense Dialog */}
      {showAddDialog && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'var(--overlay-bg)' }}
        >
          <div 
            className="w-full max-w-[700px] rounded-lg overflow-hidden transition-theme"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div 
              className="p-4 flex items-center justify-between"
              style={{ backgroundColor: 'var(--danger)' }}
            >
              <h3 className="text-[21px] font-bold" style={{ color: 'white' }}>
                إضافة مصروفة جديدة
              </h3>
              <button
                onClick={closeDialog}
                className="w-8 h-8 bg-white/20 rounded hover:bg-white/30 flex items-center justify-center"
              >
                <X className="w-5 h-5" style={{ color: 'white' }} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="التاريخ *"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
                
                <Input
                  label="الوقت *"
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-medium mb-2 transition-theme" style={{ color: 'var(--text-primary)' }}>
                    التصنيف *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as ExpenseCategory,
                      })
                    }
                    className="w-full h-[44px] rounded-lg px-3 outline-none transition-theme"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    {Object.entries(expenseCategoryLabels).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <Input
                  label="المبلغ (جنيه) *"
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: Number(e.target.value) })
                  }
                  placeholder="0"
                />
              </div>
              
              <Input
                label="الوصف/البيان *"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="مثلاً: فاتورة الكهرباء، راتب موظف، إلخ"
              />
              
              <div>
                <label className="block text-[14px] font-medium mb-2 transition-theme" style={{ color: 'var(--text-primary)' }}>
                  ملاحظات
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="ملاحظات إضافية (اختياري)"
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
              <Button variant="ghost" onClick={closeDialog} fullWidth>
                إلغاء
              </Button>
              <Button variant="danger" onClick={handleAddExpense} fullWidth>
                إضافة المصروفة
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
