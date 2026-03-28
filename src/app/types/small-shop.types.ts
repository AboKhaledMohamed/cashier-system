/**
 * نظام الكاشير الذكي — نسخة المحلات الصغيرة
 * Smart POS System - Small Shop Edition
 * 
 * TypeScript Interfaces للنسخة الـ Offline-First
 * مخزن واحد + فرع واحد + SQLite محلي 100%
 * 
 * الإصدار: 1.0
 * التاريخ: 24 مارس 2026
 */

// ============================================================================
// 1️⃣ TYPES & ENUMS الأساسية
// ============================================================================

/** أنواع المنتجات */
export type ProductType = 'piece' | 'weight' | 'box' | 'carton' | 'meter' | 'liter' | 'bundle';

/** وحدات القياس */
export type Unit = 'piece' | 'kg' | 'gram' | 'box' | 'carton' | 'meter' | 'cm' | 'liter' | 'ml' | 'bundle';

/** طرق الدفع */
export type PaymentMethod = 'cash' | 'credit';

/** مستويات الثقة للعملاء */
export type TrustLevel = 'excellent' | 'good' | 'average' | 'poor' | 'bad';

/** أدوار المستخدمين */
export type UserRole = 'admin' | 'manager' | 'cashier';

/** أنواع العمليات في المخزون */
export type StockMovementType = 'sale' | 'purchase' | 'adjustment' | 'return' | 'damage' | 'free_sample';

/** حالات الفاتورة */
export type InvoiceStatus = 'completed' | 'pending' | 'cancelled' | 'returned';

/** حالات جلسة الكاشير */
export type CashSessionStatus = 'open' | 'closed' | 'pending';

/** حالات الدفع */
export type PaymentStatus = 'pending' | 'completed' | 'partially_paid' | 'overdue' | 'cancelled';

/** تصنيفات المصاريف */
export type ExpenseCategory = 'rent' | 'electricity' | 'water' | 'salary' | 'supplies' | 'maintenance' | 'other';

// ============================================================================
// 2️⃣ SHOP SETTINGS — إعدادات المحل (سجل واحد فقط)
// ============================================================================

export interface ShopSettings {
  id: '1'; // يجب أن يكون الـ ID دايماً "1"
  
  // بيانات المحل
  name: string;
  slogan?: string;
  owner_name: string;
  owner_phone: string;
  address: string;
  city?: string;
  logo_url?: string;
  
  // الضريبة
  tax_enabled: boolean;
  tax_rate: number; // النسبة: 0-100
  tax_inclusive: boolean; // شاملة أم مضافة
  
  // الطابعة
  receipt_width: 'thermal_58mm' | 'thermal_80mm' | 'a4';
  
  // نقاط الولاء
  loyalty_enabled: boolean;
  loyalty_points_per_100_egp: number; // كم نقطة لكل 100 جنيه (مثلاً 1 نقطة)
  loyalty_redeemable: boolean; // هل يمكن استردادها
  loyalty_points_value: number; // قيمة النقطة بالجنيه
  
  // التنبيهات
  stock_alert_threshold: number; // حد التنبيه الافتراضي للمخزون
  expiry_alert_days: number; // تنبيه قبل انتهاء الصلاحية بـ X يوم
  
  // النسخ الاحتياطي
  auto_backup_enabled: boolean;
  backup_folder?: string;
  last_backup_at?: string;
  
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 3️⃣ USERS — المستخدمين (3 أدوار فقط)
// ============================================================================

export interface User {
  id: string; // مثل: "user-admin-001"
  
  // بيانات الدخول
  username: string;
  password_hash: string;
  pin?: string; // رقم PIN سريع (4 أرقام)
  
  // البيانات الشخصية
  full_name: string;
  phone?: string;
  
  // الدور والصلاحيات (ثابتة حسب الدور)
  role: UserRole;
  
