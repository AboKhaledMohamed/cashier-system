import React from 'react';
import { useShop } from '../context/ShopContext';

/**
 * Hook for checking user permissions
 * Based on the permission matrix from the user's table:
 * 
 * Permission Matrix:
 * - POS البيع في: All roles ✅
 * - إضافة صنف (Add Item): All roles ✅
 * - إضافة موردين فقط: All roles ✅
 * - تسجيل مصاريف تجارية: All roles ✅
 * - عمل مرتجعات: All roles ✅
 * - خصم بحد أقصى 10%: All roles ✅
 * - فتح وإغلاق الصندوق: All roles ✅
 * - إضافة وتعديل منتجات: Admin ✅, Manager ✅, Cashier ❌
 * - حذف منتجات: Admin ✅, Manager ✅, Cashier ❌
 * - خصم بدون حد: Admin ✅, Manager ✅, Cashier ❌
 * - عرض التقارير: Admin ✅, Manager ✅, Cashier ✅
 * - إضافة عميل: Admin ✅, Manager ✅, Cashier ✅
 * - تعديل/حذف عميل: Admin ✅, Manager ✅, Cashier ❌
 * - إضافة مورد: Admin ✅, Manager ✅, Cashier ✅
 * - تعديل/حذف مورد: Admin ✅, Manager ✅, Cashier ❌
 * - عمل مكافآت: Admin ✅, Manager ✅, Cashier ❌
 * - إدارة المستخدمين: Admin ✅, Manager ❌, Cashier ❌
 * - الإعدادات: Admin ✅, Manager ❌, Cashier ❌
 * - حذف أي فاتورة (Delete any invoice): Admin ✅, Manager ❌, Cashier ❌
 */

export function usePermissions() {
  const { currentUser } = useShop();

  const hasPermission = (permission: keyof CurrentUserPermissions): boolean => {
    if (!currentUser) return false;
    const value = (currentUser as any)[permission];
    return value === 1 || value === true;
  };

  const getMaxDiscountPct = (): number => {
    return currentUser?.max_discount_pct ?? 0;
  };

  const getRole = (): string => {
    return currentUser?.role ?? '';
  };

  const isAdmin = (): boolean => getRole() === 'admin';
  const isManager = (): boolean => getRole() === 'manager';
  const isCashier = (): boolean => getRole() === 'cashier';

  return {
    // Basic role checks
    isAdmin,
    isManager,
    isCashier,
    getRole,
    
    // Permission checks
    hasPermission,
    getMaxDiscountPct,
    
    // Specific permissions (for convenience)
    canViewCosts: hasPermission('can_view_costs'),
    canApplyDiscount: hasPermission('can_apply_discount'),
    canVoidInvoice: hasPermission('can_void_invoice'),
    canManageProducts: hasPermission('can_manage_products'),
    canViewReports: hasPermission('can_view_reports'),
    canAddProducts: hasPermission('can_add_products'),
    canEditProducts: hasPermission('can_edit_products'),
    canDeleteProducts: hasPermission('can_delete_products'),
    canManageInventory: hasPermission('can_manage_inventory'),
    canManageCustomers: hasPermission('can_manage_customers'),
    canManageSuppliers: hasPermission('can_manage_suppliers'),
    canManageUsers: hasPermission('can_manage_users'),
    canManageSettings: hasPermission('can_manage_settings'),
    canViewAuditLog: hasPermission('can_view_audit_log'),
    canDeleteInvoices: hasPermission('can_delete_invoices'),
    canGiveRewards: hasPermission('can_give_rewards'),
    canRecordExpenses: hasPermission('can_record_expenses'),
    canProcessReturns: hasPermission('can_process_returns'),
    // Granular customer/supplier permissions
    canAddCustomers: hasPermission('can_add_customers'),
    canEditCustomers: hasPermission('can_edit_customers'),
    canDeleteCustomers: hasPermission('can_delete_customers'),
    canAddSuppliers: hasPermission('can_add_suppliers'),
    canEditSuppliers: hasPermission('can_edit_suppliers'),
    canDeleteSuppliers: hasPermission('can_delete_suppliers'),
  };
}

// Interface for type checking permissions
interface CurrentUserPermissions {
  can_view_costs: number;
  can_apply_discount: number;
  can_void_invoice: number;
  can_manage_products: number;
  can_view_reports: number;
  can_add_products: number;
  can_edit_products: number;
  can_delete_products: number;
  can_manage_inventory: number;
  can_manage_customers: number;
  can_manage_suppliers: number;
  can_manage_users: number;
  can_manage_settings: number;
  can_view_audit_log: number;
  can_delete_invoices: number;
  can_give_rewards: number;
  can_record_expenses: number;
  can_process_returns: number;
  // Granular customer/supplier permissions
  can_add_customers: number;
  can_edit_customers: number;
  can_delete_customers: number;
  can_add_suppliers: number;
  can_edit_suppliers: number;
  can_delete_suppliers: number;
}

/**
 * Permission Guard Component - conditionally renders children based on permission
 */
export function PermissionGuard({ 
  permission, 
  children, 
  fallback = null 
}: { 
  permission: keyof CurrentUserPermissions;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { hasPermission } = usePermissions();
  
  if (hasPermission(permission)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

/**
 * Role Guard Component - conditionally renders children based on role
 */
export function RoleGuard({ 
  roles, 
  children, 
  fallback = null 
}: { 
  roles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { getRole } = usePermissions();
  
  if (roles.includes(getRole())) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}
