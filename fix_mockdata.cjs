const fs = require('fs');

const content = `// Mock Data for Smart POS System - Small Shop Edition
export type ProductType = 'piece' | 'weight' | 'box' | 'carton' | 'meter' | 'liter' | 'bundle';

export const productTypeLabels: Record<ProductType, string> = {
  piece: 'قطعة', weight: 'وزن', box: 'علبة', carton: 'كرتونة', meter: 'متر', liter: 'لتر', bundle: 'مجموعة',
};

export type Unit = 'piece' | 'kg' | 'gram' | 'box' | 'carton' | 'meter' | 'cm' | 'liter' | 'ml' | 'bundle';

export const unitLabels: Record<Unit, string> = {
  piece: 'قطعة', kg: 'كيلو', gram: 'جرام', box: 'علبة', carton: 'كرتونة', meter: 'متر', cm: 'سم', liter: 'لتر', ml: 'مل', bundle: 'مجموعة',
};

export type PaymentMethod = 'cash' | 'credit' | 'card' | 'vodafone_cash' | 'instapay';

export const paymentMethodLabels: Record<PaymentMethod, { label: string; color: string }> = {
  cash: { label: 'نقدي', color: '#2ECC71' },
  credit: { label: 'آجل', color: '#F1C40F' },
  card: { label: 'شبكة', color: '#3498DB' },
  vodafone_cash: { label: 'فودافون كاش', color: '#E60000' },
  instapay: { label: 'إنستاباي', color: '#9B59B6' },
};

export type TrustLevel = 'excellent' | 'good' | 'average' | 'poor' | 'bad';

export const trustLevelLabels: Record<TrustLevel, { label: string; color: string; minScore: number }> = {
  excellent: { label: 'ممتاز', color: '#2ECC71', minScore: 90 },
  good: { label: 'جيد', color: '#3498DB', minScore: 70 },
  average: { label: 'متوسط', color: '#F1C40F', minScore: 50 },
  poor: { label: 'ضعيف', color: '#E67E22', minScore: 30 },
  bad: { label: 'سيء', color: '#E74C3C', minScore: 0 },
};

export type UserRole = 'admin' | 'manager' | 'cashier';

export const roleLabels: Record<UserRole, string> = {
  admin: 'مدير النظام', manager: 'مدير', cashier: 'كاشير',
};

export const availablePermissions = [
  { id: 'view_sales', label: 'مشاهدة المبيعات' },
  { id: 'create_sale', label: 'إنشاء فاتورة' },
  { id: 'cancel_invoice', label: 'إلغاء فاتورة' },
  { id: 'apply_discount', label: 'تطبيق خصم' },
  { id: 'manage_inventory', label: 'إدارة المخزون' },
  { id: 'manage_products', label: 'إدارة المنتجات' },
  { id: 'manage_customers', label: 'إدارة العملاء' },
  { id: 'manage_users', label: 'إدارة المستخدمين' },
  { id: 'manage_settings', label: 'الإعدادات' },
] as const;

export type Permission = typeof availablePermissions[number]['id'];

export interface StorageLocation {
  id: string;
  name: string;
  warehouseId: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  type: 'color' | 'size' | 'model' | 'other';
  stock: number;
  barcode?: string;
}

export interface UnitConversion {
  fromUnit: Unit;
  toUnit: Unit;
  ratio: number;
}

export interface Product {
  id: string;
  name: string;
  barcode: string;
  type: ProductType;
  category: string;
  price: number;
  cost: number;
  baseUnit: Unit;
  secondaryUnit?: Unit;
  unitConversion?: UnitConversion;
  stock: number;
  stockAlert: number;
  allowDecimal: boolean;
  storageLocationId?: string;
  storageLocationName?: string;
  productionDate?: string;
  expiryDate?: string;
  expiryAlertDays?: number;
  variants?: ProductVariant[];
  hasVariants: boolean;
  image?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  unit?: string;
  warehouseStock?: Record<string, number>;
  totalStock?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  phone2?: string;
  address?: { area?: string; street?: string; building?: string; floor?: string; apartment?: string; landmark?: string; } | string;
  debt: number;
  creditLimit: number;
  trustScore: number;
  trustLevel: TrustLevel;
  loyaltyPoints: number;
  totalPurchases: number;
  debtReminders?: { id: string; date: string; amount: number; isPaid: boolean; notes?: string; }[];
  lastTransaction: string;
  lastTransactionAmount?: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unit?: Unit;
  price: number;
  total: number;
  discount?: number;
  discountAmount?: number;
  cost?: number;
  profit?: number;
  warehouseId?: string;
  warehouseName?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  time: string;
  customerId?: string;
  customerName?: string;
  customer?: string;
  items: InvoiceItem[];
  subtotal: number;
  itemDiscountTotal?: number;
  discount: number;
  discountAmount: number;
  taxEnabled?: boolean;
  taxRate?: number;
  taxAmount?: number;
  total: number;
  paymentMethod: PaymentMethod | string;
  paid: number;
  change: number;
  creditAmount?: number;
  status: 'completed' | 'pending' | 'cancelled' | 'returned' | 'مكتمل' | 'معلق' | 'ملغي';
  isReturn?: boolean;
  originalInvoiceId?: string;
  branchId?: string;
  branchName?: string;
  warehouseId?: string;
  warehouseName?: string;
  userId: string;
  userName: string;
  notes?: string;
  createdAt?: string;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  pin?: string;
  password: string;
  permissions: Permission[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  branchId?: string;
  warehouseId?: string;
}

export interface CashierSession {
  id: string;
  userId: string;
  userName: string;
  openedAt: string;
  openingCash: number;
  closedAt?: string;
  closingCash?: number;
  expectedCash?: number;
  difference?: number;
  totalSales: number;
  totalCashSales: number;
  totalCreditSales: number;
  totalCardSales: number;
  totalVodafoneCash: number;
  totalInstapay: number;
  invoiceCount: number;
  status: 'open' | 'closed';
  notes?: string;
}

export const defaultStorageLocations: StorageLocation[] = [
  { id: 'loc-1', name: 'رف 1 - الأمامي', warehouseId: 'wh-1' },
  { id: 'loc-2', name: 'رف 2 - الخلفي', warehouseId: 'wh-1' },
  { id: 'loc-3', name: 'رف 3 - الجانبي', warehouseId: 'wh-1' },
  { id: 'loc-4', name: 'المستودع الخلفي', warehouseId: 'wh-1' },
  { id: 'loc-5', name: 'الثلاجة', warehouseId: 'wh-1' },
];

export const mockProducts: Product[] = [
  { id: '1', name: 'أرز مصري', barcode: '6221234567890', type: 'weight', category: 'حبوب', price: 17, cost: 13, baseUnit: 'kg', stock: 50, stockAlert: 10, allowDecimal: true, storageLocationId: 'loc-1', storageLocationName: 'رف 1 - الأمامي', hasVariants: false, isActive: true, createdAt: '2026-01-01', unit: 'كجم' },
  { id: '2', name: 'زيت دوار الشمس', barcode: '6221234567891', type: 'liter', category: 'زيوت', price: 55, cost: 42, baseUnit: 'liter', stock: 100, stockAlert: 20, allowDecimal: true, storageLocationId: 'loc-1', storageLocationName: 'رف 1 - الأمامي', expiryDate: '2026-12-31', expiryAlertDays: 30, hasVariants: false, isActive: true, createdAt: '2026-01-01', unit: 'لتر' },
  { id: '3', name: 'سكر أبيض', barcode: '6221234567892', type: 'weight', category: 'حبوب', price: 28, cost: 22, baseUnit: 'kg', stock: 15, stockAlert: 25, allowDecimal: true, storageLocationId: 'loc-2', storageLocationName: 'رف 2 - الخلفي', hasVariants: false, isActive: true, createdAt: '2026-01-01', unit: 'كجم' },
  { id: '4', name: 'معكرونة إسباجتي', barcode: '6221234567893', type: 'piece', category: 'معكرونات', price: 12, cost: 9, baseUnit: 'piece', secondaryUnit: 'carton', unitConversion: { fromUnit: 'piece', toUnit: 'carton', ratio: 20 }, stock: 280, stockAlert: 50, allowDecimal: false, storageLocationId: 'loc-1', storageLocationName: 'رف 1 - الأمامي', hasVariants: false, isActive: true, createdAt: '2026-01-01', unit: 'علبة' },
  { id: '5', name: 'صلصة طماطم', barcode: '6221234567894', type: 'piece', category: 'معلبات', price: 18, cost: 14, baseUnit: 'piece', stock: 0, stockAlert: 20, allowDecimal: false, storageLocationId: 'loc-3', storageLocationName: 'رف 3 - الجانبي', hasVariants: false, isActive: true, createdAt: '2026-01-01', unit: 'علبة' },
  { id: '6', name: 'شاي أسود', barcode: '6221234567895', type: 'box', category: 'مشروبات', price: 65, cost: 50, baseUnit: 'box', stock: 65, stockAlert: 10, allowDecimal: false, storageLocationId: 'loc-1', storageLocationName: 'رف 1 - الأمامي', hasVariants: false, isActive: true, createdAt: '2026-01-01', unit: 'علبة' },
  { id: '7', name: 'حليب طويل الأجل', barcode: '6221234567896', type: 'piece', category: 'ألبان', price: 22, cost: 17, baseUnit: 'piece', stock: 20, stockAlert: 20, allowDecimal: false, storageLocationId: 'loc-5', storageLocationName: 'الثلاجة', expiryDate: '2026-04-15', expiryAlertDays: 7, hasVariants: false, isActive: true, createdAt: '2026-01-01', unit: 'علبة' },
  { id: '8', name: 'بسكويت شاي', barcode: '6221234567897', type: 'piece', category: 'حلويات', price: 8, cost: 6, baseUnit: 'piece', stock: 230, stockAlert: 50, allowDecimal: false, storageLocationId: 'loc-1', storageLocationName: 'رف 1 - الأمامي', hasVariants: false, isActive: true, createdAt: '2026-01-01', unit: 'علبة' },
];

export const mockCustomers: Customer[] = [
  { id: '1', name: 'محمد أحمد علي', phone: '01012345678', address: { area: 'وسط البلد', street: 'شارع الجمهورية', building: '15', floor: '3', apartment: '12' }, debt: 0, creditLimit: 5000, trustScore: 95, trustLevel: 'excellent', loyaltyPoints: 1250, totalPurchases: 12500, lastTransaction: '2026-03-20', lastTransactionAmount: 350, isActive: true, createdAt: '2026-01-15' },
  { id: '2', name: 'فاطمة حسن محمود', phone: '01123456789', address: { area: 'المنصورة الجديدة', street: 'شارع البحر', building: '42', floor: '2' }, debt: 850, creditLimit: 3000, trustScore: 75, trustLevel: 'good', loyaltyPoints: 680, totalPurchases: 6800, lastTransaction: '2026-03-18', lastTransactionAmount: 850, isActive: true, createdAt: '2026-01-20' },
  { id: '3', name: 'أحمد محمد السيد', phone: '01234567890', address: { area: 'المحطة', street: 'شارع الجلاء', building: '8', floor: '1' }, debt: 1200, creditLimit: 2000, trustScore: 45, trustLevel: 'average', loyaltyPoints: 320, totalPurchases: 3200, debtReminders: [{ id: 'dr1', date: '2026-03-25', amount: 1200, isPaid: false, notes: 'تذكير أول' }], lastTransaction: '2026-03-15', lastTransactionAmount: 600, isActive: true, createdAt: '2026-02-01' },
  { id: '4', name: 'نورهان عبد الرحمن', phone: '01098765432', debt: 0, creditLimit: 2000, trustScore: 80, trustLevel: 'good', loyaltyPoints: 450, totalPurchases: 4500, lastTransaction: '2026-03-21', lastTransactionAmount: 200, isActive: true, createdAt: '2026-02-10' },
  { id: '5', name: 'كريم السيد إبراهيم', phone: '01156789012', address: { area: 'الجمعية', street: 'شارع النصر', building: '25', floor: '4' }, debt: 2500, creditLimit: 4000, trustScore: 35, trustLevel: 'poor', loyaltyPoints: 180, totalPurchases: 1800, debtReminders: [{ id: 'dr2', date: '2026-03-20', amount: 1500, isPaid: true, notes: 'دفع جزئي' }, { id: 'dr3', date: '2026-03-28', amount: 1000, isPaid: false, notes: 'تذكير ثاني' }], lastTransaction: '2026-03-10', lastTransactionAmount: 1000, isActive: true, createdAt: '2026-02-15' },
];

export const mockUsers: User[] = [
  { id: '1', username: 'admin', fullName: 'أحمد محمد علي', role: 'admin', password: 'admin123', permissions: ['view_sales', 'create_sale', 'cancel_invoice', 'apply_discount', 'manage_inventory', 'manage_products', 'manage_customers', 'manage_users', 'manage_settings'], isActive: true, lastLogin: '2026-03-21 09:00', createdAt: '2026-01-01' },
  { id: '2', username: 'manager1', fullName: 'محمود حسن السيد', role: 'manager', password: 'manager123', permissions: ['view_sales', 'create_sale', 'apply_discount', 'manage_inventory', 'manage_products', 'manage_customers'], isActive: true, lastLogin: '2026-03-20 14:30', createdAt: '2026-01-01' },
  { id: '3', username: 'cashier1', fullName: 'فاطمة أحمد', role: 'cashier', pin: '1234', password: 'cashier123', permissions: ['view_sales', 'create_sale'], isActive: true, lastLogin: '2026-03-21 08:00', createdAt: '2026-01-01' },
];

export const currentSession = {
  userId: '3',
  userName: 'فاطمة أحمد',
  userRole: 'cashier',
};
`;

fs.writeFileSync('src/app/data/mockData_fixed.ts', content, 'utf8');
console.log('Created mockData_fixed.ts');