  // الصلاحيات حسب الدور
  can_apply_discount: boolean;
  can_process_returns: boolean;
  can_manage_inventory: boolean;
  can_manage_customers: boolean;
  can_manage_users: boolean;
  can_view_reports: boolean;
  can_manage_settings: boolean;
  can_open_close_register: boolean;
  can_view_costs: boolean;
  
  // الحالة
  is_active: boolean;
  last_login_at?: string;
  
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 4️⃣ CATEGORIES — تصنيفات المنتجات
// ============================================================================

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string; // لون للتمييز في الواجهة
  icon?: string; // Lucide icon name
  parent_id?: string; // للتصنيفات الفرعية
  order: number; // ترتيب العرض
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 5️⃣ PRODUCTS — المنتجات
// ============================================================================

export interface Product {
  id: string;
  
  // الاسم والوصف
  name: string;
  barcode: string;
  barcode_alt?: string; // باركود بديل
  description?: string;
  
  // التصنيف
  category_id: string;
  category_name?: string;
  
  // الأسعار
  price: number; // سعر البيع النهائي
  cost: number; // سعر التكلفة
  
  // الوحدات
  unit: Unit; // الوحدة الأساسية: piece, kg, liter, etc
  
  // المخزون (مخزن واحد فقط)
  stock: number; // الكمية الحالية
  stock_alert: number; // حد التنبيه
  
  // التواريخ والصلاحية
  production_date?: string; // YYYY-MM-DD تاريخ الإنتاج
  expiry_date?: string; // YYYY-MM-DD
  expiry_alert_days: number; // تنبيه قبل الانتهاء بـ X يوم
  
  // نوع المنتج
  product_type: ProductType;
  is_service: boolean; // منتج أم خدمة
  is_daily_production: boolean; // إنتاج يومي (خبز، حلويات)
  
  // الصورة
  image_url?: string;
  
  // ترتيب العرض في POS
  pos_order: number;
  
  // الحالة
  is_active: boolean;
  
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 6️⃣ SUPPLIERS — الموردين
// ============================================================================

export interface Supplier {
  id: string;

  // البيانات الأساسية
  name: string;
  phone: string;
  phone2?: string;
  email?: string;

  // العنوان
  address?: string;

  // الديون
  debt_limit: number; // حد الدين المسموح
  debt_used: number; // المبلغ المدين حالياً
  debt_remaining: number; // الحد المتبقي = debt_limit - debt_used

  // تصنيف الثقة
  trust_level: TrustLevel;

  // المشتريات من المورد
  total_purchases: number; // عدد فواتير المشتريات
  total_purchases_amount: number; // إجمالي قيمة المشتريات
  last_purchase_date?: string;
  last_purchase_amount?: number;

  // التحكم
  is_active: boolean;
  is_blacklisted: boolean;

  // الملاحظات
  notes?: string;

  created_at: string;
  updated_at: string;
}

// ============================================================================
// 7️⃣ CUSTOMERS — العملاء
// ============================================================================

export interface CustomerAddress {
  area?: string; // الحي
  street?: string; // الشارع
  building?: string; // المبنى
  apartment?: string; // الشقة
  landmark?: string; // علامة مميزة
}

export interface Customer {
  id: string;
  
  // البيانات الأساسية
  name: string;
  phone: string;
  phone2?: string;
  email?: string;
  
  // العنوان
  address?: CustomerAddress;
  
  // الديون والائتمان
  credit_limit: number; // حد الدين المسموح
  credit_used: number; // المبلغ المستخدم من الحد
  credit_available: number; // الحد المتبقي = credit_limit - credit_used
  
  // نظام الثقة
  trust_score: number; // من 0 إلى 100
  trust_level: TrustLevel; // ممتاز / جيد / متوسط / ضعيف / سيء
  late_payment_count: number; // عدد تأخرات الدفع
  
  // نقاط الولاء
  loyalty_points: number;
  
  // المشتريات
  total_purchases: number; // إجمالي الشراء
  total_purchases_amount: number;
  last_purchase_date?: string;
  last_purchase_amount?: number;
  
