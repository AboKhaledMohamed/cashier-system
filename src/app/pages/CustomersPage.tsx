/**
 * صفحة إدارة العملاء والائتمان
 * Customer Management & Credit Control
 * 
 * المميزات:
 * ✅ إدارة بيانات العملاء
 * ✅ تتبع الائتمان (الحد الأقصى، المستخدم، المتاح)
 * ✅ تصنيف الثقة (ممتاز، جيد، متوسط، ضعيف، سيء)
 * ✅ قائمة العملاء الممنوعين
 * ✅ ضبط الائتمان
 * ✅ تقارير إحصائية
 */

import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useShop } from '../context/ShopContext';
import { usePermissions } from '../hooks/usePermissions';
import { formatCurrency, formatNumber, formatPhone } from '../utils/formatters';
import { notify, messages } from '../utils/toast';
import { useLocation } from 'react-router';
import { Search, Plus, Edit, Users, DollarSign, X, Trash2, AlertCircle, Wallet } from 'lucide-react';
import type { Customer } from '../types/small-shop.types';

const trustLevelLabels: Record<string, { label: string; color: string }> = {
  'ممتاز': { label: 'ممتاز', color: '#2ECC71' },
  'جيد': { label: 'جيد', color: '#3498DB' },
  'متوسط': { label: 'متوسط', color: '#F1C40F' },
  'ضعيف': { label: 'ضعيف', color: '#E67E22' },
  'سيئ': { label: 'سيئ', color: '#E74C3C' },
  'excellent': { label: 'ممتاز', color: '#2ECC71' },
  'good': { label: 'جيد', color: '#3498DB' },
  'average': { label: 'متوسط', color: '#F1C40F' },
  'poor': { label: 'ضعيف', color: '#E67E22' },
  'bad': { label: 'سيئ', color: '#E74C3C' },
};

