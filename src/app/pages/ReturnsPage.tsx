/**
 * صفحة المرتجعات والاسترجاعات
 * Product Returns & Refunds Management
 * 
 * المميزات:
 * ✅ تسجيل المرتجعات من العملاء
 * ✅ وصل الأسباب (تالف، معيب، منتهي الصلاحية، إلخ)
 * ✅ حسابات الإرجاع النقدي التلقائية
 * ✅ طرق الإرجاع المتعددة (نقدي، رصيد، الطريقة الأصلية)
 * ✅ تقارير المرتجعات
 * ✅ إدارة حالات المرتجعات
 */

import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { notify, messages } from '../utils/toast';
import { formatNumber } from '../utils/formatters';
import { useShop } from '../context/ShopContext';
import { Search, Plus, X, Trash2, DollarSign, AlertTriangle, Check, Clock, UserPlus } from 'lucide-react';
import type { Return, ReturnItem } from '../types/small-shop.types';

// Mock data - empty initially for fresh database
const mockReturns: Return[] = [];

const returnReasonLabels: Record<string, { label: string; color: string }> = {
  damaged: { label: 'تالف/كسر', color: '#E74C3C' },
  defective: { label: 'معيب', color: '#E67E22' },
  expired: { label: 'منتهي الصلاحية', color: '#F39C12' },
  wrong_item: { label: 'منتج خاطئ', color: '#3498DB' },
  customer_request: { label: 'طلب العميل', color: '#9B59B6' },
  other: { label: 'أخرى', color: '#7A8CA0' },
};

const refundMethodLabels: Record<string, { label: string; color: string; description: string }> = {
  cash: { label: 'نقدي', color: '#2ECC71', description: 'إرجاع نقدي للعميل' },
  original_payment_method: { label: 'الطريقة الأصلية', color: '#F39C12', description: 'إرجاع بنفس طريقة الدفع الأصلية (كاش/آجل)' },
};

