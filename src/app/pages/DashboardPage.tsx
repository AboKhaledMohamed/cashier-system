import { useEffect, useState } from 'react';
import Header from '../components/Header';
import KPICard from '../components/ui/KPICard';
import Button from '../components/ui/Button';
import { useShop } from '../context/ShopContext';
import {
  DollarSign,
  FileText,
  Package,
  Users,
  AlertCircle,
  TrendingDown,
  Plus,
  ShoppingCart,
  UserPlus,
  PackagePlus,
  Loader2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useNavigate } from 'react-router';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { dashboardStats, loadDashboardStats, loadProducts, loadCustomers, products, customers } = useShop();
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const api = (window as any).electronAPI;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadDashboardStats(),
        loadProducts(),
        loadCustomers(),
      ]);
      const invoices = await api.invoices.getAll({ status: 'مكتمل' });
      setRecentInvoices(invoices.slice(0, 5));
      const low = await api.products.getLowStock();
      setLowStockProducts(low);
    } catch (e) {
      console.error('Failed to load dashboard:', e);
    }
    setLoading(false);
  };

  if (loading || !dashboardStats) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center transition-theme"
        style={{ backgroundColor: 'var(--page-bg)' }}
      >
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  const stats = dashboardStats;

  return (
    <div 
      className="min-h-screen transition-theme"
      style={{ backgroundColor: 'var(--page-bg)' }}
    >
      <Header title="لوحة التحكم" />
      
      <div className="p-7 space-y-6">
        {/* Quick Actions */}
        <div 
          className="rounded-[10px] p-4 transition-theme"
          style={{ backgroundColor: 'var(--card-bg)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[18px] font-semibold transition-theme" style={{ color: 'var(--text-primary)' }}>الإجراءات السريعة</h3>
            <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>اختصارات للوصول الفوري للعمليات اليومية</p>
          </div>
          <div className="flex gap-3">
            <Button variant="success" onClick={() => navigate('/pos')} className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              بيع جديد
            </Button>
            <Button variant="info" onClick={() => navigate('/inventory', { state: { openAddForm: true } })} className="flex items-center gap-2">
              <PackagePlus className="w-5 h-5" />
              إضافة منتج
            </Button>
            <Button variant="ghost" onClick={() => navigate('/customers', { state: { openAddForm: true } })} className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              إضافة عميل
            </Button>
          </div>
        </div>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-5">
          <KPICard
            title="مبيعات الشهر"
            value={`${(stats.month_sales || 0).toLocaleString('en-US')} جنيه`}
            icon={DollarSign}
            iconColor="var(--primary)"
            iconBg="var(--primary-light)"
          />
          <KPICard
            title="فواتير الشهر"
            value={stats.month_invoices || 0}
            icon={FileText}
            iconColor="var(--info)"
            iconBg="var(--info-bg)"
          />
          <KPICard
            title="إجمالي المنتجات"
            value={stats.total_products || 0}
            icon={Package}
            iconColor="var(--warning)"
            iconBg="var(--warning-bg)"
          />
          <KPICard
            title="إجمالي العملاء"
            value={stats.total_customers || 0}
            icon={Users}
            iconColor="var(--accent-purple)"
            iconBg="rgba(139, 92, 246, 0.1)"
          />
          <KPICard
            title="ديون الشهر (آجل)"
            value={`${(stats.month_customer_debt || 0).toLocaleString('en-US')} جنيه`}
            icon={AlertCircle}
            iconColor="var(--danger)"
            iconBg="var(--danger-bg)"
          />
          <KPICard
            title="مصاريف الشهر"
            value={`${(stats.month_expenses || 0).toLocaleString('en-US')} جنيه`}
            icon={TrendingDown}
            iconColor="var(--accent-orange)"
            iconBg="rgba(230, 126, 34, 0.1)"
          />
        </div>
        
        {/* Charts Row */}
        <div className="grid grid-cols-3 gap-5">
          {/* Sales Chart */}
          <div 
            className="col-span-2 rounded-[10px] p-5 transition-theme"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <h3 className="text-[21px] font-semibold mb-4 transition-theme" style={{ color: 'var(--text-primary)' }}>
              مبيعات آخر 7 أيام
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={(stats.last_7_days || []).map(d => ({
                day: d.day?.slice(5) || '',
                sales: d.total,
                count: d.count,
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="day" stroke="var(--text-muted)" style={{ fontSize: '12px', fontFamily: 'Cairo' }} />
                <YAxis stroke="var(--text-muted)" style={{ fontSize: '12px', fontFamily: 'Cairo' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--primary)',
                    borderRadius: '8px',
                    fontFamily: 'Cairo',
                    direction: 'rtl',
                  }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                />
                <Line
                  type="monotone" dataKey="sales" stroke="var(--primary)"
                  strokeWidth={3} dot={{ fill: 'var(--primary)', r: 5 }}
                  activeDot={{ r: 7 }} name="المبيعات"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Top Products */}
          <div 
            className="rounded-[10px] p-5 transition-theme"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <h3 className="text-[21px] font-semibold mb-4 transition-theme" style={{ color: 'var(--text-primary)' }}>
              أكثر المنتجات مبيعاً
            </h3>
            <div className="space-y-3">
              {(stats.top_products || [])
                .reduce((acc: any[], product: any) => {
                  const productName = (product.product_name || '').trim().toLowerCase();
                  const existing = acc.find(p => (p.product_name || '').trim().toLowerCase() === productName);
                  if (existing) {
                    existing.total_qty += product.total_qty || 0;
                    existing.total_revenue += product.total_revenue || 0;
                  } else {
                    acc.push({ ...product });
                  }
                  return acc;
                }, [])
                .sort((a: any, b: any) => (b.total_qty || 0) - (a.total_qty || 0))
                .slice(0, 8)
                .map((product: any, index: number) => (
                <div key={index} className="flex items-center justify-between pb-3 last:border-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-theme"
                      style={{ backgroundColor: 'var(--primary-light)' }}
                    >
                      <span className="text-[14px] font-bold" style={{ color: 'var(--primary)' }}>{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-[14px] font-medium transition-theme" style={{ color: 'var(--text-primary)' }}>{product.product_name}</p>
                      <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>{product.total_qty.toLocaleString('en-US')} قطعة</p>
                    </div>
                  </div>
                  <p className="text-[14px] font-bold" style={{ color: 'var(--primary)' }}>
                    {(product.total_revenue || 0).toLocaleString('en-US')} ج
                  </p>
                </div>
              ))}
              {(!stats.top_products || stats.top_products.length === 0) && (
                <p className="text-center py-4 transition-theme" style={{ color: 'var(--text-muted)' }}>لا توجد مبيعات اليوم</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Bottom Row */}
        <div className="grid grid-cols-2 gap-5">
          {/* Recent Invoices */}
          <div 
            className="rounded-[10px] p-5 transition-theme"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[21px] font-semibold transition-theme" style={{ color: 'var(--text-primary)' }}>آخر الفواتير</h3>
              <Button variant="ghost" onClick={() => navigate('/reports')} className="text-[14px] h-auto p-2">
                عرض الكل
              </Button>
            </div>
            <div className="space-y-2">
              {recentInvoices.map((invoice: any) => (
                <div 
                  key={invoice.id} 
                  className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all"
                  style={{ backgroundColor: 'var(--surface-1)' }}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-5 h-5 transition-theme" style={{ color: 'var(--text-muted)' }} />
                    <div>
                      <p className="text-[14px] font-medium transition-theme" style={{ color: 'var(--text-primary)' }}>{invoice.invoice_number}</p>
                      <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>
                        {invoice.time} - {invoice.customer_name || 'زبون عابر'}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-[14px] font-bold" style={{ color: 'var(--primary)' }}>
                      {(invoice.total || 0).toLocaleString('en-US')} جنيه
                    </p>
                    <p 
                      className="text-[12px] font-medium"
                      style={{ color: invoice.payment_method === 'نقدي' ? 'var(--primary)' : 'var(--warning)' }}
                    >
                      {invoice.payment_method === 'نقدي' ? 'نقدي' : 'آجل'}
                    </p>
                  </div>
                </div>
              ))}
              {recentInvoices.length === 0 && (
                <p className="text-center py-8 transition-theme" style={{ color: 'var(--text-muted)' }}>لا توجد فواتير بعد</p>
              )}
            </div>
          </div>
          
          {/* Stock Alerts */}
          <div 
            className="rounded-[10px] p-5 transition-theme"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[21px] font-semibold transition-theme" style={{ color: 'var(--text-primary)' }}>تنبيهات المخزون</h3>
              <Button variant="ghost" onClick={() => navigate('/inventory')} className="text-[14px] h-auto p-2">
                عرض الكل
              </Button>
            </div>
            <div className="space-y-2">
              {lowStockProducts.map((product: any) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 rounded-lg transition-theme"
                  style={{ 
                    backgroundColor: product.stock === 0 ? 'var(--danger-bg)' : 'var(--warning-bg)',
                    border: `1px solid ${product.stock === 0 ? 'var(--danger)' : 'var(--warning)'}`
                  }}
                >
                  <AlertCircle 
                    className="w-5 h-5 flex-shrink-0" 
                    style={{ color: product.stock === 0 ? 'var(--danger)' : 'var(--warning)' }}
                  />
                  <div className="flex-1">
                    <p className="text-[14px] font-medium transition-theme" style={{ color: 'var(--text-primary)' }}>{product.name}</p>
                    <p 
                      className="text-[12px]"
                      style={{ color: product.stock === 0 ? 'var(--danger)' : 'var(--warning)' }}
                    >
                      {product.stock === 0 ? 'نفد من المخزون' : `مخزون منخفض: ${product.stock} متبقي`}
                    </p>
                  </div>
                </div>
              ))}
              {lowStockProducts.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-[14px] transition-theme" style={{ color: 'var(--text-muted)' }}>لا توجد تنبيهات للمخزون</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}