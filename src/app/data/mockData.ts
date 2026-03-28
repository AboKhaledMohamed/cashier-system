// Mock Data for Smart POS System - Small Shop Edition (Offline-First, Single Store)
// ============================================================================
// نظام الكاشير للمحلات الصغيرة - يعمل 100% أوفلاين مع SQLite محلية

// أنواع المنتجات
export type ProductType = 'piece' | 'weight' | 'box' | 'carton' | 'meter' | 'liter' | 'bundle';

export const productTypeLabels: Record<ProductType, string> = {
  piece: 'قطعة',
  weight: 'وزن',
  box: 'علبة',
  carton: 'كرتونة',
  meter: 'متر',
  liter: 'لتر',
  bundle: 'مجموعة',
};

// وحدات القياس
export type Unit = 'piece' | 'kg' | 'gram' | 'box' | 'carton' | 'meter' | 'cm' | 'liter' | 'ml' | 'bundle';

export const unitLabels: Record<Unit, string> = {
  piece: 'قطعة',
  kg: 'كيلوجرام',
  gram: 'جرام',
  box: 'علبة',
  carton: 'كرتونة',
  meter: 'متر',
  cm: 'سنتيمتر',
  liter: 'لتر',
  ml: 'مللي',
  bundle: 'مجموعة',
};

// طرق الدفع
export type PaymentMethod = 'cash' | 'credit';

export const paymentMethodLabels: Record<PaymentMethod, { label: string; color: string }> = {
  cash: { label: 'نقدي', color: '#2ECC71' },
  credit: { label: 'آجل', color: '#F1C40F' },
};

// مستويات الثقة للعملاء
export type TrustLevel = 'excellent' | 'good' | 'average' | 'poor' | 'bad';

export const trustLevelLabels: Record<TrustLevel, { label: string; color: string; minScore: number }> = {
  excellent: { label: 'ممتاز', color: '#2ECC71', minScore: 90 },
  good: { label: 'جيد', color: '#3498DB', minScore: 70 },
  average: { label: 'متوسط', color: '#F1C40F', minScore: 50 },
  poor: { label: 'ضعيف', color: '#E67E22', minScore: 30 },
  bad: { label: 'سيء', color: '#E74C3C', minScore: 0 },
};

// الأدوار
export type UserRole = 'admin' | 'manager' | 'cashier';

export const roleLabels: Record<UserRole, string> = {
  admin: 'مدير النظام',
  manager: 'مدير',
  cashier: 'كاشير',
};

// الصلاحيات
export const availablePermissions = [
  { id: 'view_sales', label: 'مشاهدة المبيعات' },
  { id: 'create_sale', label: 'إنشاء فاتورة بيع' },
  { id: 'cancel_invoice', label: 'إلغاء فاتورة' },
  { id: 'apply_discount', label: 'تطبيق خصم' },
  { id: 'view_costs', label: 'مشاهدة التكاليف' },
  { id: 'manage_inventory', label: 'إدارة المخزون' },
  { id: 'manage_products', label: 'إدارة المنتجات' },
  { id: 'manage_customers', label: 'إدارة العملاء' },
  { id: 'manage_suppliers', label: 'إدارة الموردين' },
  { id: 'manage_purchases', label: 'إدارة المشتريات' },
  { id: 'view_reports', label: 'مشاهدة التقارير' },
  { id: 'manage_users', label: 'إدارة المستخدمين' },
  { id: 'manage_settings', label: 'إدارة الإعدادات' },
  { id: 'open_close_register', label: 'فتح/إغلاق الصندوق' },
  { id: 'view_audit_log', label: 'مشاهدة سجل العمليات' },
] as const;

// ============================================================================
// الواجهات الرئيسية
// ============================================================================

// Branch Interface
export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  manager: string;
  status: 'نشط' | 'متوقف';
  isActive?: boolean;
  createdAt: string;
}

// Warehouse Interface
export interface Warehouse {
  id: string;
  name: string;
  branchId: string;
  branchName: string;
  location: string;
  status: 'نشط' | 'متوقف';
  isActive?: boolean;
}

// موقع التخزين داخل المخزن (رف، رف رقم 3، الخ...)
export interface StorageLocation {
  id: string;
  name: string; // مثل: "رف 3", "المستودع الخلفي", "الثلاجة"
  warehouseId: string;
}