  // التحكم
  is_blacklisted: boolean; // منع البيع الآجل إذا كان blacklist
  is_active: boolean;
  
  // الملاحظات
  notes?: string;
  
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 8️⃣ CART & INVOICE ITEMS
// ============================================================================

export interface CartItem {
  product: Product;
  quantity: number;
  unit: Unit;
  
  // السعر
  unit_price: number; // سعر الوحدة
  item_subtotal: number; // quantity * unit_price
  
  // الخصم على مستوى الصنف
  item_discount_percent: number; // 0-100
  item_discount_amount: number; // حساب: item_subtotal * (item_discount_percent / 100)
  
  // الضريبة على مستوى الصنف
  item_tax_enabled: boolean;
  item_tax_rate: number;
  item_tax_amount: number;
  
  // الإجمالي للصنف
  item_total: number; // item_subtotal - item_discount_amount + item_tax_amount
  
  // نقاط الولاء
  item_loyalty_points: number; // النقاط المكتسبة من هذا الصنف
  
  // معلومات إضافية (readonly)
  product_cost?: number; // التكلفة
  item_profit?: number; // الربح = (item_total / quantity) - product_cost
}

export interface Cart {
  items: CartItem[];
  
  // المجاميع
  subtotal: number; // مجموع جميع item_subtotal
  items_discount_total: number; // مجموع جميع item_discount_amount
  
  // الخصم على الفاتورة الكلية
  invoice_discount_percent: number; // خصم إضافي على الفاتورة
  invoice_discount_amount: number; // حساب: (subtotal - items_discount_total) * (invoice_discount_percent / 100)
  
  // الضريبة
  tax_enabled: boolean;
  tax_rate: number;
  tax_amount: number; // حساب على (subtotal - items_discount_total - invoice_discount_amount)
  
  // نقاط الولاء
  total_loyalty_points: number; // مجموع جميع item_loyalty_points
  points_to_redeem: number; // النقاط المراد استردادها
  points_discount: number; // قيمة النقاط بالجنيه
  
  // الإجمالي النهائي
  total: number; // subtotal - items_discount_total - invoice_discount_amount - points_discount + tax_amount
}

export interface InvoiceItem {
  id: string;
  
  // المنتج
  product_id: string;
  product_name: string;
  product_cost: number;
  
  // الكمية والسعر
  quantity: number;
  unit: Unit;
  unit_price: number;
  
  // الخصم على مستوى الصنف
  item_discount_percent: number;
  item_discount_amount: number;
  
  // الضريبة
  item_tax_enabled: boolean;
  item_tax_rate: number;
  item_tax_amount: number;
  
  // الإجمالي
  item_total: number;
  
  // الربح
  profit_amount: number;
}

// ============================================================================
// 9️⃣ INVOICES — الفواتير
// ============================================================================

export interface Invoice {
  id: string;
  invoice_number: string; // F-001, F-002, etc
  
  // التاريخ والوقت
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  
  // المستخدم
  user_id: string;
  user_name: string;
  
  // العميل (اختياري: بعض الفواتير نقدي بدون عميل)
  customer_id?: string;
  customer_name?: string;
  
  // العناصر
  items: InvoiceItem[];
  
  // المجاميع
  subtotal: number;
  items_discount_total: number;
  invoice_discount_percent: number;
  invoice_discount_amount: number;
  
  // الضريبة
  tax_enabled: boolean;
  tax_rate: number;
  tax_amount: number;
  
  // نقاط الولاء
  loyalty_points_earned: number;
  loyalty_points_redeemed: number;
  loyalty_discount_amount: number;
  
  // الإجمالي
  total: number;
  
  // الدفع
  payment_method: PaymentMethod;
  paid_amount: number;
  change_amount: number;
  credit_amount?: number; // إذا كان "credit"
  
  // الربح الإجمالي
  total_profit: number;
  
  // الحالة
  is_return: boolean; // هل هذه فاتورة مرتجع
  original_invoice_id?: string; // رقم الفاتورة الأصلية
  status: InvoiceStatus;
  
