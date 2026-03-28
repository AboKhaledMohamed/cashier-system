/**
 * صفحة إدارة الموردين
 * Suppliers Management Page
 * 
 * المميزات:
 * ✅ إدارة بيانات الموردين
 * ✅ تتبع الديون (الحد الأقصى، المستخدم، المتبقي)
 * ✅ تصنيف الثقة
 * ✅ قائمة الموردين الممنوعين
 * ✅ إضافة مورد جديد
 * ✅ تقارير إحصائية
 */

import { useState } from 'react';
import Header from '../components/Header';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useShop } from '../context/ShopContext';
import { formatCurrency } from '../utils/formatters';
import { notify } from '../utils/toast';
import {
  Search,
  Plus,
  Edit,
  Users,
  DollarSign,
  X,
  AlertTriangle,
  Lock,
  CreditCard,
} from 'lucide-react';
import type { Supplier } from '../types/small-shop.types';

const trustLevelLabels: Record<string, { label: string; color: string }> = {
  excellent: { label: 'ممتاز', color: '#2ECC71' },
  good: { label: 'جيد', color: '#3498DB' },
  average: { label: 'متوسط', color: '#F1C40F' },
  poor: { label: 'ضعيف', color: '#E67E22' },
  bad: { label: 'سيء', color: '#E74C3C' },
};