// مواقع التخزين الافتراضية
export const defaultStorageLocations: StorageLocation[] = [
  { id: 'loc-1', name: 'رف 1 - الأمامي', warehouseId: 'wh-1' },
  { id: 'loc-2', name: 'رف 2 - الخلفي', warehouseId: 'wh-1' },
  { id: 'loc-3', name: 'رف 3 - الجانبي', warehouseId: 'wh-1' },
  { id: 'loc-4', name: 'المستودع الخلفي', warehouseId: 'wh-1' },
  { id: 'loc-5', name: 'الثلاجة', warehouseId: 'wh-1' },
];

// متغيرات المنتج (لون، مقاس، موديل)
export interface ProductVariant {
  id: string;
  name: string; // مثل: "أحمر", "كبير", "موديل 2024"
  type: 'color' | 'size' | 'model' | 'other';
  stock: number;
  barcode?: string;
}

// تحويل الوحدات
export interface UnitConversion {
  fromUnit: Unit;
  toUnit: Unit;
  ratio: number; // مثال: 12 قطعة = 1 علبة، ratio = 12
}

// المنتج - محدث للمحلات الصغيرة
export interface Product {
  id: string;
  name: string;
  barcode: string;
  type: ProductType;
  category: string;
  subcategory?: string;
  // الأسعار
  price: number; // سعر البيع للوحدة الأساسية
  cost: number; // سعر التكلفة
  // الوحدات
  baseUnit: Unit; // الوحدة الأساسية
  secondaryUnit?: Unit; // الوحدة الثانوية (اختياري)
  unitConversion?: UnitConversion; // معامل التحويل
  // المخزون
  stock: number; // مخزون الوحدة الأساسية
  stockAlert: number; // حد التنبيه
  allowDecimal: boolean; // هل يسمح بالكميات العشرية (مثال: 1.5 كيلو)
  // موقع التخزين
  storageLocationId?: string;
  storageLocationName?: string;
  // التواريخ
  productionDate?: string;
  expiryDate?: string;
  expiryAlertDays?: number; // تنبيه قبل انتهاء الصلاحية بـ X يوم
  // المتغيرات (اختياري)
  variants?: ProductVariant[];
  hasVariants: boolean;
  // إضافي
  image?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  // للتوافق مع الكود القديم
  unit?: string;
  warehouseStock?: Record<string, number>;
  totalStock?: number;
}

// Stock Movement Interface
export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'بيع' | 'شراء' | 'تحويل_من' | 'تحويل_إلى' | 'مرتجع_بيع' | 'مرتجع_شراء' | 'تعديل';
  quantity: number;
  fromWarehouseId?: string;
  fromWarehouseName?: string;
  toWarehouseId?: string;
  toWarehouseName?: string;
  referenceId?: string; // Invoice ID or Purchase ID
  referenceType?: 'sale' | 'purchase' | 'transfer' | 'return';
  date: string;
  time: string;
  userId: string;
  userName: string;
  notes?: string;
}

// العميل - محدث مع بيانات تفصيلية
export interface Customer {
  id: string;
  name: string;
  phone: string;
  phone2?: string;
  // العنوان التفصيلي
  address?: {
    area?: string; // الحي
    street?: string; // الشارع
    building?: string; // المبنى
    floor?: string; // الدور
    apartment?: string; // الشقة
    landmark?: string; // علامة مميزة
  };
  // الديون
  debt: number;
  creditLimit: number;
  // نظام الثقة
  trustScore: number; // من 0 إلى 100
  trustLevel: TrustLevel;
  // نظام الولاء
  loyaltyPoints: number;
  totalPurchases: number;
  // تذكيرات
  debtReminders?: {
    id: string;
    date: string;
    amount: number;
    isPaid: boolean;
    notes?: string;
  }[];
  // آخر عملية
  lastTransaction: string;
  lastTransactionAmount?: number;
  // إضافي
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

// عنصر الفاتورة - محدث
export interface InvoiceItem {
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  // الكمية والسعر
  quantity: number;
  unit?: Unit;
  price: number; // السعر للوحدة
  total: number;
  // خصم على مستوى الصنف
  discount?: number; // نسبة الخصم
  discountAmount?: number; // مبلغ الخصم
  // التكلفة (لحساب الربح)
  cost?: number;
  profit?: number;
  // للتوافق مع الكود القديم
  warehouseId?: string;
  warehouseName?: string;
}

// الفاتورة - محدثة
export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  time: string;
  // العميل
  customerId?: string;
  customerName?: string;
  customer?: string; // للتوافق مع الكود القديم
  // العناصر
  items: InvoiceItem[];
  // المجاميع
  subtotal: number; // قبل الخصم والضريبة
  itemDiscountTotal?: number; // خصومات الأصناف
  discount: number; // خصم على مستوى الفاتورة (نسبة)
  discountAmount: number; // مبلغ خصم الفاتورة
  // الضريبة
  taxEnabled?: boolean;
  taxRate?: number;
  taxAmount?: number;
  // الإجمالي
  total: number;
  // الدفع
  paymentMethod: PaymentMethod | string; // string للتوافق مع الكود القديم
  paid: number; // المدفوع
  change: number; // الباقي
  creditAmount?: number; // مبلغ الآجل
  // حالة الفاتورة
  status: 'completed' | 'pending' | 'cancelled' | 'returned' | 'مكتمل' | 'معلق' | 'ملغي'; // للتوافق
  // المرتجعات
  isReturn?: boolean;
  originalInvoiceId?: string; // رقم الفاتورة الأصلية للمرتجع
  // الفرع والمخزن - للتوافق مع الكود القديم
  branchId?: string;
  branchName?: string;
  warehouseId?: string;
  warehouseName?: string;
  // المستخدم
  userId: string;
  userName: string;
  // ملاحظات
  notes?: string;
  // Audit
  createdAt?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancelReason?: string;
}