  // الملاحظات
  notes?: string;
  
  // جلسة الكاشير
  cash_session_id?: string;
  
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 🔟 RETURNS — المرتجعات
// ============================================================================

export interface ReturnItem {
  id: string;
  
  // المنتج الأصلي
  product_id: string;
  product_name: string;
  
  // الكمية المسترجعة
  quantity_returned: number;
  unit: Unit;
  unit_price: number;
  
  // السبب
  reason: 'damaged' | 'defective' | 'expired' | 'wrong_item' | 'customer_request' | 'other';
  detailed_reason?: string;
  
  // الإرجاع النقدي
  refund_amount: number;
}

export interface Return {
  id: string;
  return_number: string; // R-001, R-002, etc
  
  // التاريخ والوقت
  date: string;
  time: string;
  
  // المستخدم
  user_id: string;
  user_name: string;
  
  // الفاتورة الأصلية
  original_invoice_id: string;
  original_invoice_number: string;
  
  // العميل
  customer_id?: string;
  customer_name?: string;
  
  // العناصر المسترجعة
  items: ReturnItem[];
  
  // الإجمالي
  total_refund_amount: number;
  
  // طريقة الإرجاع النقدي
  refund_method: 'cash' | 'credit_balance' | 'original_payment_method';
  
  // الملاحظات
  notes?: string;
  
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 1️⃣1️⃣ PURCHASES — فواتير المشتريات
// ============================================================================

export interface PurchaseItem {
  id: string;
  
  // المنتج
  product_id: string;
  product_name: string;
  
  // الكمية والسعر
  quantity: number;
  unit: Unit;
  unit_cost: number; // سعر الوحدة من المورد
  
  // المجموع
  item_total: number; // quantity * unit_cost
}

export interface Purchase {
  id: string;
  purchase_number: string; // P-001, P-002, etc
  
  // التاريخ والوقت
  date: string;
  time: string;
  
  // المستخدم
  user_id: string;
  user_name: string;
  
  // المورد
  supplier_id: string;
  supplier_name: string;
  
  // العناصر
  items: PurchaseItem[];
  
  // المجموع
  total: number;
  
  // الدفع
  payment_method: PaymentMethod;
  paid_amount: number;
  remaining_amount: number; // ما لم يتم دفعه بعد
  payment_status: PaymentStatus;
  
  // الملاحظات
  notes?: string;
  
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 1️⃣2️⃣ STOCK MOVEMENTS — حركات المخزون
// ============================================================================

export interface StockMovement {
  id: string;
  
  // المنتج
  product_id: string;
  product_name: string;
  
  // نوع الحركة
  movement_type: StockMovementType;
  
  // الكمية
  quantity: number;
  unit: Unit;
  
  // المرجع
  ref_type?: 'invoice' | 'purchase' | 'adjustment' | 'return';
  ref_id?: string; // Invoice ID or Purchase ID
  
  // المستخدم
  user_id: string;
  user_name: string;
  
  // الملاحظات
  notes?: string;
  
  created_at: string;
  timestamp: string; // HH:MM:SS
}

// ============================================================================
// 1️⃣3️⃣ INVENTORY ADJUSTMENTS — الجرد اليدوي
// ============================================================================

export interface AdjustmentItem {
  id: string;
  
  // المنتج
  product_id: string;
  product_name: string;
  
  // الكمية
  actual_quantity: number; // الكمية الفعلية المعدودة
  system_quantity: number; // الكمية في النظام
  difference: number; // actual_quantity - system_quantity
  unit: Unit;
  
  // السبب
  reason: 'inventory_count' | 'damage' | 'expiry' | 'theft' | 'data_error' | 'other';
  detailed_reason?: string;
}

export interface InventoryAdjustment {
  id: string;
  adjustment_number: string; // ADJ-001, ADJ-002, etc
  
  // التاريخ والوقت
  date: string;
  time: string;
  
