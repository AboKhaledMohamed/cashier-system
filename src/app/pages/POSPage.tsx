/**
 * نقطة البيع (POS) - صفحة رئيسية
 * Smart POS System - POS Page
 * 
 * المميزات:
 * ✅ بحث متقدم (اسم + باركود)
 * ✅ سلة تسوق كاملة مع حسابات فورية
 * ✅ دعم نقاط الولاء
 * ✅ طرق دفع متعددة (نقدي، آجل، شبكة، فودافون، انستاباي)
 * ✅ حساب الضريبة على كل صنف
 * ✅ تعليق واسترجاع الفواتير
 * ✅ اختيار العميل للدفع الآجل مع تحذيرات
 * ✅ Keyboard shortcuts (F2, F4, F9, F12)
 * ✅ طباعة الإيصال
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import Header from '../components/Header';
import Button from '../components/ui/Button';
import { useShop } from '../context/ShopContext';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { notify, messages } from '../utils/toast';
import { Printer } from 'lucide-react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  Receipt,
  X,
  AlertTriangle,
  Gift,
} from 'lucide-react';
import type {
  Product,
  Customer,
  Invoice,
  InvoiceItem,
  Cart,
  CartItem as CartItemType,
  PaymentMethod,
  CurrentSession,
} from '../types/small-shop.types';

interface SuspendedInvoice {
  id: string;
  timestamp: string;
  items: CartItemType[];
  selectedCustomer?: string;
  paymentMethod: PaymentMethod;
  notes: string;
}

interface InvoiceDataForReceipt {
  id: string;
  invoice_number: string;
  date: string;
  time: string;
  user_name: string;
  customer_name?: string;
  customer_total_debt?: number;
  items: InvoiceItem[];
  subtotal: number;
  items_discount_total: number;
  invoice_discount_percent: number;
  invoice_discount_amount: number;
  tax_enabled: boolean;
  tax_rate: number;
  tax_amount: number;
  loyalty_points_earned: number;
  loyalty_points_redeemed: number;
  loyalty_discount_amount: number;
  total: number;
  payment_method: PaymentMethod;
  paid_amount: number;
  change_amount: number;
  credit_amount?: number;
  total_profit: number;
}

const paymentMethodLabels: Record<PaymentMethod, { label: string; color: string }> = {
  cash: { label: 'نقدي', color: '#2ECC71' },
  credit: { label: 'آجل', color: '#F1C40F' },
};

export default function POSPage() {
  // Context & Hooks
  const { products, customers: shopCustomers, loadProducts, loadCustomers, currentUser, currentSession: cashSession, settings } = useShop();
  const api = (window as any).electronAPI;
  
  // State Management
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [invoiceDiscountPercent, setInvoiceDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paidAmount, setPaidAmount] = useState(0);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [notes, setNotes] = useState('');
  const [invoiceDataForReceipt, setInvoiceDataForReceipt] = useState<InvoiceDataForReceipt | null>(null);
  const [suspendedInvoices, setSuspendedInvoices] = useState<SuspendedInvoice[]>([]);
  const [showSuspendedInvoices, setShowSuspendedInvoices] = useState(false);
  const [outOfStockWarning, setOutOfStockWarning] = useState<string | null>(null);
  const [todayStats, setTodayStats] = useState({
    sales: 0,
    invoices: 0,
    avgInvoice: 0,
    itemsSold: 0,
  });
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  
  // Customer search state
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerSearchResults, setCustomerSearchResults] = useState<Customer[]>([]);
  const [showCustomerResults, setShowCustomerResults] = useState(false);
  
  // Load today's stats from database - Real-time
  const loadTodayStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const stats = await api.reports.getSalesReport(today, today);
      const summary = stats.summary;
      // Count unique products sold (not duplicates)
      const uniqueProductIds = new Set<string>();
      stats.invoices.forEach((inv: any) => {
        inv.items?.forEach((item: any) => {
          if (item.product_id) uniqueProductIds.add(item.product_id);
        });
      });
      
      setTodayStats({
        sales: summary.total_sales || 0,
        invoices: summary.invoice_count || 0,
        avgInvoice: summary.invoice_count > 0 ? Math.round(summary.total_sales / summary.invoice_count) : 0,
        itemsSold: uniqueProductIds.size,
      });
    } catch (e) {
      console.error('Failed to load today stats:', e);
    }
  };

  // Load stats on mount
  useEffect(() => {
    loadTodayStats();
  }, []);
  
  // Load data on mount
  useEffect(() => {
    loadProducts();
    loadCustomers();
  }, []);

  // Real session from context
  const currentSession: CurrentSession = {
    user_id: currentUser?.id || 'user-admin-001',
    user_name: currentUser?.full_name || 'المدير',
    user_role: (currentUser?.role as any) || 'admin',
    can_apply_discount: !!(currentUser?.can_apply_discount),
    can_process_returns: true,
    can_manage_inventory: !!(currentUser?.can_manage_products),
    can_manage_customers: true,
    can_manage_users: currentUser?.role === 'admin',
    can_view_reports: !!(currentUser?.can_view_reports),
    can_manage_settings: currentUser?.role === 'admin',
    can_open_close_register: true,
    can_view_costs: !!(currentUser?.can_view_costs),
    current_cash_session_id: cashSession?.id || '',
    logged_in_at: new Date().toISOString(),
  };

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  
  // Ref for customer dropdown to detect clicks outside
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  
  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setSearchQuery('');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Close customer dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setShowCustomerResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const shopSettings = useMemo(() => {
    return {
      tax_enabled: !!(settings?.tax_enabled),
      tax_rate: settings?.tax_rate || 14,
      tax_inclusive: !!(settings?.tax_inclusive),
      loyalty_enabled: !!(settings?.loyalty_enabled),
      loyalty_points_per_100_egp: settings?.points_per_pound || 1,
      loyalty_redeemable: true,
      loyalty_points_value: settings?.pound_per_point || 1,
    };
  }, [settings]);

  // ============================================================================
  // CART CALCULATION — حسابات السلة
  // ============================================================================

  const calculateCart = (): Cart => {
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + item.item_subtotal;
    }, 0);

    const items_discount_total = cartItems.reduce((sum, item) => {
      return sum + item.item_discount_amount;
    }, 0);

    const afterItemsDiscount = subtotal - items_discount_total;
    const invoice_discount_amount = (afterItemsDiscount * invoiceDiscountPercent) / 100;

    const beforeTax = afterItemsDiscount - invoice_discount_amount;
    const tax_amount = shopSettings.tax_enabled ? (beforeTax * shopSettings.tax_rate) / 100 : 0;

    const total_loyalty_points = cartItems.reduce((sum, item) => {
      return sum + item.item_loyalty_points;
    }, 0);

    const points_discount = pointsToRedeem * shopSettings.loyalty_points_value;

    const total = beforeTax + tax_amount - points_discount;

    return {
      items: cartItems,
      subtotal,
      items_discount_total,
      invoice_discount_percent: invoiceDiscountPercent,
      invoice_discount_amount,
      tax_enabled: shopSettings.tax_enabled,
      tax_rate: shopSettings.tax_rate,
      tax_amount,
      total_loyalty_points,
      points_to_redeem: pointsToRedeem,
      points_discount,
      total: Math.max(0, total),
    };
  };

  const cart = calculateCart();

  // ============================================================================
  // SEARCH PRODUCTS — البحث عن المنتجات (محسّن مع useMemo)
  // ============================================================================

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(query) ||
        p.barcode?.includes(query) ||
        (p.barcode_alt && p.barcode_alt.includes(query))
    );
  }, [searchQuery, products]);

  const showSearchResults = searchQuery.trim().length > 0;

  // ============================================================================
  // ADD TO CART — إضافة للسلة
  // ============================================================================

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      notify.error(`عذراً، المنتج "${product.name}" غير متوفر في المخزون`);
      return;
    }

    const existingItemIndex = cartItems.findIndex((item) => item.product.id === product.id);

    if (existingItemIndex > -1) {
      const updatedItems = [...cartItems];
      const existingItem = updatedItems[existingItemIndex];
      
      const newQuantity = existingItem.quantity + 1;
      if (newQuantity > product.stock) {
        notify.warning(`الكمية المتوفرة من "${product.name}" هي ${product.stock} فقط`);
        return;
      }

      updatedItems[existingItemIndex] = recalculateCartItem(
        product,
        newQuantity,
        existingItem.item_discount_percent
      );
      setCartItems(updatedItems);
    } else {
      const newItem = recalculateCartItem(product, 1, 0);
      setCartItems([...cartItems, newItem]);
    }

    setSearchQuery('');
  };

  // ============================================================================
  // RECALCULATE CART ITEM — إعادة حساب عنصر السلة
  // ============================================================================

  const recalculateCartItem = (
    product: Product,
    quantity: number,
    discountPercent: number
  ): CartItemType => {
    const item_subtotal = product.price * quantity;
    const item_discount_amount = (item_subtotal * discountPercent) / 100;
    const afterDiscount = item_subtotal - item_discount_amount;
    const item_tax_enabled = shopSettings.tax_enabled;
    const item_tax_rate = shopSettings.tax_rate;
    const item_tax_amount = item_tax_enabled ? (afterDiscount * item_tax_rate) / 100 : 0;
    const item_total = afterDiscount + item_tax_amount;
    const item_loyalty_points = shopSettings.loyalty_enabled ? Math.floor(item_total / 100) : 0;
    const item_profit = (product.price - product.cost) * quantity;

    return {
      product,
      quantity,
      unit: product.unit,
      unit_price: product.price,
      item_subtotal,
      item_discount_percent: discountPercent,
      item_discount_amount,
      item_tax_enabled,
      item_tax_rate,
      item_tax_amount,
      item_total,
      item_loyalty_points,
      product_cost: product.cost,
      item_profit,
    };
  };

  // ============================================================================
  // UPDATE QUANTITY — تعديل الكمية
  // ============================================================================

  const updateQuantity = (productId: string, delta: number) => {
    const updatedItems = cartItems
      .map((item) => {
        if (item.product.id === productId) {
          const newQuantity = item.quantity + delta;
          if (newQuantity < 1) return null;
          if (newQuantity > item.product.stock) {
            notify.warning(`الكمية المتوفرة من "${item.product.name}" هي ${item.product.stock} فقط`);
            return item;
          }
          return recalculateCartItem(
            item.product,
            newQuantity,
            item.item_discount_percent
          );
        }
        return item;
      })
      .filter((item) => item !== null) as CartItemType[];

    setCartItems(updatedItems);
  };

  // ============================================================================
  // UPDATE ITEM DISCOUNT — تعديل خصم الصنف
  // ============================================================================

  const updateItemDiscount = (productId: string, discountPercent: number) => {
    const discountClamped = Math.min(100, Math.max(0, discountPercent));
    const updatedItems = cartItems.map((item) => {
      if (item.product.id === productId) {
        return recalculateCartItem(
          item.product,
          item.quantity,
          discountClamped
        );
      }
      return item;
    });
    setCartItems(updatedItems);
  };

  // ============================================================================
  // REMOVE FROM CART — إزالة من السلة
  // ============================================================================

  const removeFromCart = (productId: string) => {
    setCartItems(cartItems.filter((item) => item.product.id !== productId));
  };

  // ============================================================================
  // SUSPEND INVOICE — تعليق الفاتورة
  // ============================================================================

  const suspendInvoice = () => {
    if (cartItems.length === 0) {
      notify.error('السلة فارغة');
      return;
    }

    const suspendedInvoice: SuspendedInvoice = {
      id: `suspended-${Date.now()}`,
      timestamp: new Date().toISOString(),
      items: cartItems,
      selectedCustomer: selectedCustomer?.id,
      paymentMethod,
      notes,
    };

    setSuspendedInvoices([...suspendedInvoices, suspendedInvoice]);
    resetSale();
    notify.success('تم تعليق الفاتورة بنجاح');
  };

  // ============================================================================
  // RETRIEVE SUSPENDED INVOICE — استرجاع فاتورة معلقة
  // ============================================================================

  const retrieveSuspended = (suspendedId: string) => {
    const suspended = suspendedInvoices.find((inv) => inv.id === suspendedId);
    if (!suspended) return;

    setCartItems(suspended.items);
    if (suspended.selectedCustomer) {
      const customer = shopCustomers.find((c) => c.id === suspended.selectedCustomer);
      if (customer) setSelectedCustomer(customer);
    }
    setPaymentMethod(suspended.paymentMethod);
    setNotes(suspended.notes);
    setSuspendedInvoices(suspendedInvoices.filter((inv) => inv.id !== suspendedId));
    setShowSuspendedInvoices(false);
  };

  // ============================================================================
  // COMPLETE SALE — إتمام البيع
  // ============================================================================

  const completeSale = async (skipReceipt: boolean = false) => {
    if (cartItems.length === 0) {
      notify.error('السلة فارغة');
      return;
    }

    if (paymentMethod === 'credit') {
      if (!selectedCustomer) {
        notify.error('يرجى اختيار العميل للدفع الآجل');
        return;
      }

      if (selectedCustomer.is_blacklisted) {
        notify.error(`العميل "${selectedCustomer.name}" في قائمة الحظر - لا يمكن بيع آجل`);
        return;
      }

      const newCredit = selectedCustomer.credit_used + (cart.total - paidAmount);
      if (newCredit > selectedCustomer.credit_limit) {
        // Silent continue - no confirmation needed
      }

      if (paidAmount >= cart.total) {
        notify.warning('المبلغ المدفوع يساوي أو أكبر من الإجمالي - استخدم الدفع النقدي');
        return;
      }
    }

    const totalProfit = cartItems.reduce((sum, item) => sum + (item.item_profit || 0), 0);
    const profitAfterDiscount = totalProfit - cart.invoice_discount_amount;
    
    const invoiceNumber = `F-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')}`;

    // Create invoice data for receipt display
    const invoiceData: InvoiceDataForReceipt = {
      id: `inv-${Date.now()}`,
      invoice_number: invoiceNumber,
      date: new Date().toLocaleDateString('en-US'),
      time: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      user_name: currentSession.user_name,
      customer_name: selectedCustomer?.name,
      customer_total_debt: (selectedCustomer?.current_balance || 0) + (paymentMethod === 'credit' ? cart.total - paidAmount : 0),
      items: cartItems.map((item) => ({
        id: `item-${item.product.id}`,
        product_id: item.product.id,
        product_name: item.product.name,
        product_cost: item.product_cost ?? 0,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        item_discount_percent: item.item_discount_percent,
        item_discount_amount: item.item_discount_amount,
        item_tax_enabled: item.item_tax_enabled,
        item_tax_rate: item.item_tax_rate,
        item_tax_amount: item.item_tax_amount,
        item_total: item.item_total,
        profit_amount: item.item_profit || 0,
      })),
      subtotal: cart.subtotal,
      items_discount_total: cart.items_discount_total,
      invoice_discount_percent: cart.invoice_discount_percent,
      invoice_discount_amount: cart.invoice_discount_amount,
      tax_enabled: cart.tax_enabled,
      tax_rate: cart.tax_rate,
      tax_amount: cart.tax_amount,
      loyalty_points_earned: cart.total_loyalty_points,
      loyalty_points_redeemed: pointsToRedeem,
      loyalty_discount_amount: cart.points_discount,
      total: cart.total,
      payment_method: paymentMethod,
      paid_amount: paymentMethod === 'cash' ? cart.total : paidAmount,
      change_amount: paymentMethod === 'cash' ? Math.max(0, paidAmount - cart.total) : 0,
      credit_amount: paymentMethod === 'credit' ? cart.total - paidAmount : 0,
      total_profit: profitAfterDiscount,
    };

    // Save invoice via Electron IPC (handles stock, credit, loyalty, audit, notifications)
    try {
      const payMethod = paymentMethod === 'cash' ? 'نقدي' : 'آجل';
      const paidAmt = paymentMethod === 'cash' ? cart.total : paidAmount;
      const changeAmt = paymentMethod === 'cash' ? Math.max(0, paidAmount - cart.total) : 0;
      const creditAmt = paymentMethod === 'credit' ? cart.total - paidAmount : 0;

      // Create invoice and get the returned data with the correct invoice number
      const savedInvoice = await api.invoices.create({
        user_id: currentSession.user_id,
        user_name: currentSession.user_name,
        customer_id: selectedCustomer?.id || null,
        customer_name: selectedCustomer?.name || null,
        cash_session_id: currentSession.current_cash_session_id || null,
        subtotal: cart.subtotal,
        tax_amount: cart.tax_amount,
        discount_amount: cart.items_discount_total + cart.invoice_discount_amount,
        discount_type: 'مبلغ',
        discount_pct: cart.invoice_discount_percent,
        total: cart.total,
        payment_method: payMethod,
        paid: paidAmt,
        change_amount: changeAmt,
        credit_amount: creditAmt,
        points_earned: cart.total_loyalty_points,
        points_redeemed: pointsToRedeem,
        points_discount: cart.points_discount,
        notes: notes || null,
        items: cartItems.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          product_barcode: item.product.barcode,
          qty: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          cost_price: item.product_cost ?? 0,
          discount_amount: item.item_discount_amount,
          tax_amount: item.item_tax_amount,
          total: item.item_total,
        })),
      });

      // Refresh products to get updated stock
      loadProducts();

      // Refresh today's stats in real-time
      await loadTodayStats();

      // Update invoice data with the saved invoice number from backend
      const finalInvoiceData: InvoiceDataForReceipt = {
        ...invoiceData,
        id: savedInvoice.id,
        invoice_number: savedInvoice.invoice_number, // Use the actual invoice number from database
      };

      // Show receipt with correct invoice number (unless skipped)
      if (skipReceipt) {
        // Skip receipt and reset sale directly
        resetSale();
        notify.success('تم إتمام البيع بنجاح');
      } else {
        setInvoiceDataForReceipt(finalInvoiceData);
        setShowReceipt(true);
        notify.success('تم إتمام البيع بنجاح');
      }
    } catch (err: any) {
      notify.error(err.message || 'فشل في حفظ الفاتورة');
    }
  };

  // Complete Sale And Print — إتمام البيع وطباعة الفاتورة
  const completeSaleAndPrint = async () => {
    await completeSale();
    // After sale completes, trigger print dialog
    setTimeout(() => {
      window.print();
    }, 500);
  };

  // ============================================================================
  // KEYBOARD SHORTCUTS - optimized with refs to avoid re-registration
  // ============================================================================

  // Ref to access completeSale function - MUST be declared before keyboard effect
  const completeSaleRef = useRef<(skipReceipt?: boolean) => void>(null);
  useEffect(() => { completeSaleRef.current = completeSale; }, [completeSale]);

  // Ref to access completeSaleAndPrint function
  const completeSaleAndPrintRef = useRef<() => void>(null);
  useEffect(() => { completeSaleAndPrintRef.current = completeSaleAndPrint; }, [completeSaleAndPrint]);

  // Use refs to access current state values without re-registering listeners
  const cartItemsRef = useRef(cartItems);
  const cartRef = useRef(cart);
  const paymentMethodRef = useRef(paymentMethod);
  const selectedCustomerRef = useRef(selectedCustomer);
  const paidAmountRef = useRef(paidAmount);
  const showSuspendedInvoicesRef = useRef(showSuspendedInvoices);
  const suspendedInvoicesRef = useRef(suspendedInvoices);

  // Single effect to update all refs - more efficient than separate effects
  useEffect(() => {
    cartItemsRef.current = cartItems;
    cartRef.current = cart;
    paymentMethodRef.current = paymentMethod;
    selectedCustomerRef.current = selectedCustomer;
    paidAmountRef.current = paidAmount;
    showSuspendedInvoicesRef.current = showSuspendedInvoices;
    suspendedInvoicesRef.current = suspendedInvoices;
  }, [cartItems, cart, paymentMethod, selectedCustomer, paidAmount, showSuspendedInvoices, suspendedInvoices]);

  // Register keyboard shortcuts once - no dependencies that cause re-registration
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Access current values through refs
      const currentCartItems = cartItemsRef.current;
      const currentCart = cartRef.current;
      const currentPaymentMethod = paymentMethodRef.current;
      const currentSelectedCustomer = selectedCustomerRef.current;
      const currentPaidAmount = paidAmountRef.current;
      const currentShowSuspendedInvoices = showSuspendedInvoicesRef.current;
      const currentSuspendedInvoices = suspendedInvoicesRef.current;

      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
        // Show all products in dropdown
        setSearchQuery(' ');
      } else if (e.key === 'F4') {
        e.preventDefault();
        // Only suspend if there are items
        if (currentCartItems.length > 0) {
          const suspendedInvoice = {
            id: `suspended-${Date.now()}`,
            timestamp: new Date().toISOString(),
            items: currentCartItems,
            selectedCustomer: currentSelectedCustomer?.id,
            paymentMethod: currentPaymentMethod,
            notes: '',
          };
          setSuspendedInvoices(prev => [...prev, suspendedInvoice]);
          resetSale();
          notify.success('تم تعليق الفاتورة بنجاح');
        }
      } else if (e.key === 'F9') {
        e.preventDefault();
        setShowSuspendedInvoices(!currentShowSuspendedInvoices);
      } else if (e.key === 'F10') {
        e.preventDefault();
        // Complete sale only (no receipt)
        if (currentCartItems.length === 0) {
          notify.error('السلة فارغة');
          return;
        }
        // Trigger completeSale with skipReceipt=true through a ref callback
        completeSaleRef.current?.(true);
      } else if (e.key === 'F12') {
        e.preventDefault();
        // Complete sale and print
        if (currentCartItems.length === 0) {
          notify.error('السلة فارغة');
          return;
        }
        // Trigger completeSaleAndPrint through a ref callback
        completeSaleAndPrintRef.current?.();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []); // Empty dependencies - register once only

  // ============================================================================
  // RESET SALE — إعادة تعيين
  // ============================================================================

  const resetSale = () => {
    setCartItems([]);
    setSelectedCustomer(null);
    setInvoiceDiscountPercent(0);
    setPaidAmount(0);
    setPaymentMethod('cash');
    setPointsToRedeem(0);
    setNotes('');
    setSearchQuery('');
    setShowReceipt(false);
    setInvoiceDataForReceipt(null);
    setShowAddCustomerForm(false);
    setNewCustomerName('');
    setNewCustomerPhone('');
    // Clear customer search
    setCustomerSearchQuery('');
    setCustomerSearchResults([]);
    setShowCustomerResults(false);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div 
      className="min-h-screen transition-theme"
      style={{ backgroundColor: 'var(--page-bg)' }}
    >
      <Header title="نقطة البيع - POS" />

      {/* Top Stats Bar */}
      <div 
        className="border-b px-7 py-4 transition-theme"
        style={{ 
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)'
        }}
      >
        <div className="grid grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-[12px] mb-1 transition-theme" style={{ color: 'var(--text-muted)' }}>مبيعات اليوم</p>
            <p className="text-[21px] font-bold" style={{ color: 'var(--primary)' }}>
              {todayStats.sales.toLocaleString('en-US')} جنيه
            </p>
          </div>
          <div 
            className="text-center border-r border-l transition-theme" 
            style={{ borderColor: 'var(--border-color)' }}
          >
            <p className="text-[12px] mb-1 transition-theme" style={{ color: 'var(--text-muted)' }}>عدد الفواتير</p>
            <p className="text-[21px] font-bold" style={{ color: 'var(--info)' }}>
              {todayStats.invoices}
            </p>
          </div>
          <div 
            className="text-center border-l transition-theme" 
            style={{ borderColor: 'var(--border-color)' }}
          >
            <p className="text-[12px] mb-1 transition-theme" style={{ color: 'var(--text-muted)' }}>متوسط الفاتورة</p>
            <p className="text-[21px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>
              {todayStats.avgInvoice.toLocaleString('en-US')} جنيه
            </p>
          </div>
          <div className="text-center">
            <p className="text-[12px] mb-1 transition-theme" style={{ color: 'var(--text-muted)' }}>الأصناف المباعة</p>
            <p className="text-[21px] font-bold transition-theme" style={{ color: 'var(--accent-purple)' }}>
              {todayStats.itemsSold}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Main Content: Left (Products + Cart) | Right (Payment Section) */}
        <div className="flex gap-4 h-[calc(100vh-220px)]">
          {/* LEFT SECTION - Search + Cart */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Search Bar */}
            <div 
              ref={searchDropdownRef}
              className="rounded-lg p-3 transition-theme relative"
              style={{ backgroundColor: 'var(--card-bg)' }}
            >
              <p className="text-[13px] mb-2 transition-theme" style={{ color: 'var(--text-secondary)' }}>بحث سريع عن منتج</p>
              <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 transition-theme" style={{ color: 'var(--text-muted)' }} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="ابحث (اسم أو باركود) - F2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[50px] rounded-lg pr-14 pl-4 text-[16px] outline-none transition-theme"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  border: '2px solid var(--border-color)'
                }}
              />
              </div>

              {/* Search Results */}
              {showSearchResults && searchResults.length > 0 && (
                <div 
                  className="absolute z-10 left-3 right-3 mt-2 rounded-lg shadow-2xl max-h-[300px] overflow-y-auto transition-theme"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className={`flex items-center justify-between p-3 border-b last:border-0 ${
                        product.stock > 0 ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
                      }`}
                      style={{ borderColor: 'var(--border-color)' }}
                      onMouseEnter={(e) => product.stock > 0 && (e.currentTarget.style.backgroundColor = 'var(--surface-1)')}
                      onMouseLeave={(e) => product.stock > 0 && (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div>
                        <p className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>{product.name}</p>
                        <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>
                          {product.barcode} | مخزون: {product.stock}
                        </p>
                      </div>
                      <p className="text-[16px] font-bold" style={{ color: 'var(--primary)' }}>{product.price} جنيه</p>
                    </div>
                  ))}
                </div>
              )}
              {showSearchResults && searchResults.length === 0 && searchQuery.trim() && (
                <div 
                  className="mt-2 border rounded-lg p-3 transition-theme"
                  style={{ 
                    backgroundColor: 'var(--surface-1)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <p className="text-[13px] transition-theme" style={{ color: 'var(--text-muted)' }}>لا توجد نتائج مطابقة لهذا البحث</p>
                </div>
              )}
            </div>

            {/* Cart Table */}
            <div 
              className="rounded-lg flex flex-col flex-1 min-h-0 transition-theme"
              style={{ backgroundColor: 'var(--card-bg)' }}
            >
              <div className="px-4 pt-4">
                <h3 className="text-[16px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>سلة المبيعات</h3>
              </div>
              {/* Header */}
              <div 
                className="grid grid-cols-12 gap-3 p-4 text-[12px] font-medium transition-theme"
                style={{ 
                  borderBottom: '1px solid var(--border-color)',
                  color: 'var(--text-muted)'
                }}
              >
                <div className="col-span-4">المنتج</div>
                <div className="col-span-2 text-center">الكمية</div>
                <div className="col-span-2 text-center">السعر</div>
                <div className="col-span-2 text-center">الإجمالي</div>
                <div className="col-span-1"></div>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto">
                {cartItems.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-[16px] transition-theme" style={{ color: 'var(--text-muted)' }}>السلة فارغة</p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="grid grid-cols-12 gap-3 p-3 items-center transition-theme group"
                      style={{ 
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-1)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* Product Name */}
                      <div className="col-span-4">
                        <p className="text-[13px] font-medium transition-theme" style={{ color: 'var(--text-primary)' }}>{item.product.name}</p>
                        <p className="text-[11px] transition-theme" style={{ color: 'var(--text-muted)' }}>{item.product.barcode}</p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="col-span-2 flex items-center justify-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-6 h-6 rounded text-[12px] flex items-center justify-center"
                          style={{ backgroundColor: 'var(--danger)', color: 'var(--text-on-primary)' }}
                        >
                          -
                        </button>
                        <span 
                          className="text-[12px] font-bold w-10 text-center transition-theme"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="w-6 h-6 rounded text-[12px] flex items-center justify-center"
                          style={{ backgroundColor: 'var(--primary)', color: 'var(--text-on-primary)' }}
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <div className="col-span-2 text-center">
                        <p className="text-[12px] font-medium transition-theme" style={{ color: 'var(--text-primary)' }}>{item.unit_price}</p>
                      </div>

                      {/* Total */}
                      <div className="col-span-2 text-center">
                        <p className="text-[13px] font-bold" style={{ color: 'var(--primary)' }}>{formatCurrency(item.item_total)}</p>
                        {item.item_discount_amount > 0 && (
                          <p className="text-[10px]" style={{ color: 'var(--danger)' }}>-{formatCurrency(item.item_discount_amount)}</p>
                        )}
                      </div>

                      {/* Delete */}
                      <div className="col-span-1 text-center">
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="w-6 h-6 rounded transition-all opacity-0 group-hover:opacity-100"
                          style={{ 
                            color: 'var(--danger)',
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--danger)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Cart Footer */}
              {cartItems.length > 0 && (
                <div 
                  className="border-t-2 p-4 space-y-2 transition-theme"
                  style={{ 
                    borderColor: 'var(--primary)',
                    backgroundColor: 'var(--surface-1)'
                  }}
                >
                  <div 
                    className="flex items-center justify-between text-[12px] transition-theme"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <span>الأصناف: {cartItems.length}</span>
                    <span>الوحدات: {totalItems}</span>
                  </div>
                  <div className="space-y-1 text-[12px]">
                    <div className="flex justify-between">
                      <span>المجموع الفرعي:</span>
                      <span className="font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>{formatCurrency(cart.subtotal)}</span>
                    </div>
                    {cart.items_discount_total > 0 && (
                      <div className="flex justify-between" style={{ color: 'var(--danger)' }}>
                        <span>خصم أصناف:</span>
                        <span>-{formatCurrency(cart.items_discount_total)}</span>
                      </div>
                    )}
                    {cart.invoice_discount_amount > 0 && (
                      <div className="flex justify-between" style={{ color: 'var(--danger)' }}>
                        <span>خصم إضافي:</span>
                        <span>-{formatCurrency(cart.invoice_discount_amount)}</span>
                      </div>
                    )}
                    {cart.tax_enabled && cart.tax_amount > 0 && (
                      <div className="flex justify-between" style={{ color: 'var(--info)' }}>
                        <span>ضريبة ({cart.tax_rate}%):</span>
                        <span>+{formatCurrency(cart.tax_amount)}</span>
                      </div>
                    )}
                    {cart.points_discount > 0 && (
                      <div className="flex justify-between" style={{ color: 'var(--warning)' }}>
                        <span>استرجاع نقاط:</span>
                        <span>-{formatCurrency(cart.points_discount)}</span>
                      </div>
                    )}
                  </div>
                  <div 
                    className="flex justify-between text-[16px] font-bold pt-2 border-t"
                    style={{ borderColor: 'var(--primary)' }}
                  >
                    <span>الإجمالي النهائي:</span>
                    <span style={{ color: 'var(--primary)' }}>{formatCurrency(cart.total)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Keyboard Shortcuts */}
            <div 
              className="rounded-lg p-2 grid grid-cols-5 gap-2 text-center transition-theme"
              style={{ backgroundColor: 'var(--card-bg)' }}
            >
              <div>
                <kbd 
                  className="px-2 py-1 rounded font-bold text-[12px] transition-theme"
                  style={{ backgroundColor: 'var(--surface-1)', color: 'var(--primary)' }}
                >F2</kbd>
                <p className="text-[10px] transition-theme" style={{ color: 'var(--text-muted)' }}>بحث</p>
              </div>
              <div>
                <kbd 
                  className="px-2 py-1 rounded font-bold text-[12px] transition-theme"
                  style={{ backgroundColor: 'var(--surface-1)', color: 'var(--warning)' }}
                >F4</kbd>
                <p className="text-[10px] transition-theme" style={{ color: 'var(--text-muted)' }}>تعليق</p>
              </div>
              <div>
                <kbd 
                  className="px-2 py-1 rounded font-bold text-[12px] transition-theme"
                  style={{ backgroundColor: 'var(--surface-1)', color: 'var(--info)' }}
                >F9</kbd>
                <p className="text-[10px] transition-theme" style={{ color: 'var(--text-muted)' }}>استرجاع</p>
              </div>
              <div>
                <kbd 
                  className="px-2 py-1 rounded font-bold text-[12px] transition-theme"
                  style={{ backgroundColor: 'var(--surface-1)', color: 'var(--primary)' }}
                >F10</kbd>
                <p className="text-[10px] transition-theme" style={{ color: 'var(--text-muted)' }}>حفظ</p>
              </div>
              <div>
                <kbd 
                  className="px-2 py-1 rounded font-bold text-[12px] transition-theme"
                  style={{ backgroundColor: 'var(--surface-1)', color: 'var(--success)' }}
                >F12</kbd>
                <p className="text-[10px] transition-theme" style={{ color: 'var(--text-muted)' }}>طباعة</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="danger" onClick={resetSale} fullWidth>
                إلغاء البيع
              </Button>
              <Button
                variant="warning"
                onClick={suspendInvoice}
                disabled={cartItems.length === 0}
                fullWidth
                className="text-[#1A1A2E]"
              >
                تعليق (F4)
              </Button>
            </div>
          </div>

          {/* RIGHT SECTION - Payment */}
          <div className="w-[420px] flex flex-col gap-4">
            {/* Payment Method Selection */}
            <div 
              className="rounded-lg p-4 space-y-3 transition-theme"
              style={{ backgroundColor: 'var(--card-bg)' }}
            >
              <h3 className="text-[16px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>طريقة الدفع</h3>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(paymentMethodLabels) as PaymentMethod[]).map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className="py-2 rounded-lg text-[13px] font-medium transition-all"
                    style={{
                      backgroundColor: paymentMethod === method ? 'var(--input-bg)' : 'var(--surface-1)',
                      color: paymentMethod === method ? 'var(--text-primary)' : 'var(--text-secondary)',
                      border: paymentMethod === method ? '2px solid var(--primary)' : '1px solid var(--border-color)'
                    }}
                  >
                    {paymentMethodLabels[method].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Discount Section */}
            <div 
              className="rounded-lg p-4 space-y-3 transition-theme"
              style={{ backgroundColor: 'var(--card-bg)' }}
            >
              <h3 className="text-[16px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>خصم إضافي</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={invoiceDiscountPercent}
                  onChange={(e) => setInvoiceDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                  className="flex-1 h-[40px] rounded px-3 text-center font-bold outline-none transition-theme"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)'
                  }}
                  placeholder="0"
                  min="0"
                  max="100"
                />
                <span className="text-[14px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>%</span>
              </div>
              {cart.invoice_discount_amount > 0 && (
                <p className="text-[13px]" style={{ color: 'var(--danger)' }}>
                  الخصم: -{formatCurrency(cart.invoice_discount_amount)}
                </p>
              )}
            </div>

            {/* Loyalty Points Section */}
            {shopSettings.loyalty_enabled && cart.total_loyalty_points > 0 && (
              <div 
                className="rounded-lg p-4 space-y-3 transition-theme"
                style={{ 
                  backgroundColor: 'var(--warning-bg)',
                  border: '1px solid var(--warning)'
                }}
              >
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5" style={{ color: 'var(--warning)' }} />
                  <h3 className="text-[16px] font-bold" style={{ color: 'var(--warning)' }}>نقاط الولاء</h3>
                </div>
                <div className="text-[13px] space-y-2 transition-theme" style={{ color: 'var(--text-primary)' }}>
                  <div className="flex justify-between">
                    <span>النقاط المكتسبة:</span>
                    <span className="font-bold">{cart.total_loyalty_points}</span>
                  </div>
                  {selectedCustomer && selectedCustomer.loyalty_points > 0 && (
                    <>
                      <div 
                        className="flex justify-between pt-2"
                        style={{ borderTop: '1px solid var(--warning)' }}
                      >
                        <span>نقاط العميل:</span>
                        <span className="font-bold">{selectedCustomer.loyalty_points}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={pointsToRedeem}
                          onChange={(e) =>
                            setPointsToRedeem(Math.min(selectedCustomer.loyalty_points, Math.max(0, Number(e.target.value) || 0)))
                          }
                          className="flex-1 h-[32px] rounded px-2 text-center font-bold outline-none transition-theme"
                          style={{
                            backgroundColor: 'var(--input-bg)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-color)'
                          }}
                          placeholder="0"
                        />
                        <span className="text-[12px]">نقطة</span>
                      </div>
                      {pointsToRedeem > 0 && (
                        <p style={{ color: 'var(--warning)' }}>
                          قيمة النقاط: {formatCurrency(pointsToRedeem * shopSettings.loyalty_points_value)}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Customer Selection */}
            {paymentMethod === 'credit' && (
              <div 
                className="rounded-lg p-4 space-y-3 transition-theme"
                style={{ backgroundColor: 'var(--card-bg)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5" style={{ color: 'var(--warning)' }} />
                    <h3 className="text-[16px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>بيانات العملاء</h3>
                  </div>
                  <button
                    onClick={() => setShowAddCustomerForm(true)}
                    className="w-7 h-7 rounded flex items-center justify-center transition-all"
                    style={{ backgroundColor: 'var(--primary-light)' }}
                    title="إضافة عميل جديد"
                  >
                    <Plus className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                  </button>
                </div>

                {/* Customer Selection - Searchable */}
                <div className="relative" ref={customerDropdownRef}>
                  <input
                    type="text"
                    placeholder="ابحث عن عميل..."
                    value={customerSearchQuery}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCustomerSearchQuery(value);
                      if (value.trim()) {
                        // Find matching customers
                        const matches = shopCustomers.filter((c) => 
                          c.name.toLowerCase().includes(value.toLowerCase()) ||
                          c.phone.includes(value)
                        );
                        setCustomerSearchResults(matches);
                        setShowCustomerResults(true);
                        // Auto-select if exact match
                        if (matches.length === 1 && matches[0].name.toLowerCase() === value.toLowerCase()) {
                          setSelectedCustomer(matches[0]);
                        }
                      } else {
                        setCustomerSearchResults([]);
                        setShowCustomerResults(false);
                        setSelectedCustomer(null);
                      }
                    }}
                    className="w-full h-[40px] rounded px-3 outline-none transition-theme"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)'
                    }}
                  />
                  
                  {/* Customer Search Results */}
                  {showCustomerResults && customerSearchQuery.trim() && (
                    <div 
                      className="absolute z-10 w-full mt-2 rounded-lg shadow-xl max-h-[200px] overflow-y-auto transition-theme"
                      style={{
                        backgroundColor: 'var(--card-bg)',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      {customerSearchResults.length > 0 ? (
                        customerSearchResults.map((customer) => (
                          <div
                            key={customer.id}
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setCustomerSearchQuery(customer.name);
                              setShowCustomerResults(false);
                            }}
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
                        ))
                      ) : (
                        <div className="p-3 text-center text-[13px] transition-theme" style={{ color: 'var(--text-muted)' }}>
                          لا يوجد عميل بهذا الاسم
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Add Customer Form */}
                {showAddCustomerForm && (
                  <div 
                    className="rounded p-3 space-y-3 transition-theme"
                    style={{ 
                      backgroundColor: 'var(--surface-1)',
                      border: '1px solid var(--primary)'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-[14px] font-bold" style={{ color: 'var(--primary)' }}>إضافة عميل جديد</h4>
                      <button
                        onClick={() => setShowAddCustomerForm(false)}
                        className="w-6 h-6 rounded flex items-center justify-center transition-all"
                        style={{ backgroundColor: 'var(--danger-bg)' }}
                      >
                        <X className="w-3 h-3" style={{ color: 'var(--danger)' }} />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="اسم العميل *"
                      value={newCustomerName}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^[\u0600-\u06FFa-zA-Z0-9\s]*$/.test(value)) {
                          setNewCustomerName(value);
                        }
                      }}
                      className="w-full h-[36px] rounded px-3 text-[13px] outline-none transition-theme"
                      style={{
                        backgroundColor: 'var(--input-bg)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)'
                      }}
                    />
                    <input
                      type="tel"
                      placeholder="رقم التليفون *"
                      value={newCustomerPhone}
                      onChange={(e) => setNewCustomerPhone(e.target.value)}
                      className="w-full h-[36px] rounded px-3 text-[13px] outline-none transition-theme"
                      style={{
                        backgroundColor: 'var(--input-bg)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)'
                      }}
                    />
                    <Button
                      variant="success"
                      size="default"
                      fullWidth
                      onClick={async () => {
                        if (!newCustomerName.trim() || !newCustomerPhone.trim()) {
                          notify.error('يرجى إدخال اسم العميل ورقم التليفون');
                          return;
                        }
                        if (!/^[\u0600-\u06FFa-zA-Z0-9\s]+$/.test(newCustomerName.trim())) {
                          notify.error('اسم العميل يجب أن يحتوي على حروف وأرقام فقط بدون رموز');
                          return;
                        }
                        try {
                          // Create customer in database
                          const newCustomer = await api.customers.create({
                            name: newCustomerName.trim(),
                            phone: newCustomerPhone.trim(),
                          });
                          // Refresh customers list
                          await loadCustomers();
                          // Select the new customer
                          const createdCustomer = shopCustomers.find((c: Customer) => c.id === newCustomer.id) || newCustomer;
                          setSelectedCustomer(createdCustomer);
                          notify.success('تم إضافة العميل بنجاح');
                          setShowAddCustomerForm(false);
                          setNewCustomerName('');
                          setNewCustomerPhone('');
                        } catch (e: any) {
                          notify.error(e.message || 'فشل في إضافة العميل');
                        }
                      }}
                      disabled={!newCustomerName.trim() || !newCustomerPhone.trim()}
                    >
                      إضافة العميل
                    </Button>
                  </div>
                )}

                {selectedCustomer && (
                  <div 
                    className="rounded p-3 space-y-2 text-[13px] transition-theme"
                    style={{ backgroundColor: 'var(--surface-1)' }}
                  >
                    {selectedCustomer.is_blacklisted && (
                      <div 
                        className="rounded p-2 flex items-start gap-2 transition-theme"
                        style={{ backgroundColor: 'var(--danger-bg)', border: '1px solid var(--danger)' }}
                      >
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--danger)' }} />
                        <span className="font-bold" style={{ color: 'var(--danger)' }}>محظور - لا بيع آجل</span>
                      </div>
                    )}
                    {selectedCustomer.credit_available < cart.total - paidAmount && (
                      <div 
                        className="rounded p-2 flex items-start gap-2 transition-theme"
                        style={{ backgroundColor: 'var(--warning-bg)', border: '1px solid var(--warning)' }}
                      >
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />
                        <span className="font-bold" style={{ color: 'var(--warning)' }}>تحذير: سيتجاوز الحد الائتماني</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-muted)' }}>الحد الائتماني:</span>
                      <span className="font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>{selectedCustomer.credit_limit} جنيه</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-muted)' }}>المستخدم:</span>
                      <span className="font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>{selectedCustomer.credit_used} جنيه</span>
                    </div>
                    <div 
                      className="flex justify-between pt-2 transition-theme"
                      style={{ borderTop: '1px solid var(--border-color)' }}
                    >
                      <span style={{ color: 'var(--text-muted)' }}>المتاح:</span>
                      <span 
                        className="font-bold"
                        style={{ color: selectedCustomer.credit_available > 0 ? 'var(--primary)' : 'var(--danger)' }}
                      >
                        {selectedCustomer.credit_available} جنيه
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[13px] font-medium transition-theme" style={{ color: 'var(--text-secondary)' }}>المبلغ المدفوع</label>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full h-[40px] rounded px-3 text-center font-bold outline-none transition-theme"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)'
                    }}
                    placeholder="0"
                  />
                </div>

                {paidAmount < cart.total && (
                  <div 
                    className="rounded p-3 transition-theme"
                    style={{ backgroundColor: 'var(--warning-bg)', border: '1px solid var(--warning)' }}
                  >
                    <div className="flex justify-between text-[13px] font-bold">
                      <span>الدين على العميل:</span>
                      <span style={{ color: 'var(--warning)' }}>{formatCurrency(cart.total - paidAmount)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Total Section */}
            <div 
              className="rounded-lg p-4 space-y-3 transition-theme"
              style={{ 
                backgroundColor: 'var(--primary-light)',
                border: '2px solid var(--primary)'
              }}
            >
              <p className="text-[12px] transition-theme" style={{ color: 'var(--text-secondary)' }}>ملخص الدفع</p>
              <div 
                className="text-[18px] font-bold"
                style={{ color: 'var(--primary)' }}
              >
                <div className="flex justify-between">
                  <span>الإجمالي:</span>
                  <span>{formatCurrency(cart.total)}</span>
                </div>
              </div>
              {paymentMethod === 'cash' && (
                <p className="text-[13px] transition-theme" style={{ color: 'var(--text-secondary)' }}>
                  الدفع النقدي
                </p>
              )}
            </div>

            {/* Complete Sale Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="primary"
                fullWidth
                onClick={() => completeSale(true)}
                disabled={cartItems.length === 0 || (paymentMethod === 'credit' && !selectedCustomer)}
                size="large"
                className="text-[16px]"
              >
                حفظ (F10)
              </Button>
              <Button
                variant="success"
                fullWidth
                onClick={completeSaleAndPrint}
                disabled={cartItems.length === 0 || (paymentMethod === 'credit' && !selectedCustomer)}
                size="large"
                className="text-[16px] flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" />
                حفظ وطباعة (F12)
              </Button>
            </div>

            {/* Suspended Invoices */}
            {suspendedInvoices.length > 0 && (
              <Button
                variant="info"
                fullWidth
                onClick={() => setShowSuspendedInvoices(!showSuspendedInvoices)}
                style={{ backgroundColor: 'var(--info)' }}
              >
                الفواتير المعلقة ({suspendedInvoices.length})
              </Button>
            )}

            {showSuspendedInvoices && suspendedInvoices.length > 0 && (
              <div 
                className="rounded-lg p-4 space-y-2 max-h-[200px] overflow-y-auto transition-theme"
                style={{ backgroundColor: 'var(--card-bg)' }}
              >
                {suspendedInvoices.map((suspended) => (
                  <button
                    key={suspended.id}
                    onClick={() => retrieveSuspended(suspended.id)}
                    className="w-full text-left p-3 rounded transition-all"
                    style={{ 
                      backgroundColor: 'var(--surface-1)',
                      border: '1px solid var(--border-color)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                      e.currentTarget.style.borderColor = 'var(--primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--surface-1)';
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                    }}
                  >
                    <p className="text-[13px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>
                      {suspended.items.length} أصناف
                    </p>
                    <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>
                      {new Date(suspended.timestamp).toLocaleTimeString('ar-EG', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && invoiceDataForReceipt && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'var(--overlay-bg)' }}
        >
          <div 
            className="w-[420px] rounded-lg overflow-hidden flex flex-col max-h-[90vh] transition-theme"
            style={{ backgroundColor: 'var(--input-bg)' }}
          >
            <div 
              className="p-4 flex items-center justify-between flex-shrink-0"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <div className="flex items-center gap-2">
                <Receipt className="w-6 h-6" style={{ color: 'var(--text-on-primary)' }} />
                <h3 className="text-[20px] font-bold" style={{ color: 'var(--text-on-primary)' }}>إيصال البيع</h3>
              </div>
              <button
                onClick={() => {
                  setShowReceipt(false);
                  resetSale();
                }}
                className="w-8 h-8 rounded flex items-center justify-center transition-all"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <X className="w-5 h-5" style={{ color: 'var(--text-on-primary)' }} />
              </button>
            </div>

            <div 
              className="flex-1 overflow-y-auto p-6 transition-theme"
              style={{ color: 'var(--text-primary)' }}
              dir="rtl"
            >
              <div 
                className="text-center mb-6 pb-4 border-b-2 border-dashed transition-theme"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <h2 className="text-[24px] font-bold mb-1 transition-theme" style={{ color: 'var(--text-primary)' }}>الكاشير الذكي</h2>
                <p className="text-[13px] transition-theme" style={{ color: 'var(--text-muted)' }}>نظام إدارة نقاط البيع</p>
              </div>

              <div className="space-y-2 mb-4 text-[13px]">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>الفاتورة:</span>
                  <span className="font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>{invoiceDataForReceipt.invoice_number}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>التاريخ:</span>
                  <span className="font-medium transition-theme" style={{ color: 'var(--text-primary)' }}>{invoiceDataForReceipt.date}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>الوقت:</span>
                  <span className="font-medium transition-theme" style={{ color: 'var(--text-primary)' }}>{invoiceDataForReceipt.time}</span>
                </div>
                {invoiceDataForReceipt.customer_name && (
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>العميل:</span>
                    <span className="font-medium transition-theme" style={{ color: 'var(--text-primary)' }}>{invoiceDataForReceipt.customer_name}</span>
                  </div>
                )}
              </div>

              <div 
                className="border-t border-b py-3 mb-4 transition-theme"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <table className="w-full text-[12px]">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <th className="text-right pb-2 transition-theme" style={{ color: 'var(--text-primary)' }}>المنتج</th>
                      <th className="text-center pb-2 transition-theme" style={{ color: 'var(--text-primary)' }}>الكمية</th>
                      <th className="text-left pb-2 transition-theme" style={{ color: 'var(--text-primary)' }}>الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceDataForReceipt.items.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px dashed var(--border-color)' }}>
                        <td className="py-2 text-right">
                          <p className="font-medium transition-theme" style={{ color: 'var(--text-primary)' }}>{item.product_name}</p>
                          <p className="text-[11px] transition-theme" style={{ color: 'var(--text-muted)' }}>{item.unit_price} × {item.quantity}</p>
                        </td>
                        <td className="py-2 text-center font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>{item.quantity}</td>
                        <td className="py-2 text-left font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>{formatCurrency(item.item_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-1 text-[12px] mb-4">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>المجموع الفرعي:</span>
                  <span className="font-medium transition-theme" style={{ color: 'var(--text-primary)' }}>{formatCurrency(invoiceDataForReceipt.subtotal)}</span>
                </div>
                {invoiceDataForReceipt.items_discount_total > 0 && (
                  <div className="flex justify-between" style={{ color: 'var(--danger)' }}>
                    <span>خصم الأصناف:</span>
                    <span>-{formatCurrency(invoiceDataForReceipt.items_discount_total)}</span>
                  </div>
                )}
                {invoiceDataForReceipt.invoice_discount_amount > 0 && (
                  <div className="flex justify-between" style={{ color: 'var(--danger)' }}>
                    <span>خصم إضافي:</span>
                    <span>-{formatCurrency(invoiceDataForReceipt.invoice_discount_amount)}</span>
                  </div>
                )}
                {invoiceDataForReceipt.tax_enabled && invoiceDataForReceipt.tax_amount > 0 && (
                  <div className="flex justify-between" style={{ color: 'var(--info)' }}>
                    <span>ضريبة ({invoiceDataForReceipt.tax_rate}%):</span>
                    <span>+{formatCurrency(invoiceDataForReceipt.tax_amount)}</span>
                  </div>
                )}
                <div 
                  className="flex justify-between text-[16px] font-bold pt-2 border-t-2"
                  style={{ borderColor: 'var(--primary)' }}
                >
                  <span>الإجمالي:</span>
                  <span style={{ color: 'var(--primary)' }}>{formatCurrency(invoiceDataForReceipt.total)}</span>
                </div>
              </div>

              <div 
                className="rounded p-3 mb-4 text-[12px] transition-theme"
                style={{ backgroundColor: 'var(--surface-1)' }}
              >
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>طريقة الدفع:</span>
                  <span className="font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>{paymentMethodLabels[invoiceDataForReceipt.payment_method].label}</span>
                </div>
                {invoiceDataForReceipt.payment_method === 'credit' && (
                  <>
                    <div className="flex justify-between mt-2 pt-2 transition-theme" style={{ borderTop: '1px solid var(--border-color)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>المبلغ المدفوع:</span>
                      <span className="font-bold" style={{ color: 'var(--primary)' }}>{formatCurrency(invoiceDataForReceipt.paid_amount || 0)}</span>
                    </div>
                    {(invoiceDataForReceipt.credit_amount || 0) > 0 && (
                      <div className="flex justify-between mt-1">
                        <span style={{ color: 'var(--text-muted)' }}>مبلغ الدين:</span>
                        <span className="font-bold" style={{ color: 'var(--warning)' }}>{formatCurrency(invoiceDataForReceipt.credit_amount || 0)}</span>
                      </div>
                    )}
                    {invoiceDataForReceipt.customer_total_debt !== undefined && (
                      <div className="flex justify-between mt-2 pt-2 transition-theme" style={{ borderTop: '1px dashed var(--danger)', color: 'var(--danger)' }}>
                        <span className="font-bold">إجمالي الدين الكلي:</span>
                        <span className="font-bold">{formatCurrency(invoiceDataForReceipt.customer_total_debt)}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div 
                className="text-center text-[11px] border-t border-dashed pt-4 transition-theme"
                style={{ color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}
              >
                <p>شكراً لتعاملكم معنا</p>
                <p>الكاشير الذكي - Smart POS v1.0</p>
              </div>
            </div>

            <div 
              className="p-4 flex gap-3 flex-shrink-0 transition-theme"
              style={{ backgroundColor: 'var(--surface-1)' }}
            >
              <Button
                variant="primary"
                fullWidth
                onClick={() => window.print()}
                style={{ backgroundColor: 'var(--primary)' }}
              >
                طباعة
              </Button>
              <Button
                variant="success"
                fullWidth
                onClick={() => {
                  setShowReceipt(false);
                  resetSale();
                }}
                style={{ backgroundColor: 'var(--success)' }}
              >
                فاتورة جديدة
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
