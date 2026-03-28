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
import { formatCurrency, formatNumber, formatPhone } from '../utils/formatters';
import { notify, messages } from '../utils/toast';
import { useLocation } from 'react-router';
import {
  Search,
  Plus,
  Edit,
  Users,
  DollarSign,
  TrendingUp,
  X,
  AlertTriangle,
  CreditCard,
  Lock,
} from 'lucide-react';
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
  const api = (window as any).electronAPI;
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBlacklist, setFilterBlacklist] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showCreditDialog, setShowCreditDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showAddForm, setShowAddForm] = useState(false); // Show inline form on button click
  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string }>({});
  
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    email: '',
    credit_limit: 5000,
    trust_level: 'average',
  });
  
  const [creditAdjustment, setCreditAdjustment] = useState<{
    adjustment_type: 'increase' | 'decrease' | 'pay';
    amount: number;
    reason: string;
  }>({
    adjustment_type: 'pay',
    amount: 0,
    reason: '',
  });
  
  // Filter customers
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery);
    const matchesBlacklist = !filterBlacklist || customer.is_blacklisted;
    return matchesSearch && matchesBlacklist;
  });
  
  // Calculate stats
  const totalCustomers = customers.length;
  const totalCredit = customers.reduce((sum, c) => sum + c.credit_used, 0);
  const blacklistedCount = customers.filter(c => c.is_blacklisted).length;
  const highRiskCount = customers.filter(c => 
    c.credit_available <= (c.credit_limit * 0.2) && !c.is_blacklisted
  ).length;
  
  const handleSave = async () => {
    const errors: { name?: string; phone?: string } = {};
    if (!formData.name?.trim()) errors.name = 'اسم العميل مطلوب';
    if (!formData.phone?.trim()) errors.phone = 'رقم التليفون مطلوب';
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
  
  const handleCreditAdjustment = async () => {
    if (!editingCustomer || creditAdjustment.amount <= 0) {
      notify.error('يرجى إدخال مبلغ صحيح');
      return;
    }
    
    // Use Electron API for payments
    try {
      if (creditAdjustment.adjustment_type === 'pay') {
        await api.payments.create({
          payment_direction: 'تحصيل',
          party_type: 'customer',
          party_id: editingCustomer.id,
          party_name: editingCustomer.name,
          amount: creditAdjustment.amount,
          method: 'نقدي',
          user_id: currentUser?.id || 'user-admin-001',
          notes: creditAdjustment.reason,
        });
      }
      await loadCustomers();
      notify.success('تم تعديل الائتمان بنجاح');
    } catch(e: any) { notify.error(e.message); }
    
    setShowCreditDialog(false);
    setCreditAdjustment({ adjustment_type: 'pay', amount: 0, reason: '' });
  };
  
  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData(customer);
    setShowAddDialog(true);
  };
  
  const openCreditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowCreditDialog(true);
  };
  
  const closeDialog = () => {
    setShowAddDialog(false);
    setShowAddForm(false);
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      credit_limit: 5000,
      trust_level: 'average',
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
            variant={filterBlacklist ? 'danger' : 'ghost'}
            onClick={() => setFilterBlacklist(!filterBlacklist)}
          >
            {filterBlacklist ? `ممنوعين (${blacklistedCount})` : 'عرض الممنوعين'}
          </Button>
          
          <Button
            variant="info"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 min-w-[48px] justify-center"
            title={showAddForm ? 'إلغاء' : 'إضافة عميل'}
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
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              <Input
                label="حد الائتمان"
                type="number"
                value={formData.credit_limit}
                onChange={(e) =>
                  setFormData({ 
                    ...formData, 
                    credit_limit: Number(e.target.value),
                    credit_available: Number(e.target.value) - (editingCustomer?.credit_used || 0)
                  })
                }
                placeholder="5000"
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
              <Button variant="success" onClick={() => {
                handleSave();
                setShowAddForm(false);
              }}>
                إضافة العميل
              </Button>
            </div>
            <p className="text-[12px] mt-2 transition-theme" style={{ color: 'var(--text-muted)' }}>* الحقول الإلزامية فقط مطلوبة للحفظ</p>
          </div>
        )}
        
        {/* Stats */}
        <div className="grid grid-cols-4 gap-5">
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
              <CreditCard className="w-6 h-6" style={{ color: 'var(--warning)' }} />
            </div>
            <div>
              <p className="text-[14px] transition-theme" style={{ color: 'var(--text-muted)' }}>إجمالي الائتمان المستخدم</p>
              <p className="text-[26px] font-bold" style={{ color: 'var(--warning)' }}>
                {totalCredit.toLocaleString('ar-EG')} ج
              </p>
            </div>
          </div>
          
          <div 
            className="rounded-lg p-5 flex items-center gap-4 transition-theme"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--danger-bg)' }}
            >
              <AlertTriangle className="w-6 h-6" style={{ color: 'var(--danger)' }} />
            </div>
            <div>
              <p className="text-[14px] transition-theme" style={{ color: 'var(--text-muted)' }}>خطر مالي (نسبة منخفضة)</p>
              <p className="text-[26px] font-bold" style={{ color: 'var(--danger)' }}>
                {highRiskCount}
              </p>
            </div>
          </div>
          
          <div 
            className="rounded-lg p-5 flex items-center gap-4 transition-theme"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--danger-bg)' }}
            >
              <Lock className="w-6 h-6" style={{ color: 'var(--danger)' }} />
            </div>
            <div>
              <p className="text-[14px] transition-theme" style={{ color: 'var(--text-muted)' }}>عملاء ممنوعين</p>
              <p className="text-[26px] font-bold" style={{ color: 'var(--danger)' }}>
                {blacklistedCount}
              </p>
            </div>
          </div>
        </div>
        
        {/* Customers Table */}
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
            <div className="col-span-2">الاسم</div>
            <div className="col-span-2">التليفون</div>
            <div className="col-span-1 text-center">المستخدم</div>
            <div className="col-span-1 text-center">المتاح</div>
            <div className="col-span-1 text-center">الحد</div>
            <div className="col-span-2">الثقة</div>
            <div className="col-span-2">الحالة</div>
            <div className="col-span-1 text-center">الإجراء</div>
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
                const trustColor = customer.trust_level === 'excellent' ? 'var(--primary)' 
                  : customer.trust_level === 'good' ? 'var(--info)'
                  : customer.trust_level === 'average' ? 'var(--warning)'
                  : customer.trust_level === 'poor' ? 'var(--accent-orange)'
                  : 'var(--danger)';
                
                return (
                  <div
                    key={customer.id}
                    className="grid grid-cols-12 gap-4 p-4 items-center transition-all"
                    style={{
                      backgroundColor: customer.is_blacklisted ? 'var(--danger-bg)' : 'transparent',
                      opacity: customer.is_blacklisted ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!customer.is_blacklisted) {
                        e.currentTarget.style.backgroundColor = 'var(--surface-1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!customer.is_blacklisted) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div className="col-span-2">
                      <p className="text-[14px] font-medium transition-theme" style={{ color: 'var(--text-primary)' }}>
                        {customer.name}
                      </p>
                      <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>
                        {customer.address?.area || customer.address?.street || 'بدون عنوان'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[13px] font-mono transition-theme" style={{ color: 'var(--text-muted)' }}>
                        {customer.phone}
                      </p>
                    </div>
                    <div className="col-span-1 text-center">
                      <p className="text-[14px] font-bold" style={{ color: 'var(--warning)' }}>
                        {formatCurrency(customer.credit_used)}
                      </p>
                    </div>
                    <div className="col-span-1 text-center">
                      <p className="text-[14px] font-bold" style={{
                        color: customer.credit_available > 500 ? 'var(--primary)' 
                          : customer.credit_available > 0 ? 'var(--accent-orange)'
                          : 'var(--danger)'
                      }}>
                        {formatCurrency(customer.credit_available)}
                      </p>
                    </div>
                    <div className="col-span-1 text-center">
                      <p className="text-[13px] transition-theme" style={{ color: 'var(--text-muted)' }}>
                        {formatCurrency(customer.credit_limit)}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="px-3 py-1 rounded-full text-[12px] font-medium" style={{ 
                        color: trustColor, 
                        backgroundColor: `${trustColor}20` 
                      }}>
                        {trustLevelLabels[customer.trust_level]?.label || customer.trust_level}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      {customer.is_blacklisted && (
                        <span 
                          className="px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1"
                          style={{ 
                            backgroundColor: 'var(--danger-bg)', 
                            color: 'var(--danger)' 
                          }}
                        >
                          <Lock className="w-3 h-3" />
                          ممنوع
                        </span>
                      )}
                      {customer.credit_available <= (customer.credit_limit * 0.2) && !customer.is_blacklisted && (
                        <span 
                          className="px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1"
                          style={{ 
                            backgroundColor: 'var(--warning-bg)', 
                            color: 'var(--warning)' 
                          }}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          خطر
                        </span>
                      )}
                    </div>
                    <div className="col-span-1 text-center">
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => openCreditDialog(customer)}
                          title="ضبط الائتمان"
                          className="w-8 h-8 rounded flex items-center justify-center transition-all"
                          style={{ 
                            backgroundColor: 'var(--warning-bg)', 
                            color: 'var(--warning)' 
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--warning)';
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--warning-bg)';
                            e.currentTarget.style.color = 'var(--warning)';
                          }}
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditDialog(customer)}
                          title="تعديل البيانات"
                          className="w-8 h-8 rounded flex items-center justify-center transition-all"
                          style={{ 
                            backgroundColor: 'var(--info-bg)', 
                            color: 'var(--info)' 
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--info)';
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--info-bg)';
                            e.currentTarget.style.color = 'var(--info)';
                          }}
                        >
                          <Edit className="w-4 h-4" />
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                <Input
                  label="حد الائتمان"
                  type="number"
                  value={formData.credit_limit}
                  onChange={(e) =>
                    setFormData({ 
                      ...formData, 
                      credit_limit: Number(e.target.value),
                      credit_available: Number(e.target.value) - (editingCustomer?.credit_used || 0)
                    })
                  }
                  placeholder="5000"
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
                  value={formData.notes}
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
      
      {/* Credit Adjustment Dialog */}
      {showCreditDialog && editingCustomer && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'var(--overlay-bg)' }}
        >
          <div 
            className="w-full max-w-[600px] rounded-lg overflow-hidden transition-theme"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div 
              className="p-4 flex items-center justify-between"
              style={{ backgroundColor: 'var(--warning)' }}
            >
              <div>
                <h3 className="text-[21px] font-bold" style={{ color: 'white' }}>ضبط الائتمان</h3>
                <p className="text-[14px]" style={{ color: 'rgba(255,255,255,0.8)' }}>{editingCustomer.name}</p>
              </div>
              <button
                onClick={() => setShowCreditDialog(false)}
                className="w-8 h-8 bg-white/20 rounded hover:bg-white/30 flex items-center justify-center"
              >
                <X className="w-5 h-5" style={{ color: 'white' }} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Credit Info */}
              <div 
                className="grid grid-cols-3 gap-4 p-4 rounded-lg transition-theme"
                style={{ backgroundColor: 'var(--surface-1)' }}
              >
                <div className="text-center">
                  <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>المستخدم</p>
                  <p className="text-[20px] font-bold" style={{ color: 'var(--warning)' }}>
                    {formatCurrency(editingCustomer.credit_used)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>المتاح</p>
                  <p className="text-[20px] font-bold" style={{
                    color: editingCustomer.credit_available > 500 ? 'var(--primary)'
                      : editingCustomer.credit_available > 0 ? 'var(--accent-orange)'
                      : 'var(--danger)'
                  }}>
                    {formatCurrency(editingCustomer.credit_available)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>الحد الأقصى</p>
                  <p className="text-[20px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>
                    {formatCurrency(editingCustomer.credit_limit)}
                  </p>
                </div>
              </div>
              
              {/* Adjustment Type */}
              <div>
                <label className="block text-[14px] font-medium mb-2 transition-theme" style={{ color: 'var(--text-primary)' }}>نوع التعديل</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setCreditAdjustment({ ...creditAdjustment, adjustment_type: 'pay' })}
                    className="flex-1 h-[44px] rounded-lg font-medium transition-all"
                    style={{
                      backgroundColor: creditAdjustment.adjustment_type === 'pay' ? 'var(--primary)' : 'var(--primary-light)',
                      color: creditAdjustment.adjustment_type === 'pay' ? 'white' : 'var(--primary)'
                    }}
                  >
                    دفع (تقليل الدين)
                  </button>
                  <button
                    onClick={() => setCreditAdjustment({ ...creditAdjustment, adjustment_type: 'increase' })}
                    className="flex-1 h-[44px] rounded-lg font-medium transition-all"
                    style={{
                      backgroundColor: creditAdjustment.adjustment_type === 'increase' ? 'var(--warning)' : 'var(--warning-bg)',
                      color: creditAdjustment.adjustment_type === 'increase' ? 'white' : 'var(--warning)'
                    }}
                  >
                    زيادة ائتمان
                  </button>
                  <button
                    onClick={() => setCreditAdjustment({ ...creditAdjustment, adjustment_type: 'decrease' })}
                    className="flex-1 h-[44px] rounded-lg font-medium transition-all"
                    style={{
                      backgroundColor: creditAdjustment.adjustment_type === 'decrease' ? 'var(--danger)' : 'var(--danger-bg)',
                      color: creditAdjustment.adjustment_type === 'decrease' ? 'white' : 'var(--danger)'
                    }}
                  >
                    تقليل ائتمان
                  </button>
                </div>
              </div>
              
              {/* Amount */}
              <Input
                label={`المبلغ (${
                  creditAdjustment.adjustment_type === 'pay' ? 'الدفع' :
                  creditAdjustment.adjustment_type === 'increase' ? 'الزيادة' :
                  'التقليل'
                }) *`}
                type="number"
                value={creditAdjustment.amount}
                onChange={(e) => setCreditAdjustment({ ...creditAdjustment, amount: Number(e.target.value) })}
                placeholder="0"
              />
              
              {/* Reason */}
              <div>
                <label className="block text-[14px] font-medium mb-2 transition-theme" style={{ color: 'var(--text-primary)' }}>السبب</label>
                <textarea
                  value={creditAdjustment.reason}
                  onChange={(e) => setCreditAdjustment({ ...creditAdjustment, reason: e.target.value })}
                  placeholder="سبب التعديل (اختياري)"
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
              className="p-4 flex gap-3 transition-theme"
              style={{ backgroundColor: 'var(--surface-1)' }}
            >
              <Button 
                variant="ghost" 
                onClick={() => setShowCreditDialog(false)}
                fullWidth
              >
                إلغاء
              </Button>
              <Button 
                variant="warning" 
                onClick={handleCreditAdjustment}
                fullWidth
              >
                تطبيق التعديل
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