// Purchase Item Interface
export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number; // Purchase price
  total: number;
}

// Purchase Interface - Updated with full details
export interface Purchase {
  id: string;
  invoiceNumber: string;
  supplier: string;
  supplierId: string;
  date: string;
  time: string;
  items: PurchaseItem[];
  subtotal: number;
  discount: number;
  total: number;
  paid: number;
  remaining: number;
  status: 'مدفوعة' | 'جزئي' | 'معلقة' | 'ملغية';
  warehouseId: string;
  warehouseName: string;
  branchId: string;
  branchName: string;
  userId: string;
  userName: string;
  notes?: string;
}

// Transfer Interface
export interface Transfer {
  id: string;
  transferNumber: string;
  date: string;
  time: string;
  fromWarehouseId: string;
  fromWarehouseName: string;
  toWarehouseId: string;
  toWarehouseName: string;
  fromBranchId: string;
  fromBranchName: string;
  toBranchId: string;
  toBranchName: string;
  items: TransferItem[];
  status: 'معلقة' | 'مكتملة' | 'ملغية';
  userId: string;
  userName: string;
  notes?: string;
}

export interface TransferItem {
  productId: string;
  productName: string;
  quantity: number;
}

// المستخدم - محدث مع PIN
export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  pin?: string;
  password?: string;
  permissions: Permission[];
  isActive: boolean;
  status?: 'نشط' | 'متوقف';
  lastLogin?: string;
  createdAt?: string;
  branchId?: string;
  warehouseId?: string;
}

// جلسة الكاشير (فتح/إغلاق الصندوق)
export interface CashierSession {
  id: string;
  userId: string;
  userName: string;
  // فتح الصندوق
  openedAt: string;
  openingCash: number; // المبلغ الافتتاحي
  // إغلاق الصندوق
  closedAt?: string;
  closingCash?: number; // المبلغ الفعلي عند الإغلاق
  expectedCash?: number; // المبلغ المتوقع (افتتاحي + مبيعات نقدية)
  difference?: number; // الفرق
  // ملخص الجلسة
  totalSales: number;
  totalCashSales: number;
  totalCreditSales: number;
  totalCardSales: number;
  totalVodafoneCash: number;
  totalInstapay: number;
  invoiceCount: number;
  // الحالة
  status: 'open' | 'closed';
  // ملاحظات
  notes?: string;
}

// سجل العمليات (Audit Log)
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete' | 'cancel' | 'login' | 'logout' | 'open_register' | 'close_register';
  entityType: 'product' | 'customer' | 'supplier' | 'invoice' | 'purchase' | 'user' | 'setting';
  entityId: string;
  entityName?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  details?: string;
  timestamp: string;
}

// الإعدادات
export interface AppSettings {
  store: {
    id: string;
    name: string;
    address: string;
    phone: string;
    taxNumber?: string;
    logo?: string;
    receiptHeader?: string;
    receiptFooter?: string;
  };
  tax: {
    enabled: boolean;
    rate: number;
    includeInPrice: boolean;
  };
  receipt: {
    header?: string;
    footer?: string;
    showLogo: boolean;
    printerType: 'thermal_80mm' | 'a4';
  };
  backup: {
    autoBackup: boolean;
    backupPath: string;
    schedule: 'daily' | 'weekly' | 'manual';
  };
  // إشارات النظام
  system: {
    isOffline: boolean; // true دائماً للنسخة الصغيرة
    databaseType: 'sqlite';
    version: string;
  };
}

