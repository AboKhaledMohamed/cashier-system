import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Button from '../components/ui/Button';
import LoadingButton from '../components/ui/LoadingButton';
import Input from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { useShop } from '../context/ShopContext';
import { useLowStockAlerts } from '../context/useShopHooks';
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters';
import { notify, messages } from '../utils/toast';
import { useLocation } from 'react-router';
import {
  Search,
  Plus,
  Edit,
  AlertCircle,
  Package,
  X,
} from 'lucide-react';
import type { Product } from '../types/small-shop.types';

export default function InventoryPage() {
  const location = useLocation();
  const { products: shopProducts, loadProducts, categories, loadCategories } = useShop();
  const api = (window as any).electronAPI;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false); // Show inline form on button click
  const [formErrors, setFormErrors] = useState<{ name?: string; price?: string; cost?: string; stock?: string; stock_alert?: string }>({});
  
  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    barcode: '',
    stock: 0,
    stock_alert: 0,
    price: 0,
    cost: 0,
    unit: 'piece',
    category_id: 'cat-1',
    category_name: '',
    production_date: '',
    expiry_date: '',
  });
  
  // Filter products
  const filteredProducts = shopProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode.includes(searchQuery);
    const matchesCategory =
      selectedCategory === 'الكل' || product.category_name === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  // Load data
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // Get unique categories
  const categoryNames = ['الكل', ...categories.map((c: any) => c.name)];
  
  // Stock status
  const getStockStatus = (product: Product) => {
    if (product.stock === 0) return { text: 'نفد' };
    if (product.stock <= product.stock_alert) return { text: 'منخفض' };
    return { text: 'كافي' };
  };
  
  // Calculate alerts
  const outOfStock = shopProducts.filter((p) => p.stock === 0).length;
  const lowStock = shopProducts.filter((p) => p.stock > 0 && p.stock <= p.stock_alert).length;
  
  // Handle add/edit with validation
  const [isSaving, setIsSaving] = useState(false);
  
  const validateForm = () => {
    const errors: { name?: string; price?: string; stock?: string; cost?: string; stock_alert?: string } = {};
    
    // Name validation
    if (!formData.name?.trim()) {
      errors.name = 'اسم المنتج مطلوب';
    }
    
    // Price validation
    if (!formData.price || formData.price <= 0) {
      errors.price = 'سعر البيع يجب أن يكون أكبر من صفر';
    }
    if (formData.price && formData.price < 0) {
      errors.price = 'سعر البيع لا يمكن أن يكون سالباً';
    }
    
    // Cost validation
    if (formData.cost && formData.cost < 0) {
      errors.cost = 'سعر التكلفة لا يمكن أن يكون سالباً';
    }
    
    // Stock validation
    if (formData.stock && formData.stock < 0) {
      errors.stock = 'المخزون لا يمكن أن يكون سالباً';
    }
    
    // Stock alert validation
    if (formData.stock_alert && formData.stock_alert < 0) {
      errors.stock_alert = 'حد التنبيه لا يمكن أن يكون سالباً';
    }
    
    // Check expiry date is after production date
    if (formData.production_date && formData.expiry_date) {
      if (new Date(formData.expiry_date) <= new Date(formData.production_date)) {
        notify.error('تاريخ الانتهاء يجب أن يكون بعد تاريخ الإنتاج');
      }
    }
    
    return errors;
  };
  
  const handleSave = async () => {
    const errors = validateForm();
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      notify.error('يرجى تصحيح الأخطاء في النموذج');
      return;
    }
    
    setIsSaving(true);
    
    try {
      if (editingProduct) {
        await api.products.update(editingProduct.id, formData);
        notify.success(messages.updated('المنتج'));
      } else {
        await api.products.create(formData);
        notify.success(messages.added('المنتج'));
      }
      await loadProducts();
      
      // Reset
      setShowAddDialog(false);
      setShowAddForm(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        barcode: '',
        stock: 0,
        stock_alert: 0,
        price: 0,
        cost: 0,
        unit: 'piece',
        category_id: 'cat-1',
        category_name: '',
        production_date: '',
        expiry_date: '',
      });
      setFormErrors({});
    } catch (error: any) {
      console.error('Error saving product:', error);
      notify.error(error.message || 'حدث خطأ أثناء حفظ المنتج');
    } finally {
      setIsSaving(false);
    }
  };
  
  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setShowAddDialog(true);
  };
  
  const closeDialog = () => {
    setShowAddDialog(false);
    setShowAddForm(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      barcode: '',
      stock: 0,
      stock_alert: 0,
      price: 0,
      cost: 0,
      unit: 'piece',
      category_id: 'cat-1',
      category_name: '',
      production_date: '',
      expiry_date: '',
    });
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
      <Header title="إدارة المخزون" />
      
      <div className="p-7 space-y-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-theme" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="ابحث عن منتج (اسم أو باركود)"
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
          
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-[48px] rounded-lg px-4 outline-none transition-theme"
            style={{
              backgroundColor: 'var(--input-bg)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              minWidth: '150px'
            }}
          >
            {categoryNames.map((cat: string) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          
          {/* Add Button */}
          <Button
            variant="info"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {showAddForm ? 'إلغاء' : 'إضافة منتج'}
          </Button>
        </div>
        
        {/* Inline Add Product Form */}
        {showAddForm && (
          <div 
            className="rounded-lg p-6 border-2 transition-theme"
            style={{ 
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--info)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>إضافة منتج جديد</h3>
              <span className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>رتّب الإدخال: بيانات أساسية ثم المخزون ثم التواريخ</span>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <Input
                label="اسم المنتج *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="أدخل اسم المنتج"
                error={formErrors.name}
              />
              <Input
                label="الباركود"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="622... (اختياري)"
              />
              <Input
                label="سعر البيع *"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                placeholder="0"
                error={formErrors.price}
              />
              <Input
                label="سعر التكلفة"
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                placeholder="0"
              />
              <Input
                label="الكمية"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                placeholder="0"
              />
              <Input
                label="حد التنبيه"
                type="number"
                value={formData.stock_alert}
                onChange={(e) => setFormData({ ...formData, stock_alert: Number(e.target.value) })}
                placeholder="10"
              />
              <Input
                label="الوحدة"
                value={String(formData.unit || '')}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                placeholder="مثال: قطعة / كرتونة / لتر"
              />
              <div>
                <label className="block text-[14px] font-medium mb-2 transition-theme" style={{ color: 'var(--text-primary)' }}>الفئة</label>
                <input
                  type="text"
                  value={formData.category_name || ''}
                  onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                  placeholder="أدخل الفئة (اختياري)"
                  className="w-full h-[44px] rounded-lg px-3 outline-none transition-theme"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)'
                  }}
                />
              </div>
              <div>
                <label className="block text-[14px] font-medium mb-2 transition-theme" style={{ color: 'var(--text-primary)' }}>تاريخ الإنتاج</label>
                <input
                  type="date"
                  value={formData.production_date || ''}
                  onChange={(e) => setFormData({ ...formData, production_date: e.target.value })}
                  className="w-full h-[44px] rounded-lg px-3 outline-none transition-theme"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)'
                  }}
                />
              </div>
              <div>
                <label className="block text-[14px] font-medium mb-2 transition-theme" style={{ color: 'var(--text-primary)' }}>تاريخ الانتهاء</label>
                <input
                  type="date"
                  value={formData.expiry_date || ''}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
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
                إضافة المنتج
              </Button>
            </div>
            <p className="text-[12px] mt-2 transition-theme" style={{ color: 'var(--text-muted)' }}>* الحقول الإلزامية</p>
          </div>
        )}
        
        {/* Alert Bar */}
        <div className="grid grid-cols-3 gap-4">
          <div 
            className="rounded-lg p-4 flex items-center gap-3 transition-theme"
            style={{ backgroundColor: 'var(--danger-bg)', border: '1px solid var(--danger)' }}
          >
            <AlertCircle className="w-6 h-6 flex-shrink-0" style={{ color: 'var(--danger)' }} />
            <div>
              <p className="text-[21px] font-bold" style={{ color: 'var(--danger)' }}>{outOfStock}</p>
              <p className="text-[14px]" style={{ color: 'var(--danger)' }}>منتجات نفدت</p>
            </div>
          </div>
          <div 
            className="rounded-lg p-4 flex items-center gap-3 transition-theme"
            style={{ backgroundColor: 'var(--warning-bg)', border: '1px solid var(--warning)' }}
          >
            <AlertCircle className="w-6 h-6 flex-shrink-0" style={{ color: 'var(--warning)' }} />
            <div>
              <p className="text-[21px] font-bold" style={{ color: 'var(--warning)' }}>{lowStock}</p>
              <p className="text-[14px]" style={{ color: 'var(--warning)' }}>مخزون منخفض</p>
            </div>
          </div>
          <div 
            className="rounded-lg p-4 flex items-center gap-3 transition-theme"
            style={{ backgroundColor: 'var(--primary-light)', border: '1px solid var(--primary)' }}
          >
            <Package className="w-6 h-6 flex-shrink-0" style={{ color: 'var(--primary)' }} />
            <div>
              <p className="text-[21px] font-bold" style={{ color: 'var(--primary)' }}>
                {shopProducts.length}
              </p>
              <p className="text-[14px]" style={{ color: 'var(--primary)' }}>إجمالي المنتجات</p>
            </div>
          </div>
        </div>
        
        {/* Products Table */}
        <div 
          className="rounded-lg overflow-hidden transition-theme"
          style={{ backgroundColor: 'var(--card-bg)' }}
        >
          {/* Table Header */}
          <div 
            className="grid grid-cols-12 gap-4 p-4 text-[14px] font-medium transition-theme"
            style={{ 
              backgroundColor: 'var(--surface-1)',
              color: 'var(--text-muted)'
            }}
          >
            <div className="col-span-3">اسم المنتج</div>
            <div className="col-span-2">الباركود</div>
            <div className="col-span-1 text-center">المخزون</div>
            <div className="col-span-1 text-center">سعر البيع</div>
            <div className="col-span-1 text-center">سعر الشراء</div>
            <div className="col-span-1 text-center">الوحدة</div>
            <div className="col-span-2">الفئة</div>
            <div className="col-span-1 text-center">تعديل</div>
          </div>
          
          {/* Table Body */}
          <div 
            className="divide-y transition-theme"
            style={{ borderColor: 'var(--border-color)' }}
          >
            {filteredProducts.length === 0 ? (
              <EmptyState 
                type="products" 
                action={
                  <Button variant="info" onClick={() => setShowAddForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    إضافة منتج جديد
                  </Button>
                }
              />
            ) : (
              filteredProducts.map((product) => {
                const status = getStockStatus(product);
                return (
                  <div
                    key={product.id}
                    className="grid grid-cols-12 gap-4 p-4 items-center transition-all"
                    style={{ backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div className="col-span-3">
                      <p className="text-[14px] font-medium transition-theme" style={{ color: 'var(--text-primary)' }}>
                        {product.name}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[13px] font-mono transition-theme" style={{ color: 'var(--text-muted)' }}>
                        {product.barcode}
                      </p>
                    </div>
                    <div className="col-span-1 text-center">
                      <span
                        className="px-3 py-1 rounded-full text-[12px] font-bold"
                        style={{ 
                          backgroundColor: status.text === 'نفد' ? 'var(--danger-bg)' : status.text === 'منخفض' ? 'var(--warning-bg)' : 'var(--primary-light)',
                          color: status.text === 'نفد' ? 'var(--danger)' : status.text === 'منخفض' ? 'var(--warning)' : 'var(--primary)'
                        }}
                      >
                        {formatNumber(product.stock)}
                      </span>
                    </div>
                    <div className="col-span-1 text-center">
                      <p className="text-[14px] font-bold" style={{ color: 'var(--primary)' }}>
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                    <div className="col-span-1 text-center">
                      <p className="text-[14px] transition-theme" style={{ color: 'var(--text-muted)' }}>
                        {formatCurrency(product.cost)}
                      </p>
                    </div>
                    <div className="col-span-1 text-center">
                      <p className="text-[13px] transition-theme" style={{ color: 'var(--text-primary)' }}>{product.unit}</p>
                    </div>
                    <div className="col-span-2">
                      <span 
                        className="px-2 py-1 rounded text-[12px]"
                        style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}
                      >
                        {product.category_name}
                      </span>
                    </div>
                    <div className="col-span-1 text-center">
                      <button
                        onClick={() => openEditDialog(product)}
                        className="w-8 h-8 rounded transition-all"
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
                        <Edit className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {/* Pagination */}
          <div 
            className="p-4 flex items-center justify-between transition-theme"
            style={{ backgroundColor: 'var(--surface-1)' }}
          >
            <p className="text-[14px] transition-theme" style={{ color: 'var(--text-muted)' }}>
              عرض {filteredProducts.length} من {shopProducts.length} منتج
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" className="text-[14px] h-auto px-3 py-2">
                السابق
              </Button>
              <Button variant="ghost" className="text-[14px] h-auto px-3 py-2">
                التالي
              </Button>
            </div>
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
            {/* Header */}
            <div 
              className="p-4 flex items-center justify-between"
              style={{ backgroundColor: 'var(--info)' }}
            >
              <h3 className="text-[21px] font-bold text-white">
                {editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}
              </h3>
              <button
                onClick={closeDialog}
                className="w-8 h-8 rounded flex items-center justify-center transition-all"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            {/* Form */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="اسم المنتج *"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="أدخل اسم المنتج"
                  error={formErrors.name}
                />
                <Input
                  label="الباركود"
                  value={formData.barcode}
                  onChange={(e) =>
                    setFormData({ ...formData, barcode: e.target.value })
                  }
                  placeholder="يُنشأ تلقائياً"
                />
                <Input
                  label="سعر البيع *"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                  placeholder="0"
                  error={formErrors.price}
                />
                <Input
                  label="سعر الشراء"
                  type="number"
                  value={formData.cost}
                  onChange={(e) =>
                    setFormData({ ...formData, cost: Number(e.target.value) })
                  }
                  placeholder="0"
                  error={formErrors.cost}
                />
                <Input
                  label="المخزون الحالي"
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: Number(e.target.value) })
                  }
                  placeholder="0"
                  error={formErrors.stock}
                />
                <Input
                  label="حد التنبيه"
                  type="number"
                  value={formData.stock_alert}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stock_alert: Number(e.target.value),
                    })
                  }
                  placeholder="10"
                  error={formErrors.stock_alert}
                />
                <div>
                  <label className="block text-[14px] font-medium mb-2 transition-theme" style={{ color: 'var(--text-primary)' }}>الوحدة</label>
                  <select
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value as any })
                    }
                    className="w-full h-[44px] rounded-lg px-3 outline-none text-[14px] transition-theme"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <option value="piece">قطعة</option>
                    <option value="kg">كيلو</option>
                    <option value="gram">جرام</option>
                    <option value="liter">لتر</option>
                    <option value="ml">ميلي لتر</option>
                    <option value="box">علبة</option>
                    <option value="carton">علبة حبر</option>
                    <option value="meter">متر</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[14px] font-medium mb-2 transition-theme" style={{ color: 'var(--text-primary)' }}>الفئة</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => {
                      const cat = categories.find((c: any) => c.id === e.target.value);
                      setFormData({
                        ...formData,
                        category_id: e.target.value,
                        category_name: cat?.name || 'مواد غذائية'
                      });
                    }}
                    className="w-full h-[44px] rounded-lg px-3 outline-none text-[14px] transition-theme"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>
                * الحقول الإلزامية
              </p>
            </div>
            
            {/* Actions */}
            <div 
              className="p-4 flex gap-3 transition-theme"
              style={{ backgroundColor: 'var(--surface-1)' }}
            >
              <Button variant="ghost" onClick={closeDialog} fullWidth disabled={isSaving}>
                إلغاء
              </Button>
              <LoadingButton 
                variant="success" 
                onClick={handleSave} 
                fullWidth 
                loading={isSaving}
                loadingText="جاري الحفظ..."
              >
                {editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}
              </LoadingButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