  // المستخدم
  user_id: string;
  user_name: string;
  
  // العناصر
  items: AdjustmentItem[];
  
  // ملخص الفروقات
  total_increase: number; // مجموع الزيادات
  total_decrease: number; // مجموع النقصان
  
  // الملاحظات
  notes?: string;
  
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 1️⃣4️⃣ CASH SESSION — جلسة الكاشير اليومية
// ============================================================================

export interface CashSession {
  id: string;
  session_number: string; // SESSION-001, etc
  
  // التاريخ
  date: string; // يوم واحد لكل جلسة
  
  // المستخدم
  user_id: string;
  user_name: string;
  
  // الفتح
  opened_at: string; // HH:MM:SS
  opening_balance: number; // المبلغ الابتدائي في الصندوق
  
  // الإغلاق
  closed_at?: string; // HH:MM:SS
  closing_balance?: number; // المبلغ الختامي
  
  // الحسابات التلقائية
  total_sales_cash: number; // إجمالي المبيعات النقدية
  total_sales_credit: number; // إجمالي المبيعات الآجلة
  total_returns: number; // المبلغ المسترجع
  total_expenses: number; // إجمالي المصاريف
  total_collections: number; // إجمالي التحصيل من العملاء
  total_supplier_payments: number; // إجمالي المدفوعات للموردين
  
  // الفرق
  expected_balance: number; // opening_balance + total_sales_cash + total_collections - total_expenses - total_supplier_payments - total_returns
  actual_balance?: number; // المدخل عند الإغلاق
  difference?: number; // actual_balance - expected_balance (0=موازي، >0=زيادة، <0=عجز)
  
  // الحالة
  status: CashSessionStatus; // open / closed / pending
  
  // الملاحظات
  notes?: string;
  
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 1️⃣5️⃣ PAYMENTS — المدفوعات والتحصيل
// ============================================================================

export interface Payment {
  id: string;
  payment_number: string; // PAY-001, PAY-002, etc
  
  // التاريخ والوقت
  date: string;
  time: string;
  
  // المستخدم
  user_id: string;
  user_name: string;
  
  // الطرف المستفيد
  party_type: 'customer' | 'supplier'; // عميل أم مورد
  party_id: string;
  party_name: string;
  
  // المبلغ
  amount: number;
  
  // طريقة الدفع
  payment_method: PaymentMethod;
  
  // المرجع
  ref_type?: 'invoice' | 'purchase'; // من أي فاتورة
  ref_id?: string;
  
  // الملاحظات
  notes?: string;
  
  // جلسة الكاشير
  cash_session_id?: string;
  
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 1️⃣6️⃣ EXPENSES — المصاريف التشغيلية
// ============================================================================

export interface Expense {
  id: string;
  expense_number: string; // EXP-001, EXP-002, etc
  
  // التاريخ والوقت
  date: string;
  time: string;
  
  // المستخدم
  user_id: string;
  user_name: string;
  
  // التصنيف
  category: ExpenseCategory;
  
  // البيانات
  amount: number;
  description: string;
  
  // المرفقات
  receipt_image_url?: string;
  
  // الملاحظات
  notes?: string;
  
  // جلسة الكاشير
  cash_session_id?: string;
  
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 1️⃣7️⃣ LOYALTY TRANSACTIONS — حركات نقاط الولاء
// ============================================================================

export interface LoyaltyTransaction {
  id: string;
  
  // العميل
  customer_id: string;
  customer_name: string;
  
  // العملية
  type: 'earn' | 'redeem'; // كسب أم استرجاع
  
  // النقاط
  points_amount: number;
  points_value_in_egp?: number; // قيمة النقاط بالجنيه إذا تم استرجاعها
  
  // المرجع
  ref_type?: 'invoice' | 'refund';
  ref_id?: string;
  
  // الملاحظات
  notes?: string;
  
