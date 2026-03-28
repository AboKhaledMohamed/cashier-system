import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Button from '../components/ui/Button';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { notify, messages } from '../utils/toast';
import { Search, Trash2, Package, Plus, ChevronDown, X } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import type { Supplier } from '../types/small-shop.types';

export default function PurchasesPage() {
  const { suppliers, products, currentSession } = useShop();
  const api = (window as any).electronAPI;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'new'>('list');
  const [invoiceNumber, setInvoiceNumber] = useState(`P-${Date.now().toString().slice(-6)}`);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [supplier, setSupplier] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paid, setPaid] = useState(0);
  const [productSearch, setProductSearch] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [formErrors, setFormErrors] = useState<{ supplier?: string; warehouse?: string; items?: string }>({});
  
  // Supplier dropdown state
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [showAddSupplierForm, setShowAddSupplierForm] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  
  // Manual item dialog state
  const [showManualItemDialog, setShowManualItemDialog] = useState(false);
  const [manualProductName, setManualProductName] = useState('');
  const [manualQuantity, setManualQuantity] = useState(1);
  const [manualPrice, setManualPrice] = useState(0);
  
  // Purchase list state
  const [purchasesList, setPurchasesList] = useState<any[]>([]);
  
  // Load purchases list
  const loadPurchases = async () => {
    try {
      const data = await api.purchases.getAll();
      setPurchasesList(data);
    } catch (e: any) {
      console.error(e);
      notify.error('فشل تحميل الفواتير');
    }
  };

  useEffect(() => {
    loadPurchases();
    
    // Set next invoice number when on new tab
    if (activeTab === 'new') {
      api.purchases.getNextNumber().then((num: string) => setInvoiceNumber(num)).catch(console.error);
    }
  }, [activeTab]);
  
  // Payment type state
  const [paymentType, setPaymentType] = useState<'cash' | 'credit' | 'partial'>('cash');
  
  // Product search results
  const productResults = productSearch.trim() && products
    ? products.filter((p: any) => 
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.barcode?.includes(productSearch)
      )
    : [];
  
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;
  
  // Calculate remaining based on payment type for display
  const displayRemaining = 
    paymentType === 'cash' ? 0 :
    paymentType === 'credit' ? total :
    total - paid;

  const addItem = (product: any) => {
    const existingItem = items.find((item) => item.productId === product.id);
    if (existingItem) {
      setItems(
        items.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        )
      );
    } else {
      setItems([...items, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.cost_price || 0,
        total: product.cost_price || 0,
      }]);
    }
    setProductSearch('');
    setShowProductSearch(false);
    setFormErrors((prev) => ({ ...prev, items: undefined }));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(items.filter((item) => item.productId !== productId));
      return;
    }
    setItems(
      items.map((item) =>
        item.productId === productId
          ? { ...item, quantity, total: quantity * item.price }
          : item
      )
    );
  };

  const updatePrice = (productId: string, price: number) => {
    setItems(
      items.map((item) =>
        item.productId === productId
          ? { ...item, price, total: item.quantity * price }
          : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setItems(items.filter((item) => item.productId !== productId));
  };

  const addManualItem = () => {
    if (!manualProductName.trim() || manualQuantity <= 0 || manualPrice <= 0) {
      notify.error('أدخل اسم الصنف والكمية والسعر بشكل صحيح');
      return;
    }
    setItems([
      ...items,
      {
        productId: `manual-${Date.now()}`,
        productName: manualProductName.trim(),
        quantity: manualQuantity,
        price: manualPrice,
        total: manualQuantity * manualPrice,
      },
    ]);
    setManualProductName('');
    setManualQuantity(1);
    setManualPrice(0);
    setShowManualItemDialog(false);
    setFormErrors((prev) => ({ ...prev, items: undefined }));
  };
  
  const validateForm = () => {
    const errors: { supplier?: string; items?: string } = {};
    let isValid = true;

    if (!selectedSupplierId) {
      errors.supplier = 'الرجاء اختيار مورد من القائمة';
      notify.error('الرجاء اختيار مورد من القائمة');
      isValid = false;
    }
    

    
    if (items.length === 0) {
      errors.items = 'أضف صنف واحد على الأقل';
      notify.error('أضف صنف واحد على الأقل');
      isValid = false;
    } else {
      const zeroQtyItem = items.find(item => item.quantity <= 0);
      const zeroPriceItem = items.find(item => item.price <= 0);
      
      if (zeroQtyItem) {
        errors.items = 'كمية الصنف غير صالحة';
        notify.error(`عذراً، لا يمكن إتمام الشراء. يرجى التأكد من أن كمية الصنف "${zeroQtyItem.productName}" أكبر من صفر.`);
        isValid = false;
      } else if (zeroPriceItem) {
        errors.items = 'سعر الصنف غير صالح';
        notify.error(`عذراً، لا يمكن إتمام الشراء. يرجى التأكد من إدخال سعر صحيح للصنف "${zeroPriceItem.productName}".`);
        isValid = false;
      }
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  const handleSavePurchase = async () => {
    if (!validateForm()) return;
    
    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = (subtotal * discount) / 100;
    const finalTotal = subtotal - discountAmount;
    
    // Determine payment based on payment type
    let actualPaid = paid;
    let paymentStatus: string = 'paid';
    
    if (paymentType === 'cash') {
      actualPaid = finalTotal;
      paymentStatus = 'paid';
    } else if (paymentType === 'credit') {
      actualPaid = 0;
      paymentStatus = 'unpaid';
    } else if (paymentType === 'partial') {
      actualPaid = paid;
      paymentStatus = actualPaid >= finalTotal ? 'paid' : (actualPaid > 0 ? 'partial' : 'unpaid');
    }
    
    const purchaseData = {
      supplier_id: selectedSupplierId,
      session_id: currentSession?.id,
      payment_type: paymentType,
      payment_status: paymentStatus,
      total_amount: subtotal,
      discount_amount: discountAmount,
      tax_amount: 0,
      net_amount: finalTotal,
      paid_amount: actualPaid,
      notes: '',
      items: items.map(item => ({
        product_id: item.productId.startsWith('manual-') ? null : item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        unit_cost: item.price,
        total_cost: item.total
      }))
    };
    
    try {
      await api.purchases.create(purchaseData);
      notify.success('تم حفظ فاتورة الشراء بنجاح');
      resetForm();
      setActiveTab('list');
      loadPurchases();
    } catch (e: any) {
      notify.error(e.message || 'حدث خطأ أثناء حفظ الفاتورة');
    }
  };

  const resetForm = () => {
    setInvoiceNumber(`P-${Date.now().toString().slice(-6)}`);
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setSupplier('');
    setSelectedSupplierId('');
    setSelectedWarehouse('');
    setItems([]);
    setDiscount(0);
    setPaid(0);
    setPaymentType('cash');
    setShowAddSupplierForm(false);
    setNewSupplierName('');
    setNewSupplierPhone('');
    setFormErrors({});
  };

  const handleSelectSupplier = (selectedSupplier: Supplier) => {
    setSupplier(selectedSupplier.name);
    setSelectedSupplierId(selectedSupplier.id);
    setShowSupplierDropdown(false);
    setFormErrors((prev) => ({ ...prev, supplier: undefined }));
  };

  const handleAddNewSupplier = async () => {
    if (!newSupplierName.trim() || !newSupplierPhone.trim()) {
      notify.error('أدخل اسم المورد ورقم التليفون');
      return;
    }

    try {
      const result = await api.suppliers.create({
        name: newSupplierName.trim(),
        phone: newSupplierPhone.trim(),
      });
      
      // Need to fetch fresh suppliers or just use the created ID
      // We'll update the selected supplier manually since ShopContext will update async
      setSupplier(newSupplierName.trim());
      setSelectedSupplierId(result.id);
      setShowAddSupplierForm(false);
      setNewSupplierName('');
      setNewSupplierPhone('');
      notify.success('تم إضافة المورد بنجاح');
    } catch(e: any) {
      notify.error(e.message || 'فشل إضافة المورد');
    }
  };

  // Stock status
  const getStatusColor = (status: string) => {
    if (status === 'مدفوعة' || status === 'paid') return { bg: 'var(--primary-light)', color: 'var(--primary)' };
    if (status === 'جزئي' || status === 'partial') return { bg: 'var(--warning-bg)', color: 'var(--warning)' };
    if (status === 'معلقة' || status === 'unpaid') return { bg: 'var(--danger-bg)', color: 'var(--danger)' };
    return { bg: 'var(--surface-1)', color: 'var(--text-muted)' };
  };
  
  // Filter purchases from the local state
  const filteredPurchases = purchasesList.filter(
    (p: any) =>
      p.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.supplier_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div 
      className="min-h-screen transition-theme"
      style={{ backgroundColor: 'var(--page-bg)' }}
    >
      <Header title="فاتورة مشتريات" />
      
      <div className="p-6">
        {/* Top Bar with Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div 
            className="flex gap-1 rounded-lg p-1 transition-theme"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <button
              onClick={() => setActiveTab('list')}
              className="px-6 py-2 rounded-md text-[14px] font-medium transition-all"
              style={{
                backgroundColor: activeTab === 'list' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'list' ? 'white' : 'var(--text-muted)'
              }}
            >
              قائمة الفواتير
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className="px-6 py-2 rounded-md text-[14px] font-medium transition-all"
              style={{
                backgroundColor: activeTab === 'new' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'new' ? 'white' : 'var(--text-muted)'
              }}
            >
              فاتورة جديدة
            </button>
          </div>
          
          {activeTab === 'list' && (
            <div className="relative w-[300px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="ابحث عن فاتورة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[40px] rounded-lg pr-10 pl-4 text-[14px] outline-none transition-theme"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)'
                }}
              />
            </div>
          )}
        </div>
        
        {/* New Purchase Form */}
        {activeTab === 'new' && (
          <div className="flex gap-6">
            {/* Left Side - Invoice Details & Items */}
            <div className="flex-1 space-y-4">
              {/* Invoice Header Card */}
              <div 
                className="rounded-xl p-5 transition-theme"
                style={{ backgroundColor: 'var(--card-bg)' }}
              >
                <h3 className="text-[16px] font-semibold mb-4 transition-theme" style={{ color: 'var(--text-primary)' }}>المورد</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Invoice Number */}
                  <div>
                    <label className="block text-[12px] mb-1.5 transition-theme" style={{ color: 'var(--text-muted)' }}>رقم الفاتورة *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] transition-theme" style={{ color: 'var(--text-muted)' }}>P-</span>
                      <input
                        type="text"
                        value={invoiceNumber.replace('P-', '')}
                        onChange={(e) => setInvoiceNumber(`P-${e.target.value}`)}
                        className="w-full h-[44px] rounded-lg pl-10 pr-3 text-[14px] outline-none transition-theme"
                        style={{
                          backgroundColor: 'var(--surface-1)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-color)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-[12px] mb-1.5 transition-theme" style={{ color: 'var(--text-muted)' }}>التاريخ</label>
                    <input
                      type="date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="w-full h-[44px] rounded-lg px-3 text-[14px] outline-none transition-theme"
                      style={{
                        backgroundColor: 'var(--surface-1)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)'
                      }}
                    />
                  </div>


                </div>

                {/* Supplier Selection with Dropdown */}
                <div className="mt-4">
                  <label className="block text-[12px] mb-1.5 transition-theme" style={{ color: 'var(--text-muted)' }}>اسم المورد *</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={supplier}
                        onChange={(e) => {
                          setSupplier(e.target.value);
                          setShowSupplierDropdown(true);
                        }}
                        onFocus={() => setShowSupplierDropdown(true)}
                        placeholder="اختر أو أدخل اسم المورد"
                        className="w-full h-[44px] rounded-lg px-3 text-[14px] outline-none transition-theme"
                        style={{
                          backgroundColor: 'var(--surface-1)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-color)'
                        }}
                      />
                      
                      {/* Supplier Dropdown */}
                      {showSupplierDropdown && suppliers.length > 0 && (
                        <div 
                          className="absolute z-10 w-full mt-2 rounded-lg shadow-xl max-h-[250px] overflow-y-auto transition-theme"
                          style={{
                            backgroundColor: 'var(--surface-1)',
                            border: '1px solid var(--border-color)'
                          }}
                        >
                          {suppliers
                            .filter((s) => s.name.toLowerCase().includes(supplier.toLowerCase()) || s.phone.includes(supplier))
                            .map((sup) => (
                              <div
                                key={sup.id}
                                onClick={() => handleSelectSupplier(sup)}
                                className="flex items-center justify-between p-3 cursor-pointer border-b last:border-0 transition-theme"
                                style={{ borderColor: 'var(--border-color)' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--card-bg)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <div>
                                  <p className="text-[14px] font-medium transition-theme" style={{ color: 'var(--text-primary)' }}>{sup.name}</p>
                                  <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>{sup.phone}</p>
                                </div>
                                <Plus className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                              </div>
                            ))}
                          {suppliers.filter((s) => s.name.toLowerCase().includes(supplier.toLowerCase())).length === 0 && (
                            <div className="p-3 text-center text-[13px] transition-theme" style={{ color: 'var(--text-muted)' }}>لا يوجد موردين مطابقين</div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => setShowAddSupplierForm(!showAddSupplierForm)}
                      className="w-[44px] h-[44px] rounded-lg flex items-center justify-center text-white transition-colors"
                      style={{ backgroundColor: 'var(--primary)' }}
                      title="إضافة مورد جديد"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Inline Add Supplier Form */}
                  {showAddSupplierForm && (
                    <div 
                      className="mt-3 p-4 rounded-lg border transition-theme"
                      style={{ 
                        backgroundColor: 'var(--surface-1)',
                        borderColor: 'var(--border-color)'
                      }}
                    >
                      <h4 className="text-[14px] font-medium mb-3 transition-theme" style={{ color: 'var(--text-primary)' }}>إضافة مورد جديد</h4>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <input
                          type="text"
                          value={newSupplierName}
                          onChange={(e) => setNewSupplierName(e.target.value)}
                          placeholder="اسم المورد *"
                          className="w-full h-[40px] rounded-lg px-3 text-[14px] outline-none transition-theme"
                          style={{
                            backgroundColor: 'var(--card-bg)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-color)'
                          }}
                        />
                        <input
                          type="text"
                          value={newSupplierPhone}
                          onChange={(e) => setNewSupplierPhone(e.target.value)}
                          placeholder="رقم التليفون *"
                          className="w-full h-[40px] rounded-lg px-3 text-[14px] outline-none transition-theme"
                          style={{
                            backgroundColor: 'var(--card-bg)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-color)'
                          }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => setShowAddSupplierForm(false)}
                          className="flex-1 h-[36px] text-[13px]"
                        >
                          إلغاء
                        </Button>
                        <Button
                          variant="success"
                          onClick={handleAddNewSupplier}
                          className="flex-1 h-[36px] text-[13px]"
                        >
                          إضافة
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {formErrors.supplier && <p className="text-[12px] mt-1" style={{ color: 'var(--danger)' }}>{formErrors.supplier}</p>}
                </div>
              </div>

              {/* Product Search & Add */}
              <div 
                className="rounded-xl p-5 transition-theme"
                style={{ backgroundColor: 'var(--card-bg)' }}
              >
                <div className="relative flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="ابحث عن صنف لإضافته..."
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setShowProductSearch(true);
                      }}
                      className="w-full h-[48px] rounded-lg pr-12 pl-4 text-[14px] outline-none transition-theme"
                      style={{
                        backgroundColor: 'var(--surface-1)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)'
                      }}
                    />
                    
                    {/* Search Results Dropdown */}
                    {showProductSearch && productResults.length > 0 && (
                      <div 
                        className="absolute z-10 w-full mt-2 rounded-lg shadow-xl max-h-[250px] overflow-y-auto transition-theme"
                        style={{
                          backgroundColor: 'var(--surface-1)',
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        {productResults.map((product) => (
                          <div
                            key={product.id}
                            onClick={() => addItem(product)}
                            className="flex items-center justify-between p-3 cursor-pointer border-b last:border-0 transition-theme"
                            style={{ borderColor: 'var(--border-color)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--card-bg)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <div>
                              <p className="text-[14px] font-medium transition-theme" style={{ color: 'var(--text-primary)' }}>{product.name}</p>
                              <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>سعر الشراء: {formatCurrency(product.cost_price || 0)}</p>
                            </div>
                            <Plus className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="success"
                    onClick={() => setShowManualItemDialog(true)}
                    className="h-[48px] px-4"
                  >
                    إضافة صنف
                  </Button>
                </div>
                
                {formErrors.items && (
                  <p className="text-[12px] mt-2" style={{ color: 'var(--danger)' }}>{formErrors.items}</p>
                )}
              </div>

              {/* Items Table */}
              <div 
                className="rounded-xl overflow-hidden transition-theme"
                style={{ backgroundColor: 'var(--card-bg)' }}
              >
                {/* Table Header */}
                <div 
                  className="grid grid-cols-12 gap-4 p-4 text-[13px] font-medium transition-theme"
                  style={{ 
                    borderBottom: '1px solid var(--border-color)',
                    color: 'var(--text-muted)'
                  }}
                >
                  <div className="col-span-1 text-center">#</div>
                  <div className="col-span-5">المنتج</div>
                  <div className="col-span-2 text-center">الكمية</div>
                  <div className="col-span-2 text-center">السعر</div>
                  <div className="col-span-2 text-center">الإجمالي</div>
                </div>

                {/* Table Body */}
                <div className="max-h-[300px] overflow-y-auto">
                  {items.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <p className="text-[14px] transition-theme" style={{ color: 'var(--text-muted)' }}>لا توجد أصناف مضافة</p>
                    </div>
                  ) : (
                    items.map((item, index) => (
                      <div 
                        key={item.productId} 
                        className="grid grid-cols-12 gap-4 p-4 items-center transition-all"
                        style={{ borderBottom: '1px solid var(--border-color)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div className="col-span-1 text-center" style={{ color: 'var(--text-muted)' }}>{index + 1}</div>
                        <div className="col-span-5 flex items-center gap-2">
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="w-6 h-6 rounded flex items-center justify-center transition-colors"
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
                            <Trash2 className="w-3 h-3" />
                          </button>
                          <span className="text-[14px] transition-theme" style={{ color: 'var(--text-primary)' }}>{item.productName}</span>
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                            className="w-full h-[36px] rounded px-2 text-center text-[14px] outline-none transition-theme"
                            style={{
                              backgroundColor: 'var(--surface-1)',
                              color: 'var(--text-primary)',
                              border: '1px solid var(--border-color)'
                            }}
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => updatePrice(item.productId, Number(e.target.value))}
                            className="w-full h-[36px] rounded px-2 text-center text-[14px] outline-none transition-theme"
                            style={{
                              backgroundColor: 'var(--surface-1)',
                              color: 'var(--text-primary)',
                              border: '1px solid var(--border-color)'
                            }}
                          />
                        </div>
                        <div className="col-span-2 text-center">
                          <span className="text-[14px] font-semibold" style={{ color: 'var(--primary)' }}>{formatCurrency(item.total)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Subtotal Row */}
                {items.length > 0 && (
                  <div 
                    className="grid grid-cols-12 gap-4 p-4 transition-theme"
                    style={{ 
                      backgroundColor: 'var(--surface-1)',
                      borderTop: '1px solid var(--border-color)'
                    }}
                  >
                    <div className="col-span-6 text-[14px]" style={{ color: 'var(--text-muted)' }}>إجمالي الصنف: {items.length}</div>
                    <div className="col-span-6 text-right text-[14px] font-semibold" style={{ color: 'var(--primary)' }}>
                      {formatCurrency(subtotal)} ج
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Summary */}
            <div className="w-[320px]">
              <div 
                className="rounded-xl p-5 sticky top-6 transition-theme"
                style={{ backgroundColor: 'var(--card-bg)' }}
              >
                <h3 className="text-[16px] font-semibold mb-5 transition-theme" style={{ color: 'var(--text-primary)' }}>ملخص الفاتورة</h3>
                
                <div className="space-y-4">
                  {/* Payment Type */}
                  <div>
                    <label className="block text-[12px] mb-2 transition-theme" style={{ color: 'var(--text-muted)' }}>طريقة الدفع</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPaymentType('cash')}
                        className="flex-1 py-2 rounded-lg text-[14px] font-medium transition-all"
                        style={{
                          backgroundColor: paymentType === 'cash' ? 'var(--primary)' : 'var(--surface-1)',
                          color: paymentType === 'cash' ? 'white' : 'var(--text-muted)'
                        }}
                      >
                        كاش
                      </button>
                      <button
                        onClick={() => setPaymentType('credit')}
                        className="flex-1 py-2 rounded-lg text-[14px] font-medium transition-all"
                        style={{
                          backgroundColor: paymentType === 'credit' ? 'var(--danger)' : 'var(--surface-1)',
                          color: paymentType === 'credit' ? 'white' : 'var(--text-muted)'
                        }}
                      >
                        آجل
                      </button>
                      <button
                        onClick={() => setPaymentType('partial')}
                        className="flex-1 py-2 rounded-lg text-[14px] font-medium transition-all"
                        style={{
                          backgroundColor: paymentType === 'partial' ? 'var(--warning)' : 'var(--surface-1)',
                          color: paymentType === 'partial' ? '#1A1A2E' : 'var(--text-muted)'
                        }}
                      >
                        جزئي
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="flex justify-between items-center">
                    <span className="text-[14px] transition-theme" style={{ color: 'var(--text-muted)' }}>جمالي الفاتورة:</span>
                    <span className="text-[16px] font-semibold transition-theme" style={{ color: 'var(--text-primary)' }}>{formatCurrency(subtotal)}</span>
                  </div>

                  {/* Discount */}
                  <div className="flex justify-between items-center">
                    <span className="text-[14px] transition-theme" style={{ color: 'var(--text-muted)' }}>الخصم:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                        className="w-[60px] h-[32px] rounded px-2 text-center text-[14px] outline-none transition-theme"
                        style={{
                          backgroundColor: 'var(--surface-1)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-color)'
                        }}
                      />
                      <span className="text-[14px] transition-theme" style={{ color: 'var(--text-muted)' }}>%</span>
                      <span className="text-[14px] w-[70px] text-right transition-theme" style={{ color: 'var(--text-primary)' }}>{formatCurrency(discountAmount)}</span>
                    </div>
                  </div>

                  {/* Paid - Only show for partial payment */}
                  {paymentType === 'partial' && (
                    <div className="flex justify-between items-center">
                      <span className="text-[14px] transition-theme" style={{ color: 'var(--text-muted)' }}>المدفوع:</span>
                      <input
                        type="number"
                        value={paid}
                        onChange={(e) => setPaid(Number(e.target.value) || 0)}
                        className="w-[100px] h-[32px] rounded px-2 text-right text-[14px] outline-none transition-theme"
                        style={{
                          backgroundColor: 'var(--surface-1)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-color)'
                        }}
                      />
                    </div>
                  )}

                  {/* Total */}
                  <div 
                    className="flex justify-between items-center pt-2 transition-theme"
                    style={{ borderTop: '1px solid var(--border-color)' }}
                  >
                    <span className="text-[14px] transition-theme" style={{ color: 'var(--text-muted)' }}>الإجمالي:</span>
                    <span className="text-[20px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>{formatCurrency(total)}</span>
                  </div>

                  {/* Remaining - Show only for credit and partial payments */}
                  {paymentType !== 'cash' && displayRemaining > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-[14px]" style={{ color: 'var(--danger)' }}>
                        {paymentType === 'credit' ? 'دين على المورد:' : 'مستحق للمورد:'}
                      </span>
                      <span className="text-[18px] font-bold" style={{ color: 'var(--danger)' }}>{formatCurrency(displayRemaining)}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <Button 
                    variant="ghost" 
                    onClick={resetForm}
                    className="h-[44px]"
                  >
                    إلغاء
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={handleSavePurchase}
                    className="h-[44px]"
                  >
                    شراء
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Manual Item Dialog */}
        {showManualItemDialog && (
          <div 
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: 'var(--overlay-bg)' }}
          >
            <div 
              className="rounded-xl p-6 w-[500px] max-w-[90%] transition-theme"
              style={{ backgroundColor: 'var(--card-bg)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[18px] font-semibold transition-theme" style={{ color: 'var(--text-primary)' }}>إضافة صنف جديد</h3>
                <button
                  onClick={() => setShowManualItemDialog(false)}
                  className="w-8 h-8 rounded flex items-center justify-center transition-colors"
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
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] mb-2 transition-theme" style={{ color: 'var(--text-muted)' }}>اسم الصنف *</label>
                  <input
                    type="text"
                    value={manualProductName}
                    onChange={(e) => setManualProductName(e.target.value)}
                    placeholder="أدخل اسم الصنف"
                    className="w-full h-[44px] rounded-lg px-3 text-[14px] outline-none transition-theme"
                    style={{
                      backgroundColor: 'var(--surface-1)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)'
                    }}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] mb-2 transition-theme" style={{ color: 'var(--text-muted)' }}>الكمية *</label>
                    <input
                      type="number"
                      value={manualQuantity}
                      min={1}
                      onChange={(e) => setManualQuantity(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full h-[44px] rounded-lg px-3 text-center text-[14px] outline-none transition-theme"
                      style={{
                        backgroundColor: 'var(--surface-1)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)'
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] mb-2 transition-theme" style={{ color: 'var(--text-muted)' }}>سعر الشراء *</label>
                    <input
                      type="number"
                      value={manualPrice}
                      min={0}
                      onChange={(e) => setManualPrice(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full h-[44px] rounded-lg px-3 text-center text-[14px] outline-none transition-theme"
                      style={{
                        backgroundColor: 'var(--surface-1)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)'
                      }}
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => setShowManualItemDialog(false)}
                    className="flex-1 h-[44px]"
                  >
                    إلغاء
                  </Button>
                  <Button
                    variant="success"
                    onClick={addManualItem}
                    className="flex-1 h-[44px]"
                    disabled={!manualProductName.trim() || manualQuantity <= 0 || manualPrice <= 0}
                  >
                    إضافة
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Purchase List */}
        {activeTab === 'list' && (
          <div 
            className="rounded-xl overflow-hidden transition-theme"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div 
              className="grid grid-cols-12 gap-4 p-4 text-[13px] font-medium transition-theme"
              style={{ 
                borderBottom: '1px solid var(--border-color)',
                color: 'var(--text-muted)'
              }}
            >
              <div className="col-span-2">رقم الفاتورة</div>
              <div className="col-span-3">المورد</div>
              <div className="col-span-2">التاريخ</div>
              <div className="col-span-2 text-center">الإجمالي</div>
              <div className="col-span-2 text-center">الحالة</div>
              <div className="col-span-1 text-center">تفاصيل</div>
            </div>
            <div 
              className="divide-y transition-theme"
              style={{ borderColor: 'var(--border-color)' }}
            >
              {filteredPurchases.map((purchase) => {
                const status = getStatusColor(purchase.payment_status);
                return (
                  <div
                    key={purchase.id}
                    className="grid grid-cols-12 gap-4 p-4 items-center transition-all"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div className="col-span-2">
                      <p className="text-[14px] font-medium transition-theme" style={{ color: 'var(--text-primary)' }}>{purchase.invoice_number}</p>
                    </div>
                    <div className="col-span-3">
                      <p className="text-[14px] transition-theme" style={{ color: 'var(--text-primary)' }}>{purchase.supplier_name}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[13px] transition-theme" style={{ color: 'var(--text-muted)' }}>{new Date(purchase.created_at || new Date()).toLocaleDateString('ar-EG')}</p>
                    </div>
                    <div className="col-span-2 text-center">
                      <p className="text-[16px] font-bold" style={{ color: 'var(--primary)' }}>{formatCurrency(purchase.net_amount)}</p>
                    </div>
                    <div className="col-span-2 text-center">
                      <span 
                        className="px-3 py-1 rounded-full text-[12px] font-bold"
                        style={{ backgroundColor: status.bg, color: status.color }}
                      >
                        {purchase.payment_status === 'مدفوع' || purchase.payment_status === 'paid' ? 'مدفوع' : 
                         purchase.payment_status === 'جزئي' || purchase.payment_status === 'partial' ? 'جزئي' : 
                         purchase.payment_status === 'غير_مدفوع' || purchase.payment_status === 'unpaid' ? 'غير مدفوع' : 'غير معروف'}
                      </span>
                    </div>
                    <div className="col-span-1 text-center">
                      <Button variant="ghost" className="text-[12px] h-auto p-2">
                        عرض
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