export default function CustomersPage() {
  const location = useLocation();
  const { customers, loadCustomers, currentUser } = useShop();
  const { canAddCustomers, canEditCustomers, canDeleteCustomers } = usePermissions();
  const api = (window as any).electronAPI;
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showAddForm, setShowAddForm] = useState(false); // Show inline form on button click
  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string }>({});
  
  // Check for duplicate customer name
  const isDuplicateName = (name: string, excludeId?: string) => {
    return customers.some(
      (c) =>
        c.name.trim().toLowerCase() === name.trim().toLowerCase() &&
        c.id !== excludeId
    );
  };
  
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    email: '',
  });
  
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Reduce debt modal states
  const [customerToReduceDebt, setCustomerToReduceDebt] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Filter customers
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery);
    return matchesSearch;
  });
  
  // Calculate stats
  const totalCustomers = customers.length;
  const totalDebt = customers.reduce((sum, c) => sum + (c.current_balance || 0), 0);
  
  const handleSave = async () => {
    const errors: { name?: string; phone?: string } = {};
    if (!formData.name?.trim()) {
      errors.name = 'اسم العميل مطلوب';
    } else if (!/^[\u0600-\u06FFa-zA-Z0-9\s]+$/.test(formData.name.trim())) {
      errors.name = 'اسم العميل يجب أن يحتوي على حروف وأرقام فقط بدون رموز';
    } else if (isDuplicateName(formData.name, editingCustomer?.id)) {
      errors.name = 'هذا الاسم مستخدم بالفعل، يرجى استخدام اسم آخر';
    }
    if (!formData.phone?.trim()) {
      errors.phone = 'رقم التليفون مطلوب';
    } else if (!/^01[0125]\d{8}$/.test(formData.phone.trim())) {
      errors.phone = 'رقم الموبايل غير صحيح';
    }
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    if (editingCustomer) {
      try {
        await api.customers.update(editingCustomer.id, formData);
        await loadCustomers();
        notify.success('تم تحديث بيانات العميل');
      } catch(e: any) { notify.error(e.message); }
    } else {
      try {
        await api.customers.create(formData);
        await loadCustomers();
        notify.success('تم إضافة العميل بنجاح');
      } catch(e: any) { notify.error(e.message); }
    }
    
    closeDialog();
  };
  
  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData(customer);
    setShowAddDialog(true);
  };
  
  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;
    setIsDeleting(true);
    try {
      await api.customers.delete(customerToDelete.id);
      notify.success('تم حذف العميل بنجاح');
      await loadCustomers();
    } catch (e: any) {
      notify.error(e.message || 'فشل في حذف العميل');
    } finally {
      setIsDeleting(false);
      setCustomerToDelete(null);
    }
  };

  const cancelDelete = () => {
    setCustomerToDelete(null);
  };
  
  // Reduce debt handlers
  const handleReduceDebtClick = (customer: Customer) => {
    if ((customer.current_balance || 0) <= 0) {
      notify.error('هذا العميل لا يوجد عليه دين');
      return;
    }
    setCustomerToReduceDebt(customer);
    setPaymentAmount('');
    setPaymentError('');
  };

  const cancelReduceDebt = () => {
    setCustomerToReduceDebt(null);
    setPaymentAmount('');
    setPaymentError('');
  };

  const confirmReduceDebt = async () => {
    if (!customerToReduceDebt) return;
    
    const amount = Number(paymentAmount);
    const currentDebt = customerToReduceDebt.current_balance || 0;
    
    // Validation
    if (!paymentAmount || isNaN(amount) || amount <= 0) {
      setPaymentError('يرجى إدخال مبلغ صحيح أكبر من صفر');
      return;
    }
    
    if (amount > currentDebt) {
      setPaymentError(`المبلغ المدخل (${amount}) أكبر من الدين الحالي (${currentDebt})`);
      return;
    }
    
    setIsProcessingPayment(true);
    try {
      await api.payments.create({
        payment_direction: 'تحصيل',
        party_type: 'customer',
        party_id: customerToReduceDebt.id,
        party_name: customerToReduceDebt.name,
        amount: amount,
        method: 'نقدي',
        user_id: currentUser?.id,
        notes: 'تقليل الدين - دفعة من العميل'
      });
      
      notify.success(`تم تقليل الدين بمبلغ ${amount} جنيه بنجاح`);
      await loadCustomers();
      cancelReduceDebt();
    } catch (e: any) {
      notify.error(e.message || 'فشل في تقليل الدين');
    } finally {
      setIsProcessingPayment(false);
    }
  };
  
  const closeDialog = () => {
    setShowAddDialog(false);
    setShowAddForm(false);
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
    });
    setFormErrors({});
  };
  
  useEffect(() => {
    if ((location.state as { openAddForm?: boolean } | null)?.openAddForm) {
      setShowAddForm(true);
    }
  }, [location.state]);
  
  return (
    <div 
      className="min-h-screen transition-theme"
      style={{ backgroundColor: 'var(--page-bg)' }}
    >
      <Header title="إدارة العملاء" />
      
      <div className="p-7 space-y-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="ابحث عن عميل (اسم أو تليفون)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[48px] rounded-lg pr-12 pl-4 text-[14px] outline-none transition-theme"
              style={{
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)'
              }}
            />
          </div>
          
          <Button
            variant="info"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 min-w-[48px] justify-center"
            title={showAddForm ? 'إلغاء' : 'إضافة عميل'}
            disabled={!canAddCustomers}
          >
            {showAddForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {!showAddForm && 'إضافة عميل'}
          </Button>
        </div>
        
        {/* Inline Add Customer Form */}
        {showAddForm && (
          <div 
            className="rounded-lg p-6 border-2 transition-theme"
            style={{ 
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--info)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>إضافة عميل جديد</h3>
              <span className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>أدخل البيانات الأساسية أولاً</span>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
                <Input
                label="اسم العميل *"
                value={formData.name}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^[\u0600-\u06FFa-zA-Z0-9\s]*$/.test(value)) {
                    setFormData({ ...formData, name: value });
                  }
                }}
                placeholder="أدخل اسم العميل"
                error={formErrors.name}
              />
              <Input
                label="رقم التليفون *"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="01xxxxxxxxx"
                error={formErrors.phone}
              />
              <Input
                label="البريد الإلكتروني"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com (اختياري)"
              />
              <Input
                label="رقم تليفون ثاني"
                value={formData.phone2}
                onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
                placeholder="01xxxxxxxxx (اختياري)"
              />
              <div>
                <label className="block text-[14px] font-medium mb-2 transition-theme" style={{ color: 'var(--text-primary)' }}>الحي/المنطقة</label>
                <input
                  type="text"
                  value={formData.address?.area || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, area: e.target.value }
                    })
                  }
                  placeholder="المعادي، الزمالك..."
                  className="w-full h-[44px] rounded-lg px-3 outline-none transition-theme"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)'
                  }}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setShowAddForm(false)}>
                إلغاء
              </Button>
              <Button variant="success" onClick={async () => {
                await handleSave();
              }}>
                إضافة العميل
              </Button>
            </div>
            <p className="text-[12px] mt-2 transition-theme" style={{ color: 'var(--text-muted)' }}>* الحقول الإلزامية فقط مطلوبة للحفظ</p>
          </div>
        )}
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-5">
          <div 
            className="rounded-lg p-5 flex items-center gap-4 transition-theme"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--info-bg)' }}
            >
              <Users className="w-6 h-6" style={{ color: 'var(--info)' }} />
            </div>
            <div>
              <p className="text-[14px] transition-theme" style={{ color: 'var(--text-muted)' }}>إجمالي العملاء</p>
              <p className="text-[26px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>{totalCustomers}</p>
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
              <DollarSign className="w-6 h-6" style={{ color: 'var(--warning)' }} />
            </div>
            <div>
              <p className="text-[14px] transition-theme" style={{ color: 'var(--text-muted)' }}>إجمالي الديون</p>
              <p className="text-[26px] font-bold" style={{ color: 'var(--warning)' }}>
                {totalDebt.toLocaleString('en-US')} ج
              </p>
            </div>
          </div>
        </div>
        
        {/* Customers Table */}
        <div 
          className="rounded-lg overflow-hidden transition-theme overflow-x-auto"
          style={{ backgroundColor: 'var(--card-bg)' }}
        >
          <div 
            className="grid grid-cols-12 gap-4 p-4 text-[14px] font-medium transition-theme"
            style={{ 
              backgroundColor: 'var(--surface-1)',
              color: 'var(--text-muted)'
            }}
          >
            <div className="col-span-3">الاسم</div>
            <div className="col-span-2">التليفون</div>
            <div className="col-span-2 text-center">الدين الحالي</div>
            <div className="col-span-3">العنوان</div>
            <div className="col-span-2 text-center">الإجراء</div>
          </div>
          
          <div 
            className="divide-y transition-theme"
            style={{ borderColor: 'var(--surface-1)' }}
          >
            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-[16px] transition-theme" style={{ color: 'var(--text-muted)' }}>لا توجد عملاء</p>
                <p className="text-[13px] mt-1 transition-theme" style={{ color: 'var(--text-muted)' }}>ابدأ بإضافة عميل جديد من زر إضافة عميل</p>
              </div>
            ) : (
              filteredCustomers.map((customer) => {
                return (
                  <div
                    key={customer.id}
                    className="grid grid-cols-12 gap-4 p-4 items-center transition-all"
                    style={{ backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--surface-1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div className="col-span-3">
                      <p className="text-[14px] font-medium transition-theme" style={{ color: 'var(--text-primary)' }}>
                        {customer.name}
                      </p>
                      <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>
                        {customer.email || 'بدون بريد'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[13px] font-mono transition-theme" style={{ color: 'var(--text-muted)' }}>
                        {customer.phone}
                      </p>
                    </div>
                    <div className="col-span-2 text-center">
                      <p className="text-[14px] font-bold" style={{ 
                        color: (customer.current_balance || 0) > 0 ? 'var(--warning)' : 'var(--primary)' 
                      }}>
                        {formatCurrency(customer.current_balance || 0)}
                      </p>
                    </div>
                    <div className="col-span-3">
                      <p className="text-[13px] transition-theme" style={{ color: 'var(--text-muted)' }}>
                        {customer.address?.area || customer.address?.street || 'بدون عنوان'}
                      </p>
                    </div>
                    <div className="col-span-2 text-center">
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => handleReduceDebtClick(customer)}
                          title="تقليل الدين"
                          className="w-8 h-8 rounded flex items-center justify-center transition-all"
                          style={{ 
                            backgroundColor: 'var(--success-bg)', 
                            color: 'var(--success)' 
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--success)';
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--success-bg)';
                            e.currentTarget.style.color = 'var(--success)';
                          }}
                        >
                          <Wallet className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => canEditCustomers && openEditDialog(customer)}
                          disabled={!canEditCustomers}
                          title="تعديل البيانات"
                          className="w-8 h-8 rounded flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ 
                            backgroundColor: canEditCustomers ? 'var(--info-bg)' : 'var(--surface-2)', 
                            color: canEditCustomers ? 'var(--info)' : 'var(--text-muted)' 
                          }}
                          onMouseEnter={(e) => {
                            if (canEditCustomers) {
                              e.currentTarget.style.backgroundColor = 'var(--info)';
                              e.currentTarget.style.color = 'white';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (canEditCustomers) {
                              e.currentTarget.style.backgroundColor = 'var(--info-bg)';
                              e.currentTarget.style.color = 'var(--info)';
                            }
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => canDeleteCustomers && handleDeleteClick(customer)}
                          disabled={!canDeleteCustomers}
                          title="حذف العميل"
                          className="w-8 h-8 rounded flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ 
                            backgroundColor: canDeleteCustomers ? 'var(--danger-bg)' : 'var(--surface-2)', 
                            color: canDeleteCustomers ? 'var(--danger)' : 'var(--text-muted)' 
                          }}
                          onMouseEnter={(e) => {
                            if (canDeleteCustomers) {
                              e.currentTarget.style.backgroundColor = 'var(--danger)';
                              e.currentTarget.style.color = 'white';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (canDeleteCustomers) {
                              e.currentTarget.style.backgroundColor = 'var(--danger-bg)';
                              e.currentTarget.style.color = 'var(--danger)';
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      
      
      {/* Add/Edit Dialog */}
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
              style={{ backgroundColor: 'var(--info)' }}
            >
              <h3 className="text-[21px] font-bold" style={{ color: 'white' }}>
                {editingCustomer ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
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
                  label="اسم العميل *"
                  value={formData.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^[\u0600-\u06FFa-zA-Z0-9\s]*$/.test(value)) {
                      setFormData({ ...formData, name: value });
                    }
                  }}
                  placeholder="أدخل اسم العميل"
                />
                <Input
                  label="رقم التليفون *"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="01xxxxxxxxx"
                />
                <Input
                  label="البريد الإلكتروني"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com (اختياري)"
                />
                <Input
                  label="رقم تليفون ثاني"
                  value={formData.phone2}
                  onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
                  placeholder="01xxxxxxxxx (اختياري)"
                />
              </div>
              
              <div>
                <label className="block text-[14px] font-medium mb-2 transition-theme" style={{ color: 'var(--text-primary)' }}>الحي/المنطقة</label>
                <input
                  type="text"
                  value={formData.address?.area || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, area: e.target.value }
                    })
                  }
                  placeholder="المعادي، الزمالك..."
                  className="w-full h-[44px] rounded-lg px-3 outline-none transition-theme"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)'
                  }}
                />
              </div>
              
              <div>
                <label className="block text-[14px] font-medium mb-2 transition-theme" style={{ color: 'var(--text-primary)' }}>ملاحظات</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="ملاحظات عن العميل (اختياري)"
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
              <Button variant="success" onClick={handleSave} fullWidth>
                {editingCustomer ? 'حفظ التعديلات' : 'إضافة العميل'}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Reduce Debt Modal */}
      {customerToReduceDebt && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'var(--overlay-bg)' }}
        >
          <div 
            className="w-full max-w-[400px] rounded-lg overflow-hidden transition-theme"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div 
              className="p-4 flex items-center justify-center"
              style={{ backgroundColor: 'var(--success)' }}
            >
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <div className="p-6">
              <h3 className="text-[18px] font-bold mb-2 transition-theme text-center" style={{ color: 'var(--text-primary)' }}>
                تقليل الدين
              </h3>
              <p className="text-[14px] mb-4 transition-theme text-center" style={{ color: 'var(--text-muted)' }}>
                العميل: {customerToReduceDebt.name}
              </p>
              <p className="text-[14px] mb-4 transition-theme text-center" style={{ color: 'var(--warning)' }}>
                الدين الحالي: {formatCurrency(customerToReduceDebt.current_balance || 0)}
              </p>
              
              <div className="mb-4">
                <label className="block text-[14px] font-medium mb-2 transition-theme" style={{ color: 'var(--text-primary)' }}>
                  مبلغ الدفعة
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => {
                    setPaymentAmount(e.target.value);
                    setPaymentError('');
                  }}
                  placeholder="أدخل المبلغ"
                  className="w-full h-[44px] rounded-lg px-3 outline-none transition-theme"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    border: paymentError ? '1px solid var(--danger)' : '1px solid var(--border-color)'
                  }}
                />
                {paymentError && (
                  <p className="text-[12px] mt-1" style={{ color: 'var(--danger)' }}>
                    {paymentError}
                  </p>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="ghost" 
                  onClick={cancelReduceDebt} 
                  fullWidth 
                  disabled={isProcessingPayment}
                >
                  إلغاء
                </Button>
                <Button 
                  variant="success" 
                  onClick={confirmReduceDebt} 
                  fullWidth 
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? 'جاري المعالجة...' : 'تأكيد الدفعة'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {customerToDelete && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'var(--overlay-bg)' }}
        >
          <div
            className="rounded-xl p-6 w-[400px] max-w-[90%] transition-theme"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--danger-bg)' }}
              >
                <Trash2 className="w-6 h-6" style={{ color: 'var(--danger)' }} />
              </div>
              <h3 className="text-[20px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>
                تأكيد الحذف
              </h3>
            </div>
            <p className="text-[16px] mb-6 transition-theme" style={{ color: 'var(--text-secondary)' }}>
              هل أنت متأكد من حذف هذا العميل؟
              <br />
              <strong>{customerToDelete.name}</strong>
              <br />
              <span className="text-[14px]" style={{ color: 'var(--danger)' }}>
                لا يمكن التراجع عن هذا الإجراء!
              </span>
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                fullWidth
                onClick={cancelDelete}
                disabled={isDeleting}
              >
                إلغاء
              </Button>
              <Button
                variant="danger"
                fullWidth
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'جاري الحذف...' : 'حذف'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
