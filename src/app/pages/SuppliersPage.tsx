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
import { usePermissions } from '../hooks/usePermissions';
import { formatCurrency } from '../utils/formatters';
import { notify } from '../utils/toast';
import {
  Search,
  Plus,
  Edit,
  Users,
  DollarSign,
  X,
  Trash2,
  Wallet,
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
  const { suppliers, loadSuppliers } = useShop();
  const { canAddSuppliers, canEditSuppliers, canDeleteSuppliers } = usePermissions();
  const api = (window as any).electronAPI;
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string }>({});
  
  // Form data state
  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  
  // Pay debt modal states
  const [supplierToPay, setSupplierToPay] = useState<Supplier | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.phone.includes(searchQuery);
    return matchesSearch;
  });

  // Calculate stats
  const totalSuppliers = suppliers.length;
  const totalDebt = suppliers.reduce((sum, s) => sum + (Number((s as any).current_balance || s.debt_used) || 0), 0);

  const handleSave = async () => {
    const errors: { name?: string; phone?: string } = {};
    if (!formData.name?.trim()) {
      errors.name = 'اسم المورد مطلوب';
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

    const saveData = { ...formData };
    delete (saveData as any).debt_limit;
    delete (saveData as any).debt_remaining;
    delete (saveData as any).trust_level;
    delete (saveData as any).is_blacklisted;

    try {
      if (editingSupplier) {
        await api.suppliers.update(editingSupplier.id, saveData);
        notify.success('تم تحديث بيانات المورد');
      } else {
        await api.suppliers.create(saveData);
        notify.success('تم إضافة المورد بنجاح');
      }
      await loadSuppliers();
    } catch(e: any) { notify.error(e.message); }

    closeDialog();
  };

  const handleDelete = async () => {
    if (!supplierToDelete) return;
    setIsDeleting(true);
    try {
      await api.suppliers.delete(supplierToDelete.id);
      notify.success('تم حذف المورد بنجاح');
      await loadSuppliers();
    } catch (e: any) {
      notify.error(e.message || 'فشل في حذف المورد');
    } finally {
      setIsDeleting(false);
      setSupplierToDelete(null);
    }
  };

  const confirmDelete = () => {
    handleDelete();
  };

  const cancelDelete = () => {
    setSupplierToDelete(null);
  };
  
  // Pay debt handlers
  const handlePayDebtClick = (supplier: Supplier) => {
    if (((supplier as any).current_balance || (supplier as any).debt_used || 0) <= 0) {
      notify.error('لا يوجد مبلغ مستحق لهذا المورد');
      return;
    }
    setSupplierToPay(supplier);
    setPaymentAmount('');
    setPaymentError('');
  };

  const cancelPayDebt = () => {
    setSupplierToPay(null);
    setPaymentAmount('');
    setPaymentError('');
  };

  const confirmPayDebt = async () => {
    if (!supplierToPay) return;
    
    const amount = Number(paymentAmount);
    const currentDebt = ((supplierToPay as any).current_balance || (supplierToPay as any).debt_used || 0);
    
    if (!paymentAmount || isNaN(amount) || amount <= 0) {
      setPaymentError('يرجى إدخال مبلغ صحيح أكبر من صفر');
      return;
    }
    
    if (amount > currentDebt) {
      setPaymentError(`المبلغ المدخل (${amount}) أكبر من المبلغ المستحق (${currentDebt})`);
      return;
    }
    
    setIsProcessingPayment(true);
    try {
      await api.payments.create({
        payment_direction: 'سداد',
        party_type: 'supplier',
        party_id: supplierToPay.id,
        party_name: supplierToPay.name,
        amount: amount,
        method: 'نقدي',
        user_id: 'user-admin-001',
        notes: 'دفع لتقليل المبلغ المستحق للمورد'
      });
      
      notify.success(`تم الدفع بمبلغ ${amount} جنيه بنجاح`);
      await loadSuppliers();
      cancelPayDebt();
    } catch (e: any) {
      notify.error(e.message || 'فشل في عملية الدفع');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const openEditDialog = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email,
      address: (supplier as any).address,
    });
    setShowAddForm(true);
  };

  const closeDialog = () => {
    setShowAddForm(false);
    setEditingSupplier(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
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
            variant="info"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 min-w-[48px] justify-center"
            title={showAddForm ? 'إلغاء' : 'إضافة مورد'}
            disabled={!canAddSuppliers}
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

        {/* Stats - Only 2 stats */}
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
              <p className="text-[14px] transition-theme" style={{ color: 'var(--text-muted)' }}>المبلغ المستحق</p>
              <p className="text-[26px] font-bold" style={{ color: 'var(--warning)' }}>{formatCurrency(totalDebt)}</p>
            </div>
          </div>
        </div>

        {/* Suppliers Table - Simplified */}
        <div 
          className="rounded-lg overflow-hidden transition-theme overflow-x-auto"
          style={{ backgroundColor: 'var(--card-bg)' }}
        >
          <div 
            className="grid grid-cols-6 gap-4 p-4 text-[14px] font-medium transition-theme"
            style={{ 
              backgroundColor: 'var(--surface-1)',
              color: 'var(--text-muted)'
            }}
          >
            <div className="col-span-2">الاسم</div>
            <div className="col-span-2">التليفون</div>
            <div className="col-span-1 text-center">المبلغ المستحق</div>
            <div className="col-span-1 text-center">الإجراء</div>
          </div>

          <div 
            className="divide-y transition-theme"
            style={{ borderColor: 'var(--surface-1)' }}
          >
            {filteredSuppliers.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-[16px] transition-theme" style={{ color: 'var(--text-muted)' }}>لا يوجد موردين</p>
                <p className="text-[13px] mt-1 transition-theme" style={{ color: 'var(--text-muted)' }}>ابدأ بإضافة مورد جديد</p>
              </div>
            ) : (
              filteredSuppliers.map((supplier) => {
                return (
                  <div
                    key={supplier.id}
                    className="grid grid-cols-6 gap-4 p-4 items-center transition-all"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--surface-1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
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
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => handlePayDebtClick(supplier)}
                          title="دفع للمورد"
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
                          onClick={() => canEditSuppliers && openEditDialog(supplier)}
                          disabled={!canEditSuppliers}
                          title="تعديل البيانات"
                          className="w-8 h-8 rounded flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ 
                            backgroundColor: canEditSuppliers ? 'var(--info-bg)' : 'var(--surface-2)', 
                            color: canEditSuppliers ? 'var(--info)' : 'var(--text-muted)' 
                          }}
                          onMouseEnter={(e) => {
                            if (canEditSuppliers) {
                              e.currentTarget.style.backgroundColor = 'var(--info)';
                              e.currentTarget.style.color = 'white';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (canEditSuppliers) {
                              e.currentTarget.style.backgroundColor = 'var(--info-bg)';
                              e.currentTarget.style.color = 'var(--info)';
                            }
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => canDeleteSuppliers && setSupplierToDelete(supplier)}
                          disabled={!canDeleteSuppliers}
                          title="حذف المورد"
                          className="w-8 h-8 rounded flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ 
                            backgroundColor: canDeleteSuppliers ? 'var(--danger-bg)' : 'var(--surface-2)', 
                            color: canDeleteSuppliers ? 'var(--danger)' : 'var(--text-muted)' 
                          }}
                          onMouseEnter={(e) => {
                            if (canDeleteSuppliers) {
                              e.currentTarget.style.backgroundColor = 'var(--danger)';
                              e.currentTarget.style.color = 'white';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (canDeleteSuppliers) {
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

      {/* Delete Confirmation Modal */}
      {supplierToDelete && (
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
              style={{ backgroundColor: 'var(--danger)' }}
            >
              <Trash2 className="w-8 h-8 text-white" />
            </div>
            <div className="p-6 text-center">
              <h3 className="text-[18px] font-bold mb-2 transition-theme" style={{ color: 'var(--text-primary)' }}>
                تأكيد الحذف
              </h3>
              <p className="text-[14px] mb-4 transition-theme" style={{ color: 'var(--text-muted)' }}>
                هل أنت متأكد من حذف المورد "{supplierToDelete.name}"؟
              </p>
              {((supplierToDelete as any).current_balance || supplierToDelete.debt_used || 0) > 0 && (
                <p className="text-[12px] mb-4" style={{ color: 'var(--warning)' }}>
                  ⚠️ يوجد مبلغ مستحق على هذا المورد: {formatCurrency((supplierToDelete as any).current_balance || supplierToDelete.debt_used || 0)}
                </p>
              )}
              <div className="flex gap-3">
                <Button 
                  variant="ghost" 
                  onClick={cancelDelete} 
                  fullWidth 
                  disabled={isDeleting}
                >
                  إلغاء
                </Button>
                <Button 
                  variant="danger" 
                  onClick={confirmDelete} 
                  fullWidth 
                  disabled={isDeleting}
                >
                  {isDeleting ? 'جاري الحذف...' : 'حذف'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pay Debt Modal */}
      {supplierToPay && (
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
                دفع للمورد
              </h3>
              <p className="text-[14px] mb-4 transition-theme text-center" style={{ color: 'var(--text-muted)' }}>
                المورد: {supplierToPay.name}
              </p>
              <p className="text-[14px] mb-4 transition-theme text-center" style={{ color: 'var(--warning)' }}>
                المبلغ المستحق: {formatCurrency(((supplierToPay as any).current_balance || (supplierToPay as any).debt_used || 0))}
              </p>
              
              <div className="mb-4">
                <label className="block text-[14px] font-medium mb-2 transition-theme" style={{ color: 'var(--text-primary)' }}>
                  مبلغ الدفع
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
                  onClick={cancelPayDebt} 
                  fullWidth 
                  disabled={isProcessingPayment}
                >
                  إلغاء
                </Button>
                <Button 
                  variant="success" 
                  onClick={confirmPayDebt} 
                  fullWidth 
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? 'جاري المعالجة...' : 'تأكيد الدفع'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