// Current Session/Settings
export interface CurrentSession {
  branchId: string;
  branchName: string;
  warehouseId: string;
  warehouseName: string;
  userId: string;
  userName: string;
  userRole: string;
}

// Branches
export const mockBranches: Branch[] = [
  {
    id: 'branch-1',
    name: 'الفرع الرئيسي - القاهرة',
    address: 'شارع العاشر من رمضان، وسط البلد، القاهرة',
    phone: '0221234567',
    manager: 'أحمد محمد علي',
    status: 'نشط',
    isActive: true,
    createdAt: '2025-01-01',
  },
  {
    id: 'branch-2',
    name: 'فرع المنصورة',
    address: 'شارع الجمهورية، المنصورة، الدقهلية',
    phone: '0501234567',
    manager: 'محمود حسن السيد',
    status: 'نشط',
    isActive: true,
    createdAt: '2025-03-15',
  },
];

// Warehouses
export const mockWarehouses: Warehouse[] = [
  {
    id: 'wh-1',
    name: 'المخزن الرئيسي - القاهرة',
    branchId: 'branch-1',
    branchName: 'الفرع الرئيسي - القاهرة',
    location: 'بدروم الفرع الرئيسي',
    status: 'نشط',
    isActive: true,
  },
  {
    id: 'wh-2',
    name: 'مخزن المبيعات - القاهرة',
    branchId: 'branch-1',
    branchName: 'الفرع الرئيسي - القاهرة',
    location: 'خلف نقاط البيع',
    status: 'نشط',
    isActive: true,
  },
  {
    id: 'wh-3',
    name: 'المخزن الرئيسي - المنصورة',
    branchId: 'branch-2',
    branchName: 'فرع المنصورة',
    location: 'بدروم الفرع',
    status: 'نشط',
    isActive: true,
  },
];

// Products - Updated for Small Shop Edition
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'أرز مصري - كيس 5 كجم',
    barcode: '6221234567890',
    type: 'weight',
    category: 'حبوب',
    price: 85,
    cost: 65,
    baseUnit: 'kg',
    stock: 180,
    stockAlert: 20,
    allowDecimal: true,
    storageLocationId: 'loc-1',
    storageLocationName: 'رف 1 - الأمامي',
    hasVariants: false,
    isActive: true,
    createdAt: '2026-01-01',
    unit: 'كيس',
  },
  {
    id: '2',
    name: 'زيت دوار الشمس 1 لتر',
    barcode: '6221234567891',
    type: 'liter',
    category: 'زيوت',
    price: 55,
    cost: 42,
    baseUnit: 'liter',
    stock: 100,
    stockAlert: 15,
    allowDecimal: true,
    storageLocationId: 'loc-1',
    storageLocationName: 'رف 1 - الأمامي',
    expiryDate: '2026-04-15',
    expiryAlertDays: 30,
    hasVariants: false,
    isActive: true,
    createdAt: '2026-01-01',
    unit: 'زجاجة',
  },
  {
    id: '3',
    name: 'سكر أبيض - كيس 1 كجم',
    barcode: '6221234567892',
    type: 'weight',
    category: 'حبوب',
    price: 28,
    cost: 22,
    baseUnit: 'kg',
    stock: 15,
    stockAlert: 25,
    allowDecimal: true,
    storageLocationId: 'loc-2',
    storageLocationName: 'رف 2 - الخلفي',
    hasVariants: false,
    isActive: true,
    createdAt: '2026-01-01',
    unit: 'كيس',
  },
  {
    id: '4',
    name: 'معكرونة إسباجتي 500 جم',
    barcode: '6221234567893',
    type: 'piece',
    category: 'معكرونات',
    price: 12,
    cost: 9,
    baseUnit: 'piece',
    secondaryUnit: 'carton',
    unitConversion: { fromUnit: 'piece', toUnit: 'carton', ratio: 20 },
    stock: 280,
    stockAlert: 30,
    allowDecimal: false,
    storageLocationId: 'loc-1',
    storageLocationName: 'رف 1 - الأمامي',
    hasVariants: false,
    isActive: true,
    createdAt: '2026-01-01',
    unit: 'علبة',
  },
  {
    id: '5',
    name: 'صلصة طماطم 400 جم',
    barcode: '6221234567894',
    type: 'piece',
    category: 'معلبات',
    price: 18,
    cost: 14,
    baseUnit: 'piece',
    stock: 0,
    stockAlert: 20,
    allowDecimal: false,
    storageLocationId: 'loc-3',
    storageLocationName: 'رف 3 - الجانبي',
    hasVariants: false,
    isActive: true,
    createdAt: '2026-01-01',
    unit: 'علبة',
  },
  {
    id: '6',
    name: 'شاي أسود - علبة 100 كيس',
    barcode: '6221234567895',
    type: 'box',
    category: 'مشروبات',
    price: 65,
    cost: 50,
    baseUnit: 'box',
    stock: 65,
    stockAlert: 10,
    allowDecimal: false,
    storageLocationId: 'loc-1',
    storageLocationName: 'رف 1 - الأمامي',
    hasVariants: false,
    isActive: true,
    createdAt: '2026-01-01',
    unit: 'علبة',
  },
  {
    id: '7',
    name: 'حليب طويل الأجل 1 لتر',
    barcode: '6221234567896',
    type: 'piece',
    category: 'ألبان',
    price: 22,
    cost: 17,
    baseUnit: 'piece',
    stock: 20,
    stockAlert: 20,
    allowDecimal: false,
    storageLocationId: 'loc-5',
    storageLocationName: 'الثلاجة',
    expiryDate: '2026-04-15',
    expiryAlertDays: 7,
    hasVariants: false,
    isActive: true,
    createdAt: '2026-01-01',
    unit: 'علبة',
  },
  {
    id: '8',
    name: 'بسكويت شاي 100 جم',
    barcode: '6221234567897',
    type: 'piece',
    category: 'حلويات',
    price: 8,
    cost: 6,
    baseUnit: 'piece',
    stock: 230,
    stockAlert: 25,
    allowDecimal: false,
    storageLocationId: 'loc-1',
    storageLocationName: 'رف 1 - الأمامي',
    hasVariants: false,
    isActive: true,
    createdAt: '2026-01-01',
    unit: 'علبة',
  },
];

