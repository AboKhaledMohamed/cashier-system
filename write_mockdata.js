const fs = require('fs');

const content = `// Mock Data for Smart POS System - Small Shop Edition (Offline-First, Single Store)
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
export type PaymentMethod = 'cash' | 'credit' | 'card' | 'vodafone_cash' | 'instapay';

export const paymentMethodLabels: Record<PaymentMethod, { label: string; color: string }> = {
  cash: { label: 'نقدي', color: '#2ECC71' },
  credit: { label: 'آجل', color: '#F1C40F' },
  card: { label: 'شبكة', color: '#3498DB' },
  vodafone_cash: { label: 'فودافون كاش', color: '#E60000' },
  instapay: { label: 'إنستاباي', color: '#9B59B6' },
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

export type Permission = typeof availablePermissions[number]['id'];
`;

fs.writeFileSync('src/app/data/mockData_new.ts', content, 'utf8');
console.log('File created successfully');
