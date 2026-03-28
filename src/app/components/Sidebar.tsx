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
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
  { path: '/pos', icon: ShoppingCart, label: 'نقطة البيع' },
  { path: '/inventory', icon: Package, label: 'المخزون' },
  { path: '/customers', icon: Users, label: 'العملاء' },
  { path: '/suppliers', icon: Truck, label: 'الموردين' },
  { path: '/reports', icon: FileText, label: 'التقارير' },
  { path: '/purchases', icon: ShoppingBag, label: 'المشتريات' },
  { path: '/returns', icon: RotateCcw, label: 'المردودات' },

  { path: '/expenses', icon: Receipt, label: 'المصاريف' },
  { path: '/users', icon: UserCog, label: 'المستخدمين' },
  { path: '/settings', icon: Settings, label: 'الإعدادات' },
];

export default function Sidebar() {
  const location = useLocation();
  
  return (
    <aside 
      className="w-[220px] h-screen fixed right-0 top-0 flex flex-col transition-theme"
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
      <nav className="flex-1 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
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
              <span className="text-[14px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* Version */}
      <div 
        className="p-4 border-t transition-theme"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <p 
          className="text-[12px] text-center transition-theme"
          style={{ color: 'var(--text-muted)' }}
        >
          الإصدار 1.0
        </p>
      </div>
    </aside>
  );
}