// Customers - Updated with detailed information
export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'محمد أحمد علي',
    phone: '01012345678',
    address: { area: 'وسط البلد', street: 'شارع الجمهورية', building: '15', floor: '3', apartment: '12' },
    debt: 0,
    creditLimit: 5000,
    trustScore: 95,
    trustLevel: 'excellent',
    loyaltyPoints: 1250,
    totalPurchases: 12500,
    lastTransaction: '2026-03-20',
    lastTransactionAmount: 350,
    isActive: true,
    createdAt: '2026-01-15',
  },
  {
    id: '2',
    name: 'فاطمة حسن محمود',
    phone: '01123456789',
    address: { area: 'المنصورة الجديدة', street: 'شارع البحر', building: '42', floor: '2' },
    debt: 850,
    creditLimit: 3000,
    trustScore: 75,
    trustLevel: 'good',
    loyaltyPoints: 680,
    totalPurchases: 6800,
    lastTransaction: '2026-03-18',
    lastTransactionAmount: 850,
    isActive: true,
    createdAt: '2026-01-20',
  },
  {
    id: '3',
    name: 'أحمد محمد السيد',
    phone: '01234567890',
    address: { area: 'المحطة', street: 'شارع الجلاء', building: '8', floor: '1' },
    debt: 1200,
    creditLimit: 2000,
    trustScore: 45,
    trustLevel: 'average',
    loyaltyPoints: 320,
    totalPurchases: 3200,
    debtReminders: [{ id: 'dr1', date: '2026-03-25', amount: 1200, isPaid: false, notes: 'تذكير أول' }],
    lastTransaction: '2026-03-15',
    lastTransactionAmount: 600,
    isActive: true,
    createdAt: '2026-02-01',
  },
  {
    id: '4',
    name: 'نورهان عبد الرحمن',
    phone: '01098765432',
    debt: 0,
    creditLimit: 2000,
    trustScore: 80,
    trustLevel: 'good',
    loyaltyPoints: 450,
    totalPurchases: 4500,
    lastTransaction: '2026-03-21',
    lastTransactionAmount: 200,
    isActive: true,
    createdAt: '2026-02-10',
  },
  {
    id: '5',
    name: 'كريم السيد إبراهيم',
    phone: '01156789012',
    address: { area: 'الجمعية', street: 'شارع النصر', building: '25', floor: '4' },
    debt: 2500,
    creditLimit: 4000,
    trustScore: 35,
    trustLevel: 'poor',
    loyaltyPoints: 180,
    totalPurchases: 1800,
    debtReminders: [
      { id: 'dr2', date: '2026-03-20', amount: 1500, isPaid: true, notes: 'دفع جزئي' },
      { id: 'dr3', date: '2026-03-28', amount: 1000, isPaid: false, notes: 'تذكير ثاني' },
    ],
    lastTransaction: '2026-03-10',
    lastTransactionAmount: 1000,
    isActive: true,
    createdAt: '2026-02-15',
  },
];