  created_at: string;
}

// ============================================================================
// 1️⃣8️⃣ NOTIFICATIONS — التنبيهات الداخلية
// ============================================================================

export type NotificationType = 'low_stock' | 'expiry_soon' | 'customer_overdue' | 'system_alert';

export interface Notification {
  id: string;
  
  // النوع
  type: NotificationType;
  
  // البيانات
  title: string;
  message: string;
  
  // المرجع (اختياري)
  ref_type?: 'product' | 'customer' | 'invoice';
  ref_id?: string;
  
  // الحالة
  is_read: boolean;
  
  // الأولوية
  priority: 'low' | 'medium' | 'high';
  
  created_at: string;
}

// ============================================================================
// 1️⃣9️⃣ AUDIT LOG — سجل العمليات
// ============================================================================

export interface AuditLogEntry {
  id: string;
  
  // المستخدم
  user_id: string;
  user_name: string;
  
  // العملية
  action: string; // مثل: "create_invoice", "update_product", "delete_customer"
  entity_type: string; // "invoice", "product", "customer", etc
  entity_id: string;
  
  // التفاصيل
  old_value?: any;
  new_value?: any;
  
  // الملاحظات
  details?: string;
  
  created_at: string;
}

// ============================================================================
// 2️⃣0️⃣ DAILY SUMMARY & REPORTS
// ============================================================================

export interface DailySummary {
  date: string; // YYYY-MM-DD
  
  // المبيعات
  total_sales_cash: number;
  total_sales_credit: number;
  total_sales: number;
  
  // المرتجعات
  total_returns_amount: number;
  
  // المشتريات
  total_purchases: number;
  
  // المصاريف
  total_expenses: number;
  
  // التحصيل والدفع
  total_collections: number;
  total_supplier_payments: number;
  
  // الأرباح
  total_cost_of_goods_sold: number;
  gross_profit: number; // الربح الإجمالي = total_sales - total_cost_of_goods_sold
  net_profit: number; // الربح الصافي = gross_profit - total_expenses
}

export interface ReportFilters {
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  payment_method?: PaymentMethod;
  category_id?: string;
  user_id?: string;
  customer_id?: string;
}

export interface InvoiceReport {
  invoice_id: string;
  invoice_number: string;
  date: string;
  customer_name?: string;
  total: number;
  payment_method: PaymentMethod;
  user_name: string;
}

export interface ProductReportItem {
  product_id: string;
  product_name: string;
  total_quantity_sold: number;
  total_revenue: number;
  total_cost: number;
  profit: number;
  rank: number; // ترتيب المنتج
}

export interface CustomerReportItem {
  customer_id: string;
  customer_name: string;
  total_purchases_amount: number;
  total_purchases_count: number;
  credit_used: number;
  credit_available: number;
  trust_level: TrustLevel;
  last_purchase_date?: string;
}

export interface InventoryReportItem {
  product_id: string;
  product_name: string;
  current_stock: number;
  stock_alert: number;
  expiry_date?: string;
  value: number; // stock * cost
  status: 'normal' | 'low' | 'critical' | 'expired';
}

// ============================================================================
// 2️⃣1️⃣ BACKUP & SYNC (للمستقبل)
// ============================================================================

export interface BackupLog {
  id: string;
  backup_date: string;
  backup_size: number; // بالـ MB
  backup_location: string; // اسم الملف
  is_successful: boolean;
  completed_at?: string;
  notes?: string;
}

// ============================================================================
// 2️⃣2️⃣ SESSION STATE — حالة الجلسة الحالية
// ============================================================================

export interface CurrentSession {
  user_id: string;
  user_name: string;
  user_role: UserRole;
  
  // الصلاحيات
  can_apply_discount: boolean;
  can_process_returns: boolean;
  can_manage_inventory: boolean;
  can_manage_customers: boolean;
  can_manage_users: boolean;
  can_view_reports: boolean;
  can_manage_settings: boolean;
  can_open_close_register: boolean;
  can_view_costs: boolean;
  
  // جلسة الكاشير الحالية
  current_cash_session_id?: string;
  
  logged_in_at: string;
}


