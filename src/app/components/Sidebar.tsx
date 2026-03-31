import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Truck,
  FileText,
  ShoppingBag,
  RotateCcw,
  Wallet,
  Receipt,
  UserCog,
  Settings,
  Menu,
  X,
  Bell,
} from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';

// Menu items with required permissions
const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم', requiredPermission: null }, // All users
  { path: '/pos', icon: ShoppingCart, label: 'نقطة البيع', requiredPermission: null }, // All users
  { path: '/inventory', icon: Package, label: 'المخزون', requiredPermission: 'can_manage_inventory' },
  { path: '/customers', icon: Users, label: 'العملاء', requiredPermission: 'can_add_customers' }, // Cashier can add customers
  { path: '/suppliers', icon: Truck, label: 'الموردين', requiredPermission: 'can_add_suppliers' }, // Cashier can add suppliers
  { path: '/reports', icon: FileText, label: 'التقارير', requiredPermission: 'can_view_reports' }, // Cashier can view reports
  { path: '/purchases', icon: ShoppingBag, label: 'المشتريات', requiredPermission: 'can_manage_inventory' },
  { path: '/returns', icon: RotateCcw, label: 'المردودات', requiredPermission: 'can_process_returns' },
  { path: '/notifications', icon: Bell, label: 'الإشعارات', requiredPermission: null }, // All users
  { path: '/expenses', icon: Receipt, label: 'المصاريف', requiredPermission: 'can_record_expenses' },
  { path: '/users', icon: UserCog, label: 'المستخدمين', requiredPermission: 'can_manage_users' },
  { path: '/settings', icon: Settings, label: 'الإعدادات', requiredPermission: 'can_manage_settings' },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation();
  const { hasPermission } = usePermissions();

  // Filter menu items based on permissions
  const visibleMenuItems = menuItems.filter(item => {
    if (item.requiredPermission === null) return true;
    return hasPermission(item.requiredPermission as any);
  });
  
  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed top-4 right-4 z-50 lg:hidden p-2 rounded-lg transition-theme"
        style={{ 
          backgroundColor: 'var(--sidebar-bg)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)'
        }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside 
        className={`
          h-screen fixed right-0 top-0 flex flex-col transition-theme z-40
          lg:w-[220px] md:w-[200px]
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          ${isOpen ? 'w-[220px]' : 'w-0 lg:w-[220px]'}
        `}
        style={{ backgroundColor: 'var(--sidebar-bg)' }}
      >
        {/* Logo */}
        <div 
          className="h-[64px] flex items-center justify-center border-b transition-theme"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-2">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-theme"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <ShoppingCart className="w-6 h-6" style={{ color: 'var(--text-on-primary)' }} />
            </div>
            <div className="text-right">
              <h1 
                className="text-[18px] font-bold transition-theme"
                style={{ color: 'var(--text-primary)' }}
              >
                الكاشير الذكي
              </h1>
              <p 
                className="text-[10px] transition-theme"
                style={{ color: 'var(--text-muted)' }}
              >
                Smart POS
              </p>
            </div>
          </div>
        </div>
        
        {/* Menu Items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 1024 && onToggle()}
                className="flex items-center gap-3 px-5 py-3 mx-2 rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                  color: isActive ? 'var(--sidebar-active-text)' : 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--surface-2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[14px] font-medium whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        {/* Version */}
        <div 
          className="p-4 border-t transition-theme"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="text-center py-3 border-t transition-theme" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
            <p className="text-[12px] font-medium">الإصدار 1.0</p>
            <p className="text-[11px] mt-1 opacity-80">برمجة : عبدالرحمن خاللد</p>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
}