// Invoices - Updated with branch and warehouse
export const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2026-001',
    date: '2026-03-21',
    time: '10:30:00',
    customer: 'محمد أحمد علي',
    customerId: '1',
    items: [
      { productId: '1', productName: 'أرز مصري - كيس 5 كجم', quantity: 2, price: 85, total: 170, warehouseId: 'wh-2', warehouseName: 'مخزن المبيعات - القاهرة' },
      { productId: '2', productName: 'زيت دوار الشمس 1 لتر', quantity: 3, price: 55, total: 165, warehouseId: 'wh-2', warehouseName: 'مخزن المبيعات - القاهرة' },
    ],
    subtotal: 335,
    discount: 0,
    discountAmount: 0,
    total: 335,
    paid: 400,
    change: 65,
    paymentMethod: 'نقدي',
    status: 'مكتمل',
    branchId: 'branch-1',
    branchName: 'الفرع الرئيسي - القاهرة',
    warehouseId: 'wh-2',
    warehouseName: 'مخزن المبيعات - القاهرة',
    userId: '3',
    userName: 'فاطمة أحمد',
  },
  {
    id: '2',
    invoiceNumber: 'INV-2026-002',
    date: '2026-03-21',
    time: '11:15:00',
    customer: 'فاطمة حسن محمود',
    customerId: '2',
    items: [
      { productId: '4', productName: 'معكرونة إسباجتي 500 جم', quantity: 5, price: 12, total: 60, warehouseId: 'wh-2', warehouseName: 'مخزن المبيعات - القاهرة' },
      { productId: '6', productName: 'شاي أسود - علبة 100 كيس', quantity: 1, price: 65, total: 65, warehouseId: 'wh-2', warehouseName: 'مخزن المبيعات - القاهرة' },
    ],
    subtotal: 125,
    discount: 0,
    discountAmount: 0,
    total: 125,
    paid: 0,
    change: 0,
    paymentMethod: 'آجل',
    status: 'مكتمل',
    branchId: 'branch-1',
    branchName: 'الفرع الرئيسي - القاهرة',
    warehouseId: 'wh-2',
    warehouseName: 'مخزن المبيعات - القاهرة',
    userId: '3',
    userName: 'فاطمة أحمد',
  },
  {
    id: '3',
    invoiceNumber: 'INV-2026-003',
    date: '2026-03-21',
    time: '14:20:00',
    items: [
      { productId: '3', productName: 'سكر أبيض - كيس 1 كجم', quantity: 10, price: 28, total: 280, warehouseId: 'wh-3', warehouseName: 'المخزن الرئيسي - المنصورة' },
    ],
    subtotal: 280,
    discount: 20,
    discountAmount: 20,
    total: 260,
    paid: 300,
    change: 40,
    paymentMethod: 'نقدي',
    status: 'مكتمل',
    branchId: 'branch-2',
    branchName: 'فرع المنصورة',
    warehouseId: 'wh-3',
    warehouseName: 'المخزن الرئيسي - المنصورة',
    userId: '4',
    userName: 'نورهان محمد',
  },
  {
    id: '4',
    invoiceNumber: 'INV-2026-004',
    date: '2026-03-20',
    time: '16:45:00',
    customer: 'أحمد محمد السيد',
    customerId: '3',
    items: [
      { productId: '7', productName: 'حليب طويل الأجل 1 لتر', quantity: 6, price: 22, total: 132, warehouseId: 'wh-2', warehouseName: 'مخزن المبيعات - القاهرة' },
      { productId: '8', productName: 'بسكويت شاي 100 جم', quantity: 10, price: 8, total: 80, warehouseId: 'wh-2', warehouseName: 'مخزن المبيعات - القاهرة' },
    ],
    subtotal: 212,
    discount: 0,
    discountAmount: 0,
    total: 212,
    paid: 0,
    change: 0,
    paymentMethod: 'آجل',
    status: 'مكتمل',
    branchId: 'branch-1',
    branchName: 'الفرع الرئيسي - القاهرة',
    warehouseId: 'wh-2',
    warehouseName: 'مخزن المبيعات - القاهرة',
    userId: '3',
    userName: 'فاطمة أحمد',
  },
];