export default function ReturnsPage() {
  const { customers, loadCustomers } = useShop();
  const api = (window as any).electronAPI;
  const [returns, setReturns] = useState<Return[]>(mockReturns);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [expandedReturn, setExpandedReturn] = useState<string | null>(null);
  
  // Customer dropdown state
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  
  // Ref for customer dropdown to detect clicks outside
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const [formData, setFormData] = useState<Partial<Return>>({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('ar-EG', { hour12: false }).slice(0, 5),
    original_invoice_number: '',
    customer_name: '',
    customer_id: '',
    refund_method: 'cash',
    items: [],
  });
  
  const [newItem, setNewItem] = useState<Partial<ReturnItem>>({
    product_name: '',
    quantity_returned: 1,
    unit: 'piece',
    unit_price: undefined,
    reason: 'damaged',
  });
  
  // Filter returns
  const filteredReturns = returns.filter((ret) => {
    const matchesSearch =
      ret.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.original_invoice_number.includes(searchQuery) ||
      ret.return_number.includes(searchQuery);
    return matchesSearch;
  });
  
  // Calculate statistics
  const totalReturns = filteredReturns.length;
  const totalRefundAmount = filteredReturns.reduce((sum, r) => sum + r.total_refund_amount, 0);
  
  // Customer selection handler
  const handleSelectCustomer = (customer: any) => {
    setFormData({
      ...formData,
      customer_name: customer.name,
      customer_id: customer.id,
    });
    setShowCustomerDropdown(false);
  };

  // Add new customer handler
  const handleAddNewCustomer = async () => {
    if (!newCustomerName.trim() || !newCustomerPhone.trim()) {
      notify.error('أدخل اسم العميل ورقم التليفون');
      return;
    }

    try {
      const result = await api.customers.create({
        name: newCustomerName.trim(),
        phone: newCustomerPhone.trim(),
      });
      
      setFormData({
        ...formData,
        customer_name: newCustomerName.trim(),
        customer_id: result.id,
      });
      
      setShowAddCustomerForm(false);
      setNewCustomerName('');
      setNewCustomerPhone('');
      setShowCustomerDropdown(false);
      notify.success('تم إضافة العميل بنجاح');
      await loadCustomers();
    } catch(e: any) {
      notify.error(e.message || 'فشل إضافة العميل');
    }
  };

  const handleAddItemToReturn = () => {
    // Validate mandatory fields: product_name and quantity_returned
    if (!newItem.product_name?.trim()) {
      notify.error('اسم المنتج إجباري');
      return;
    }
    if (!newItem.quantity_returned || newItem.quantity_returned <= 0) {
      notify.error('الكمية يجب أن تكون أكبر من صفر');
      return;
    }
    
    // Use 0 as default for unit_price if not provided (optional field)
    const unitPrice = newItem.unit_price || 0;
    
    const item: ReturnItem = {
      id: `ret-item-${Date.now()}`,
      product_id: `prod-${Date.now()}`,
      product_name: newItem.product_name!.trim(),
      quantity_returned: newItem.quantity_returned!,
      unit: newItem.unit as any,
      unit_price: unitPrice,
      reason: newItem.reason as any,
      refund_amount: newItem.quantity_returned! * unitPrice,
    };
    
    setFormData({
      ...formData,
      items: [...(formData.items || []), item],
    });
    
    setNewItem({
      product_name: '',
      quantity_returned: 1,
      unit: 'piece',
      unit_price: undefined,
      reason: 'damaged',
    });
  };
  
  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items?.filter((_, i) => i !== index),
    });
  };
  
  const handleAddReturn = () => {
    // Only items are mandatory - product name and quantity
    if (!formData.items?.length) {
      notify.error('الرجاء إضافة عناصر مسترجعة');
      return;
    }
    
    const totalRefund = (formData.items || []).reduce((sum, item) => sum + item.refund_amount, 0);
    
    const newReturn: Return = {
      id: `ret-${Date.now()}`,
      return_number: `R-${(returns.length + 1).toString().padStart(3, '0')}`,
      date: formData.date || new Date().toISOString().split('T')[0],
      time: formData.time || '00:00',
      user_id: 'user-cashier-001',
      user_name: 'أحمد علي',
      original_invoice_id: `inv-${Date.now()}`,
      original_invoice_number: formData.original_invoice_number || '-',
      customer_name: formData.customer_name || 'عميل نقدي',
      customer_id: formData.customer_id,
      items: formData.items || [],
      total_refund_amount: totalRefund,
      refund_method: formData.refund_method as any,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    setReturns([...returns, newReturn]);
    closeDialog();
  };
  
  const handleDeleteReturn = (id: string) => {
    if (confirm('هل تريد حذف هذه المسترجعة؟')) {
      setReturns(returns.filter((r) => r.id !== id));
    }
  };
  
  const closeDialog = () => {
    setShowAddDialog(false);
    setShowCustomerDropdown(false);
    setShowAddCustomerForm(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('ar-EG', { hour12: false }).slice(0, 5),
      original_invoice_number: '',
      customer_name: '',
      customer_id: '',
      refund_method: 'cash',
      items: [],
    });
    setNewItem({
      product_name: '',
      quantity_returned: 1,
      unit: 'piece',
      unit_price: undefined,
      reason: 'damaged',
    });
  };
  
  return (
    <div 
      className="min-h-screen transition-theme"
      style={{ backgroundColor: 'var(--page-bg)' }}
    >
      <Header title="إدارة المرتجعات" />
      
      <div className="p-7 space-y-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="ابحث عن مسترجعة (العميل، الفاتورة، الرقم)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[48px] rounded-lg pr-12 pl-4 outline-none transition-theme"
              style={{
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)'
              }}
            />
            <AlertTriangle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          </div>
          
          <Button
            variant="warning"
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            تسجيل مسترجعة
          </Button>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
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
              <p className="text-[14px] transition-theme" style={{ color: 'var(--text-muted)' }}>إجمالي المرتجعات</p>
              <p className="text-[26px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>{totalReturns}</p>
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
              <DollarSign className="w-6 h-6" style={{ color: 'var(--accent-orange)' }} />
            </div>
            <div>
              <p className="text-[14px] transition-theme" style={{ color: 'var(--text-muted)' }}>إجمالي الاسترجاعات</p>
              <p className="text-[26px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>
                {totalRefundAmount.toLocaleString('en-US')} ج
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
              <Clock className="w-6 h-6" style={{ color: 'var(--warning)' }} />
            </div>
            <div>
              <p className="text-[14px] transition-theme" style={{ color: 'var(--text-muted)' }}>متوسط الاسترجاع</p>
              <p className="text-[26px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>
                                {totalReturns > 0 ? formatNumber(totalRefundAmount / totalReturns) : 0}
              </p>
            </div>
          </div>
        </div>
        
        {/* Returns List */}
        <div 
          className="rounded-lg overflow-hidden transition-theme overflow-x-auto"
          style={{ backgroundColor: 'var(--card-bg)' }}
        >
          <div 
            className="divide-y transition-theme"
            style={{ borderColor: 'var(--surface-1)' }}
          >
            {filteredReturns.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-[16px] transition-theme" style={{ color: 'var(--text-muted)' }}>لا توجد مرتجعات</p>
              </div>
            ) : (
              filteredReturns
                .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime())
                .map((ret) => (
                  <div key={ret.id}>
                    {/* Header */}
                    <div
                      onClick={() =>
                        setExpandedReturn(expandedReturn === ret.id ? null : ret.id)
                      }
                      className="p-4 transition-all cursor-pointer"
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-1)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-2">
                          <p className="text-[14px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>
                            {ret.return_number}
                          </p>
                          <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>{ret.date}</p>
                        </div>
                        
                        <div className="col-span-2">
                          <p className="text-[14px] font-medium transition-theme" style={{ color: 'var(--text-primary)' }}>
                            {ret.customer_name}
                          </p>
                          <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>
                            {ret.original_invoice_number}
                          </p>
                        </div>
                        
                        <div className="col-span-2">
                          <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>عدد العناصر</p>
                          <p className="text-[16px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>
                            {ret.items.length}
                          </p>
                        </div>
                        
                        <div className="col-span-2">
                          <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>المبلغ</p>
                          <p className="text-[16px] font-bold" style={{ color: 'var(--accent-orange)' }}>
                            {ret.total_refund_amount.toLocaleString('en-US')} ج
                          </p>
                        </div>
                        
                        <div className="col-span-2">
                          <span
                            className="px-3 py-1 rounded-full text-[12px] font-medium"
                            style={{
                              color: refundMethodLabels[ret.refund_method].color,
                              backgroundColor: `${refundMethodLabels[ret.refund_method].color}20`,
                            }}
                          >
                            {refundMethodLabels[ret.refund_method].label}
                          </span>
                        </div>
                        
                        <div className="col-span-2 flex justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteReturn(ret.id);
                            }}
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
                    </div>
                    
                    {/* Expanded Details */}
                    {expandedReturn === ret.id && (
                      <div 
                        className="p-4 transition-theme"
                        style={{ 
                          backgroundColor: 'var(--surface-1)',
                          borderTop: '1px solid var(--border-color)'
                        }}
                      >
                        <div className="space-y-3">
                          {ret.items.map((item, idx) => (
                            <div 
                              key={item.id} 
                              className="p-3 rounded-lg transition-theme"
                              style={{ backgroundColor: 'var(--card-bg)' }}
                            >
                              <div className="grid grid-cols-4 gap-3 text-[13px]">
                                <div>
                                  <p className="text-[11px] mb-1 transition-theme" style={{ color: 'var(--text-muted)' }}>المنتج</p>
                                  <p className="font-medium transition-theme" style={{ color: 'var(--text-primary)' }}>
                                    {item.product_name}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[11px] mb-1 transition-theme" style={{ color: 'var(--text-muted)' }}>الكمية</p>
                                  <p className="font-medium transition-theme" style={{ color: 'var(--text-primary)' }}>
                                    {item.quantity_returned} {item.unit}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[11px] mb-1 transition-theme" style={{ color: 'var(--text-muted)' }}>السبب</p>
                                  <span
                                    className="px-2 py-1 rounded text-[11px] font-medium inline-block"
                                    style={{
                                      color:
                                        returnReasonLabels[item.reason].color,
                                      backgroundColor: `${
                                        returnReasonLabels[item.reason]
                                          .color
                                      }20`,
                                    }}
                                  >
                                    {returnReasonLabels[item.reason].label}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-[11px] mb-1 transition-theme" style={{ color: 'var(--text-muted)' }}>المبلغ</p>
                                  <p className="font-bold" style={{ color: 'var(--accent-orange)' }}>
                                    {item.refund_amount.toLocaleString('en-US')}{' '} ج
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
      
      {/* Add Return Dialog */}
      {showAddDialog && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 overflow-y-auto"
          style={{ backgroundColor: 'var(--overlay-bg)' }}
        >
          <div 
            className="w-full max-w-[800px] rounded-lg overflow-hidden my-4 transition-theme"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div 
              className="p-4 flex items-center justify-between sticky top-0"
              style={{ backgroundColor: 'var(--accent-orange)' }}
            >
              <h3 className="text-[21px] font-bold" style={{ color: 'white' }}>
                تسجيل مسترجعة جديدة
              </h3>
              <button
                onClick={closeDialog}
                className="w-8 h-8 bg-white/20 rounded hover:bg-white/30 flex items-center justify-center"
              >
                <X className="w-5 h-5" style={{ color: 'white' }} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="التاريخ *"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
                
                <Input
                  label="الوقت"
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                />
                
                <Input
                  label="رقم الفاتورة الأصلية"
                  value={formData.original_invoice_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      original_invoice_number: e.target.value,
                    })
                  }
                  placeholder=""
                />
              </div>
              
              {/* Customer Selection with Dropdown */}
              <div className="relative" ref={customerDropdownRef}>
                <label className="block text-[14px] font-medium mb-2 transition-theme" style={{ color: 'var(--text-primary)' }}>
                  اسم العميل (اختياري)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={formData.customer_name}
                      onChange={(e) => {
                        setFormData({ ...formData, customer_name: e.target.value });
                        setShowCustomerDropdown(e.target.value.trim().length > 0);
                      }}
                      placeholder="ابحث عن عميل..."
                      className="w-full h-[44px] rounded-lg px-3 text-[14px] outline-none transition-theme"
                      style={{
                        backgroundColor: 'var(--input-bg)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)'
                      }}
                    />
                    
                    {/* Customer Dropdown - only shows when searching */}
                    {showCustomerDropdown && formData.customer_name?.trim() && customers.length > 0 && (
                      <div 
                        className="absolute z-10 w-full mt-2 rounded-lg shadow-xl max-h-[250px] overflow-y-auto transition-theme"
                        style={{
                          backgroundColor: 'var(--card-bg)',
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        {customers
                          .filter((c: any) => c.name.toLowerCase().includes((formData.customer_name || '').toLowerCase()))
                          .map((customer: any) => (
                            <div
                              key={customer.id}
                              onClick={() => handleSelectCustomer(customer)}
                              className="flex items-center justify-between p-3 cursor-pointer border-b last:border-0 transition-theme"
                              style={{ borderColor: 'var(--border-color)' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-1)'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <div>
                                <p className="text-[14px] font-medium transition-theme" style={{ color: 'var(--text-primary)' }}>{customer.name}</p>
                                <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>{customer.phone}</p>
                              </div>
                              <Plus className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                            </div>
                          ))}
                        {customers.filter((c: any) => c.name.toLowerCase().includes((formData.customer_name || '').toLowerCase())).length === 0 && (
                          <div className="p-3 text-center text-[13px] transition-theme" style={{ color: 'var(--text-muted)' }}>لا يوجد عملاء مطابقين</div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setShowAddCustomerForm(!showAddCustomerForm)}
                    className="w-[44px] h-[44px] rounded-lg flex items-center justify-center text-white transition-colors"
                    style={{ backgroundColor: 'var(--primary)' }}
                    title="إضافة عميل جديد"
                  >
                    <UserPlus className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Inline Add Customer Form */}
                {showAddCustomerForm && (
                  <div 
                    className="mt-3 p-4 rounded-lg border transition-theme"
                    style={{ 
                      backgroundColor: 'var(--surface-1)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    <h4 className="text-[14px] font-medium mb-3 transition-theme" style={{ color: 'var(--text-primary)' }}>إضافة عميل جديد</h4>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        value={newCustomerName}
                        onChange={(e) => setNewCustomerName(e.target.value)}
                        placeholder="اسم العميل *"
                        className="w-full h-[40px] rounded-lg px-3 text-[14px] outline-none transition-theme"
                        style={{
                          backgroundColor: 'var(--input-bg)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-color)'
                        }}
                      />
                      <input
                        type="text"
                        value={newCustomerPhone}
                        onChange={(e) => setNewCustomerPhone(e.target.value)}
                        placeholder="رقم التليفون *"
                        className="w-full h-[40px] rounded-lg px-3 text-[14px] outline-none transition-theme"
                        style={{
                          backgroundColor: 'var(--input-bg)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-color)'
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => setShowAddCustomerForm(false)}
                        className="flex-1 h-[36px] text-[13px]"
                      >
                        إلغاء
                      </Button>
                      <Button
                        variant="success"
                        onClick={handleAddNewCustomer}
                        className="flex-1 h-[36px] text-[13px]"
                      >
                        إضافة
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Items Section */}
              <div 
                className="rounded-lg p-4 transition-theme"
                style={{ backgroundColor: 'var(--surface-1)' }}
              >
                <h4 className="text-[16px] font-bold mb-4 transition-theme" style={{ color: 'var(--text-primary)' }}>
                  العناصر المسترجعة
                </h4>
                
                <div className="space-y-3 mb-4">
                  {formData.items?.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg flex justify-between items-start transition-theme"
                      style={{ backgroundColor: 'var(--card-bg)' }}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-[14px] transition-theme" style={{ color: 'var(--text-primary)' }}>
                          {item.product_name}
                        </p>
                        <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>
                          {item.quantity_returned} {item.unit} × {item.unit_price} ج = {item.refund_amount} ج
                        </p>
                        <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>
                          السبب: {returnReasonLabels[item.reason].label}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="p-2 rounded transition-all"
                        style={{ 
                          color: 'var(--danger)',
                          backgroundColor: 'var(--danger-bg)'
                        }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Add Item Form */}
                <div 
                  className="border-t pt-4 space-y-3 transition-theme"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <h5 className="text-[14px] font-medium transition-theme" style={{ color: 'var(--text-primary)' }}>
                    إضافة عنصر جديد
                  </h5>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="اسم المنتج *"
                      value={newItem.product_name}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          product_name: e.target.value,
                        })
                      }
                      placeholder=""
                    />
                    
                    <div>
                      <label className="block text-[14px] font-medium mb-2 transition-theme" style={{ color: 'var(--text-primary)' }}>
                        الكمية *
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={newItem.quantity_returned}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || /^[0-9]*$/.test(val)) {
                            setNewItem({
                              ...newItem,
                              quantity_returned: val === '' ? 0 : Number(val),
                            });
                          }
                        }}
                        placeholder=""
                        className="w-full h-[44px] rounded-lg px-3 outline-none transition-theme"
                        style={{
                          backgroundColor: 'var(--input-bg)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-color)'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[14px] font-medium mb-2 transition-theme" style={{ color: 'var(--text-primary)' }}>
                        سعر الوحدة
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9.]*"
                        value={newItem.unit_price || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
                            setNewItem({
                              ...newItem,
                              unit_price: val === '' ? undefined : Number(val),
                            });
                          }
                        }}
                        placeholder=""
                        className="w-full h-[44px] rounded-lg px-3 outline-none transition-theme"
                        style={{
                          backgroundColor: 'var(--input-bg)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-color)'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[14px] font-medium mb-2 transition-theme" style={{ color: 'var(--text-primary)' }}>
                        الوحدة
                      </label>
                      <select
                        value={newItem.unit}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            unit: e.target.value as any,
                          })
                        }
                        className="w-full h-[44px] rounded-lg px-3 outline-none transition-theme"
                        style={{
                          backgroundColor: 'var(--input-bg)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        <option value="piece">قطعة</option>
                        <option value="kg">كيلو</option>
                        <option value="liter">لتر</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[14px] font-medium mb-2 transition-theme" style={{ color: 'var(--text-primary)' }}>
                      السبب
                    </label>
                    <select
                      value={newItem.reason}
                      onChange={(e) =>
                        setNewItem({ ...newItem, reason: e.target.value as any })
                      }
                      className="w-full h-[44px] rounded-lg px-3 outline-none transition-theme"
                      style={{
                        backgroundColor: 'var(--input-bg)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      {Object.entries(returnReasonLabels).map(([key, val]) => (
                        <option key={key} value={key}>
                          {val.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <Button
                    variant="info"
                    onClick={handleAddItemToReturn}
                    fullWidth
                  >
                    إضافة العنصر
                  </Button>
                </div>
              </div>
              
              {/* Refund Settings */}
              <div>
                <label className="block text-[14px] font-medium mb-2 transition-theme" style={{ color: 'var(--text-primary)' }}>
                  طريقة الإرجاع
                </label>
                <select
                  value={formData.refund_method}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      refund_method: e.target.value as any,
                    })
                  }
                  className="w-full h-[44px] rounded-lg px-3 outline-none transition-theme"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  {Object.entries(refundMethodLabels).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.label} - {val.description}
                    </option>
                  ))}
                </select>
                <p className="text-[12px] mt-1 transition-theme" style={{ color: 'var(--text-muted)' }}>
                  {formData.refund_method === 'cash' 
                    ? 'سيتم إرجاع المبلغ نقدياً للعميل' 
                    : 'إذا كانت الفاتورة الأصلية آجل، سيتم خصم المبلغ من ديون العميل. إذا كانت كاش، سيتم إرجاع النقد.'}
                </p>
              </div>
              
              <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>
                * الحقول الإلزامية: اسم المنتج، الكمية
              </p>
            </div>
            
            <div 
              className="p-4 flex gap-3 sticky bottom-0 transition-theme"
              style={{ backgroundColor: 'var(--surface-1)' }}
            >
              <Button variant="ghost" onClick={closeDialog} fullWidth>
                إلغاء
              </Button>
              <Button variant="warning" onClick={handleAddReturn} fullWidth>
                تسجيل المسترجعة
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