export default function SuppliersPage() {
  const { suppliers, loadSuppliers, currentUser } = useShop();
  const api = (window as any).electronAPI;
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBlacklist, setFilterBlacklist] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string }>({});
  
  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: '',
    phone: '',
    email: '',
    address: '',
    debt_limit: 10000,
    debt_used: 0,
    debt_remaining: 10000,
    trust_level: 'average',
    total_purchases: 0,
    total_purchases_amount: 0,
    is_active: true,
    is_blacklisted: false,
    notes: '',
  });
  
  const [debtAdjustment, setDebtAdjustment] = useState<{
    adjustment_type: 'increase' | 'decrease' | 'pay';
    amount: number;
    reason: string;
  }>({
    adjustment_type: 'pay',
    amount: 0,
    reason: '',
  });
  const [showDebtDialog, setShowDebtDialog] = useState(false);

  // Filter suppliers
  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.phone.includes(searchQuery);
    const matchesBlacklist = !filterBlacklist || supplier.is_blacklisted;
    return matchesSearch && matchesBlacklist;
  });

  // Calculate stats
  const totalSuppliers = suppliers.length;
  const totalDebt = suppliers.reduce((sum, s) => sum + (Number((s as any).current_balance || s.debt_used) || 0), 0);
  const blacklistedCount = suppliers.filter((s) => s.is_blacklisted).length;
  const highRiskCount = suppliers.filter(
    (s) => s.debt_remaining <= s.debt_limit * 0.2 && !s.is_blacklisted
  ).length;

  const handleSave = async () => {
    const errors: { name?: string; phone?: string } = {};
    if (!formData.name?.trim()) errors.name = 'اسم المورد مطلوب';
    if (!formData.phone?.trim()) errors.phone = 'رقم التليفون مطلوب';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      if (editingSupplier) {
        await api.suppliers.update(editingSupplier.id, formData);
        notify.success('تم تحديث بيانات المورد');
      } else {
        await api.suppliers.create(formData);
        notify.success('تم إضافة المورد بنجاح');
      }
      await loadSuppliers();
    } catch(e: any) { notify.error(e.message); }

    closeDialog();
  };

  const handleDebtAdjustment = async () => {
    if (!editingSupplier || debtAdjustment.amount <= 0) {
      notify.error('يرجى إدخال مبلغ صحيح');
      return;
    }

    try {
      if (debtAdjustment.adjustment_type === 'pay') {
        await api.payments.create({
          payment_direction: 'سداد',
          party_type: 'supplier',
          party_id: editingSupplier.id,
          party_name: editingSupplier.name,
          amount: debtAdjustment.amount,
          method: 'نقدي',
          user_id: currentUser?.id || 'user-admin-001',
          notes: debtAdjustment.reason,
        });
      }
      await loadSuppliers();
      notify.success('تم تعديل الديون بنجاح');
    } catch(e: any) { notify.error(e.message); }
    setShowDebtDialog(false);
    setDebtAdjustment({ adjustment_type: 'pay', amount: 0, reason: '' });
  };

  const openEditDialog = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData(supplier);
    setShowAddForm(true);
  };

  const openDebtDialog = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowDebtDialog(true);
  };

  const closeDialog = () => {
    setShowAddForm(false);
    setEditingSupplier(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      debt_limit: 10000,
      debt_used: 0,
      debt_remaining: 10000,
      trust_level: 'average',
      total_purchases: 0,
      total_purchases_amount: 0,
      is_active: true,
      is_blacklisted: false,
      notes: '',
    });
    setFormErrors({});
  };

  const getStatusColor = (status: string) => {
    if (status === 'excellent') return '#2ECC71';
    if (status === 'good') return '#3498DB';
    if (status === 'average') return '#F1C40F';
    if (status === 'poor') return '#E67E22';
    return '#E74C3C';
  };

  return (
    <div 
      className="min-h-screen transition-theme"
      style={{ backgroundColor: 'var(--page-bg)' }}
    >
      <Header title="إدارة الموردين" />

      <div className="p-7 space-y-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="ابحث عن مورد (اسم أو تليفون)"
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
            title={showAddForm ? 'إلغاء' : 'إضافة مورد'}
          >
            {showAddForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {!showAddForm && 'إضافة مورد'}
          </Button>
        </div>

        {/* Inline Add Supplier Form */}
        {showAddForm && (
          <div 
            className="rounded-lg p-6 border-2 transition-theme"
            style={{ 
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--info)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>
                {editingSupplier ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}
              </h3>
              <span className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>أدخل البيانات الأساسية أولاً</span>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Input
                label="اسم المورد *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="أدخل اسم المورد"
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
                label="حد الدين"
                type="number"
                value={formData.debt_limit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    debt_limit: Number(e.target.value),
                    debt_remaining: Number(e.target.value) - (editingSupplier?.debt_used || 0),
                  })
                }
                placeholder="10000"
              />
              <div>
                <label className="block text-[14px] font-medium mb-2 transition-theme" style={{ color: 'var(--text-primary)' }}>العنوان</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="عنوان المورد..."
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
              <Button variant="ghost" onClick={closeDialog}>
                إلغاء
              </Button>
              <Button variant="success" onClick={handleSave}>
                {editingSupplier ? 'حفظ التعديلات' : 'إضافة المورد'}
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
              <p className="text-[14px] transition-theme" style={{ color: 'var(--text-muted)' }}>إجمالي الموردين</p>
              <p className="text-[26px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>{totalSuppliers}</p>
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
              <p className="text-[26px] font-bold" style={{ color: 'var(--warning)' }}>{formatCurrency(totalDebt)}</p>
            </div>
          </div>

          <div 
            className="rounded-lg p-5 flex items-center gap-4 transition-theme"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--accent-orange-bg)' }}
            >
              <AlertTriangle className="w-6 h-6" style={{ color: 'var(--accent-orange)' }} />
            </div>
            <div>
              <p className="text-[14px] transition-theme" style={{ color: 'var(--text-muted)' }}>خطر مالي (نسبة منخفضة)</p>
              <p className="text-[26px] font-bold" style={{ color: 'var(--accent-orange)' }}>{highRiskCount}</p>
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
              <p className="text-[14px] transition-theme" style={{ color: 'var(--text-muted)' }}>موردين ممنوعين</p>
              <p className="text-[26px] font-bold" style={{ color: 'var(--danger)' }}>{blacklistedCount}</p>
            </div>
          </div>
        </div>

        {/* Suppliers Table */}
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
            <div className="col-span-1 text-center">الديون</div>
            <div className="col-span-1 text-center">المتبقي</div>
            <div className="col-span-1 text-center">الحد</div>
            <div className="col-span-2">الثقة</div>
            <div className="col-span-2">الحالة</div>
            <div className="col-span-1 text-center">الإجراء</div>
          </div>

          <div 
            className="divide-y transition-theme"
            style={{ borderColor: 'var(--surface-1)' }}
          >
            {filteredSuppliers.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-[16px] transition-theme" style={{ color: 'var(--text-muted)' }}>لا يوجد موردين</p>
                <p className="text-[13px] mt-1 transition-theme" style={{ color: 'var(--text-muted)' }}>ابدأ بإضافة مورد جديد من زر إضافة مورد</p>
              </div>
            ) : (
              filteredSuppliers.map((supplier) => {
                const trustColor = getStatusColor(supplier.trust_level);

                return (
                  <div
                    key={supplier.id}
                    className="grid grid-cols-12 gap-4 p-4 items-center transition-all"
                    style={{
                      backgroundColor: supplier.is_blacklisted ? 'var(--danger-bg)' : 'transparent',
                      opacity: supplier.is_blacklisted ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!supplier.is_blacklisted) {
                        e.currentTarget.style.backgroundColor = 'var(--surface-1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!supplier.is_blacklisted) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div className="col-span-2">
                      <p className="text-[14px] font-medium transition-theme" style={{ color: 'var(--text-primary)' }}>{supplier.name}</p>
                      <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>
                        {supplier.address || 'بدون عنوان'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[13px] font-mono transition-theme" style={{ color: 'var(--text-muted)' }}>{supplier.phone}</p>
                    </div>
                    <div className="col-span-1 text-center">
                      <p className="text-[14px] font-bold" style={{ color: 'var(--warning)' }}>
                        {formatCurrency((supplier as any).current_balance || supplier.debt_used || 0)}
                      </p>
                    </div>
                    <div className="col-span-1 text-center">
                      <p
                        className="text-[14px] font-bold"
                        style={{
                          color: ((supplier.debt_remaining ?? (supplier.debt_limit - ((supplier as any).current_balance || 0))) || 0) > 500 ? 'var(--primary)' : 
                          ((supplier.debt_remaining ?? (supplier.debt_limit - ((supplier as any).current_balance || 0))) || 0) > 0 ? 'var(--accent-orange)' : 'var(--danger)'
                        }}
                      >
                        {formatCurrency((supplier.debt_remaining ?? (supplier.debt_limit - ((supplier as any).current_balance || 0))) || 0)}
                      </p>
                    </div>
                    <div className="col-span-1 text-center">
                      <p className="text-[13px] transition-theme" style={{ color: 'var(--text-muted)' }}>
                        {formatCurrency(supplier.debt_limit)}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span
                        className="px-3 py-1 rounded-full text-[12px] font-medium"
                        style={{
                          color: trustColor,
                          backgroundColor: `${trustColor}20`,
                        }}
                      >
                        {trustLevelLabels[supplier.trust_level]?.label || supplier.trust_level}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      {supplier.is_blacklisted && (
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
                      {supplier.debt_remaining <= supplier.debt_limit * 0.2 && !supplier.is_blacklisted && (
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
                          onClick={() => openDebtDialog(supplier)}
                          title="ضبط الديون"
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
                          onClick={() => openEditDialog(supplier)}
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

      {/* Debt Adjustment Dialog */}
      {showDebtDialog && editingSupplier && (
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
                <h3 className="text-[21px] font-bold" style={{ color: 'white' }}>ضبط الديون</h3>
                <p className="text-[14px]" style={{ color: 'rgba(255,255,255,0.8)' }}>{editingSupplier.name}</p>
              </div>
              <button
                onClick={() => setShowDebtDialog(false)}
                className="w-8 h-8 bg-white/20 rounded hover:bg-white/30 flex items-center justify-center"
              >
                <X className="w-5 h-5" style={{ color: 'white' }} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Debt Info */}
              <div 
                className="grid grid-cols-3 gap-4 p-4 rounded-lg transition-theme"
                style={{ backgroundColor: 'var(--surface-1)' }}
              >
                <div className="text-center">
                  <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>الديون</p>
                  <p className="text-[20px] font-bold" style={{ color: 'var(--warning)' }}>{formatCurrency((editingSupplier as any).current_balance || editingSupplier.debt_used || 0)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>المتبقي</p>
                  <p
                    className="text-[20px] font-bold"
                    style={{
                      color: ((editingSupplier.debt_remaining ?? (editingSupplier.debt_limit - ((editingSupplier as any).current_balance || 0))) || 0) > 500 ? 'var(--primary)' : 
                      ((editingSupplier.debt_remaining ?? (editingSupplier.debt_limit - ((editingSupplier as any).current_balance || 0))) || 0) > 0 ? 'var(--accent-orange)' : 'var(--danger)'
                    }}
                  >
                    {formatCurrency((editingSupplier.debt_remaining ?? (editingSupplier.debt_limit - ((editingSupplier as any).current_balance || 0))) || 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>الحد الأقصى</p>
                  <p className="text-[20px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>{formatCurrency(editingSupplier.debt_limit || 0)}</p>
                </div>
              </div>

              {/* Adjustment Type */}
              <div>
                <label className="block text-[14px] font-medium mb-2 transition-theme" style={{ color: 'var(--text-primary)' }}>نوع التعديل</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDebtAdjustment({ ...debtAdjustment, adjustment_type: 'pay' })}
                    className="flex-1 h-[44px] rounded-lg font-medium transition-all"
                    style={{
                      backgroundColor: debtAdjustment.adjustment_type === 'pay' ? 'var(--primary)' : 'var(--primary-light)',
                      color: debtAdjustment.adjustment_type === 'pay' ? 'white' : 'var(--primary)'
                    }}
                  >
                    دفع (تقليل الدين)
                  </button>
                  <button
                    onClick={() => setDebtAdjustment({ ...debtAdjustment, adjustment_type: 'increase' })}
                    className="flex-1 h-[44px] rounded-lg font-medium transition-all"
                    style={{
                      backgroundColor: debtAdjustment.adjustment_type === 'increase' ? 'var(--warning)' : 'var(--warning-bg)',
                      color: debtAdjustment.adjustment_type === 'increase' ? 'white' : 'var(--warning)'
                    }}
                  >
                    زيادة دين
                  </button>
                </div>
              </div>

              {/* Amount */}
              <Input
                label={`المبلغ (${debtAdjustment.adjustment_type === 'pay' ? 'الدفع' : 'الزيادة'}) *`}
                type="number"
                value={debtAdjustment.amount}
                onChange={(e) => setDebtAdjustment({ ...debtAdjustment, amount: Number(e.target.value) })}
                placeholder="0"
              />

              {/* Reason */}
              <div>
                <label className="block text-[14px] font-medium mb-2 transition-theme" style={{ color: 'var(--text-primary)' }}>السبب</label>
                <textarea
                  value={debtAdjustment.reason}
                  onChange={(e) => setDebtAdjustment({ ...debtAdjustment, reason: e.target.value })}
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
              <Button variant="ghost" onClick={() => setShowDebtDialog(false)} fullWidth>
                إلغاء
              </Button>
              <Button variant="warning" onClick={handleDebtAdjustment} fullWidth>
                تطبيق التعديل
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