// Users
export const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    fullName: 'أحمد محمد علي',
    role: 'admin',
    password: 'admin123',
    status: 'نشط',
    isActive: true,
    lastLogin: '2026-03-21 09:00',
    createdAt: '2026-01-01',
    permissions: ['all'],
  },
  {
    id: '2',
    username: 'manager1',
    fullName: 'محمود حسن السيد',
    role: 'manager',
    password: 'manager123',
    status: 'نشط',
    isActive: true,
    lastLogin: '2026-03-20 14:30',
    createdAt: '2026-01-01',
    branchId: 'branch-1',
    permissions: ['sales', 'inventory', 'reports', 'purchases'],
  },
  {
    id: '3',
    username: 'cashier1',
    fullName: 'فاطمة أحمد',
    role: 'cashier',
    pin: '1234',
    password: 'cashier123',
    status: 'نشط',
    isActive: true,
    lastLogin: '2026-03-21 08:00',
    createdAt: '2026-01-01',
    branchId: 'branch-1',
    warehouseId: 'wh-2',
    permissions: ['sales'],
  },
  {
    id: '4',
    username: 'cashier2',
    fullName: 'نورهان محمد',
    role: 'cashier',
    pin: '5678',
    password: 'cashier456',
    status: 'متوقف',
    isActive: false,
    lastLogin: '2026-03-15 10:00',
    createdAt: '2026-01-01',
    branchId: 'branch-2',
    warehouseId: 'wh-3',
    permissions: ['sales'],
  },
];

// Supplier Interface
export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  balance?: number;
  totalPurchases: number;
  lastTransaction: string;
  isActive?: boolean;
  status?: 'نشط' | 'متوقف';
}

// Suppliers
export const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'شركة الأهرام للمواد الغذائية',
    phone: '0223456789',
    email: 'info@ahram.com',
    address: 'العاشر من رمضان، القاهرة',
    totalPurchases: 125000,
    lastTransaction: '2026-03-15',
    status: 'نشط',
    isActive: true,
  },
  {
    id: '2',
    name: 'مؤسسة النيل التجارية',
    phone: '0224567890',
    email: 'contact@nile.com',
    address: 'الدقي، الجيزة',
    totalPurchases: 89500,
    lastTransaction: '2026-03-10',
    status: 'نشط',
    isActive: true,
  },
  {
    id: '3',
    name: 'شركة الدلتا للاستيراد والتصدير',
    phone: '0225678901',
    email: 'sales@delta.com',
    address: 'المنصورة، الدقهلية',
    totalPurchases: 156000,
    lastTransaction: '2026-03-20',
    status: 'نشط',
    isActive: true,
  },
];

// Purchases - Updated with full details
export const mockPurchases: Purchase[] = [
  {
    id: '1',
    invoiceNumber: 'PUR-2026-001',
    supplier: 'شركة الأهرام للمواد الغذائية',
    supplierId: '1',
    date: '2026-03-15',
    time: '10:00:00',
    items: [
      { productId: '1', productName: 'أرز مصري - كيس 5 كجم', quantity: 50, price: 65, total: 3250 },
      { productId: '2', productName: 'زيت دوار الشمس 1 لتر', quantity: 30, price: 42, total: 1260 },
      { productId: '4', productName: 'معكرونة إسباجتي 500 جم', quantity: 100, price: 9, total: 900 },
    ],
    subtotal: 5410,
    discount: 0,
    total: 5410,
    paid: 5410,
    remaining: 0,
    status: 'مدفوعة',
    warehouseId: 'wh-1',
    warehouseName: 'المخزن الرئيسي - القاهرة',
    branchId: 'branch-1',
    branchName: 'الفرع الرئيسي - القاهرة',
    userId: '2',
    userName: 'محمود حسن السيد',
    notes: 'شراء روتيني',
  },
  {
    id: '2',
    invoiceNumber: 'PUR-2026-002',
    supplier: 'شركة الدلتا للاستيراد والتصدير',
    supplierId: '3',
    date: '2026-03-20',
    time: '14:30:00',
    items: [
      { productId: '6', productName: 'شاي أسود - علبة 100 كيس', quantity: 40, price: 50, total: 2000 },
      { productId: '7', productName: 'حليب طويل الأجل 1 لتر', quantity: 50, price: 17, total: 850 },
      { productId: '8', productName: 'بسكويت شاي 100 جم', quantity: 80, price: 6, total: 480 },
    ],
    subtotal: 3330,
    discount: 100,
    total: 3230,
    paid: 3230,
    remaining: 0,
    status: 'مدفوعة',
    warehouseId: 'wh-3',
    warehouseName: 'المخزن الرئيسي - المنصورة',
    branchId: 'branch-2',
    branchName: 'فرع المنصورة',
    userId: '2',
    userName: 'محمود حسن السيد',
    notes: '',
  },
  {
    id: '3',
    invoiceNumber: 'PUR-2026-003',
    supplier: 'مؤسسة النيل التجارية',
    supplierId: '2',
    date: '2026-03-10',
    time: '09:15:00',
    items: [
      { productId: '3', productName: 'سكر أبيض - كيس 1 كجم', quantity: 100, price: 22, total: 2200 },
      { productId: '5', productName: 'صلصة طماطم 400 جم', quantity: 50, price: 14, total: 700 },
    ],
    subtotal: 2900,
    discount: 0,
    total: 2900,
    paid: 1500,
    remaining: 1400,
    status: 'جزئي',
    warehouseId: 'wh-1',
    warehouseName: 'المخزن الرئيسي - القاهرة',
    branchId: 'branch-1',
    branchName: 'الفرع الرئيسي - القاهرة',
    userId: '1',
    userName: 'أحمد محمد علي',
    notes: 'دفعة جزئية',
  },
];

// Stock Movements
export const mockStockMovements: StockMovement[] = [
  {
    id: 'mov-1',
    productId: '1',
    productName: 'أرز مصري - كيس 5 كجم',
    type: 'شراء',
    quantity: 50,
    toWarehouseId: 'wh-1',
    toWarehouseName: 'المخزن الرئيسي - القاهرة',
    referenceId: '1',
    referenceType: 'purchase',
    date: '2026-03-15',
    time: '10:00:00',
    userId: '2',
    userName: 'محمود حسن السيد',
    notes: 'شراء روتيني',
  },
  {
    id: 'mov-2',
    productId: '1',
    productName: 'أرز مصري - كيس 5 كجم',
    type: 'بيع',
    quantity: 2,
    fromWarehouseId: 'wh-2',
    fromWarehouseName: 'مخزن المبيعات - القاهرة',
    referenceId: '1',
    referenceType: 'sale',
    date: '2026-03-21',
    time: '10:30:00',
    userId: '3',
    userName: 'فاطمة أحمد',
    notes: 'فاتورة مبيعات INV-2026-001',
  },
  {
    id: 'mov-3',
    productId: '3',
    productName: 'سكر أبيض - كيس 1 كجم',
    type: 'بيع',
    quantity: 10,
    fromWarehouseId: 'wh-3',
    fromWarehouseName: 'المخزن الرئيسي - المنصورة',
    referenceId: '3',
    referenceType: 'sale',
    date: '2026-03-21',
    time: '14:20:00',
    userId: '4',
    userName: 'نورهان محمد',
    notes: 'فاتورة مبيعات INV-2026-003',
  },
  {
    id: 'mov-4',
    productId: '2',
    productName: 'زيت دوار الشمس 1 لتر',
    type: 'شراء',
    quantity: 30,
    toWarehouseId: 'wh-1',
    toWarehouseName: 'المخزن الرئيسي - القاهرة',
    referenceId: '1',
    referenceType: 'purchase',
    date: '2026-03-15',
    time: '10:00:00',
    userId: '2',
    userName: 'محمود حسن السيد',
  },
];

// Current Session (Default)
export const currentSession: CurrentSession = {
  branchId: 'branch-1',
  branchName: 'الفرع الرئيسي - القاهرة',
  warehouseId: 'wh-2',
  warehouseName: 'مخزن المبيعات - القاهرة',
  userId: '3',
  userName: 'فاطمة أحمد',
  userRole: 'Cashier',
};

// Sales Data for Charts (Last 7 days)
export const mockSalesData = [
  { day: 'السبت', sales: 4200, invoices: 12 },
  { day: 'الأحد', sales: 3800, invoices: 10 },
  { day: 'الاثنين', sales: 5100, invoices: 15 },
  { day: 'الثلاثاء', sales: 4600, invoices: 13 },
  { day: 'الأربعاء', sales: 5800, invoices: 17 },
  { day: 'الخميس', sales: 6200, invoices: 19 },
  { day: 'الجمعة', sales: 5500, invoices: 16 },
];

// Top Products
export const mockTopProducts = [
  { name: 'معكرونة إسباجتي', sales: 1250, revenue: 15000 },
  { name: 'أرز مصري', sales: 980, revenue: 83300 },
  { name: 'زيت دوار الشمس', sales: 850, revenue: 46750 },
  { name: 'شاي أسود', sales: 620, revenue: 40300 },
  { name: 'حليب طويل الأجل', sales: 580, revenue: 12760 },
];
