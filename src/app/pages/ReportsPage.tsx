import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useShop } from '../context/ShopContext';
import { formatCurrency } from '../utils/formatters';
import {
  FileText,
  Download,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Store,
  Package,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function ReportsPage() {
  const { products } = useShop();
  const api = (window as any).electronAPI;
  
  const today = new Date().toISOString().split('T')[0];
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [reportType, setReportType] = useState('daily');
  const [activeTab, setActiveTab] = useState<'sales' | 'inventory' | 'purchases'>('sales');
  
  const [salesData, setSalesData] = useState<any[]>([]);
  const [profitData, setProfitData] = useState<any>(null);
  const [purchasesData, setPurchasesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Load reports based on filters
  const loadReports = async () => {
    setLoading(true);
    try {
      const sales = await api.reports.getSalesReport(dateFrom, dateTo);
      setSalesData(sales?.invoices || []);
      
      const profit = await api.reports.getProfitReport(dateFrom, dateTo);
      setProfitData(profit || {});
      
      const purchases = await api.purchases.getAll();
      setPurchasesData(
        (purchases || []).filter((p: any) => {
          const pDate = p.date || (p.created_at ? p.created_at.split(' ')[0] : new Date().toISOString().split('T')[0]);
          return pDate >= dateFrom && pDate <= dateTo;
        })
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [dateFrom, dateTo]);

  // Derived stats
  const filteredInvoicesCount = salesData.length;
  const filteredRevenue = salesData.reduce((sum, inv) => sum + (inv.total || inv.total_amount || 0), 0);
  const totalDiscount = profitData?.total_discounts || 0;
  const netProfit = profitData?.net_profit || 0;
  const totalPurchases = purchasesData.reduce((sum, p) => sum + (p.total || p.net_amount || 0), 0);

  // Inventory report - show stock from products
  const inventoryReport = (products || []).map(product => {
    return {
      name: product.name,
      barcode: product.barcode,
      totalStock: product.stock,
      category: product.category_name,
    };
  });
  
  return (
    <div 
      className="min-h-screen transition-theme"
      style={{ backgroundColor: 'var(--page-bg)' }}
    >
      <Header title="التقارير" />
      
      <div className="p-7 space-y-6">
        {/* Report Type Tabs */}
        <div 
          className="flex gap-2 border-b transition-theme"
          style={{ borderColor: 'var(--card-bg)' }}
        >
          <button
            onClick={() => setActiveTab('sales')}
            className="px-6 py-3 font-medium transition-all"
            style={{
              color: activeTab === 'sales' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'sales' ? '2px solid var(--primary)' : 'none'
            }}
          >
            تقارير المبيعات
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className="px-6 py-3 font-medium transition-all"
            style={{
              color: activeTab === 'inventory' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'inventory' ? '2px solid var(--primary)' : 'none'
            }}
          >
            تقارير المخزون
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className="px-6 py-3 font-medium transition-all"
            style={{
              color: activeTab === 'purchases' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'purchases' ? '2px solid var(--primary)' : 'none'
            }}
          >
            تقارير المشتريات
          </button>
        </div>
        
        {/* Filters */}
        <div 
          className="rounded-lg p-5 transition-theme"
          style={{ backgroundColor: 'var(--card-bg)' }}
        >
          <div className="flex flex-wrap items-end gap-4">
            <Input
              label="من تاريخ"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <Input
              label="إلى تاريخ"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
            
            <select
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                const todayBtn = new Date();
                if (e.target.value === 'daily') {
                  const dateStr = todayBtn.toISOString().split('T')[0];
                  setDateFrom(dateStr);
                  setDateTo(dateStr);
                } else if (e.target.value === 'monthly') {
                  const year = todayBtn.getFullYear();
                  const month = String(todayBtn.getMonth() + 1).padStart(2, '0');
                  setDateFrom(`${year}-${month}-01`);
                  
                  const endOfMonth = new Date(year, todayBtn.getMonth() + 1, 0);
                  setDateTo(endOfMonth.toISOString().split('T')[0]);
                }
              }}
              className="h-[42px] rounded-lg px-4 outline-none transition-theme"
              style={{
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)'
              }}
            >
              <option value="daily">تقرير يومي</option>
              <option value="monthly">تقرير شهري</option>
              <option value="custom">تقرير مخصص</option>
            </select>
            

            
            <Button variant="primary" className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              عرض التقرير
            </Button>
          </div>
        </div>
        
        {/* Main Content - Based on Active Tab */}
        {activeTab === 'sales' && (
          <div className="grid grid-cols-3 gap-6">
            {/* Left Side - Summary */}
            <div className="col-span-2 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className="rounded-lg p-5 transition-theme"
                  style={{ backgroundColor: 'var(--card-bg)' }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: 'var(--info-bg)' }}
                    >
                      <FileText className="w-5 h-5" style={{ color: 'var(--info)' }} />
                    </div>
                    <div>
                      <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>عدد الفواتير</p>
                      <p className="text-[21px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>
                        {filteredInvoicesCount}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className="rounded-lg p-5 transition-theme"
                  style={{ backgroundColor: 'var(--card-bg)' }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: 'var(--primary-light)' }}
                    >
                      <DollarSign className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                    </div>
                    <div>
                      <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>إجمالي الإيراد</p>
                      <p className="text-[21px] font-bold" style={{ color: 'var(--primary)' }}>
                        {filteredRevenue.toLocaleString('en-US')} جنيه
                      </p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className="rounded-lg p-5 transition-theme"
                  style={{ backgroundColor: 'var(--card-bg)' }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: 'var(--warning-bg)' }}
                    >
                      <TrendingDown className="w-5 h-5" style={{ color: 'var(--warning)' }} />
                    </div>
                    <div>
                      <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>إجمالي الخصومات</p>
                      <p className="text-[21px] font-bold" style={{ color: 'var(--warning)' }}>
                        {totalDiscount.toLocaleString('en-US')} جنيه
                      </p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className="rounded-lg p-5 transition-theme"
                  style={{ backgroundColor: 'var(--card-bg)' }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: 'var(--primary-light)' }}
                    >
                      <TrendingUp className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                    </div>
                    <div>
                      <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>صافي الربح التقديري</p>
                      <p className="text-[21px] font-bold" style={{ color: 'var(--primary)' }}>
                        {netProfit.toLocaleString('en-US')} جنيه
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Filtered Invoices Table */}
              <div 
                className="rounded-lg p-5 transition-theme"
                style={{ backgroundColor: 'var(--card-bg)' }}
              >
                <h3 className="text-[21px] font-semibold mb-4 transition-theme" style={{ color: 'var(--text-primary)' }}>
                  فواتير المبيعات
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-[14px]">
                    <thead 
                      className="transition-theme"
                      style={{ backgroundColor: 'var(--surface-1)' }}
                    >
                      <tr>
                        <th className="p-3 text-right transition-theme" style={{ color: 'var(--text-muted)' }}>رقم الفاتورة</th>
                        <th className="p-3 text-right transition-theme" style={{ color: 'var(--text-muted)' }}>التاريخ</th>
                        <th className="p-3 text-right transition-theme" style={{ color: 'var(--text-muted)' }}>الفرع</th>
                        <th className="p-3 text-right transition-theme" style={{ color: 'var(--text-muted)' }}>المخزن</th>
                        <th className="p-3 text-right transition-theme" style={{ color: 'var(--text-muted)' }}>الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData.length === 0 ? (
                        <tr><td colSpan={4} className="p-4 text-center transition-theme" style={{ color: 'var(--text-muted)' }}>لا توجد مبيعات في هذه الفترة</td></tr>
                      ) : (
                        salesData.map((inv) => (
                          <tr 
                            key={inv.id} 
                            className="border-b transition-theme"
                            style={{ borderColor: 'var(--surface-1)' }}
                          >
                            <td className="p-3 transition-theme" style={{ color: 'var(--text-primary)' }}>{inv.invoice_number}</td>
                            <td className="p-3 transition-theme" style={{ color: 'var(--text-muted)' }}>{inv.date} {inv.time}</td>
                            <td className="p-3 transition-theme" style={{ color: 'var(--text-muted)' }}>{inv.customer_name || 'عميل نقدي'}</td>
                            <td className="p-3 font-bold" style={{ color: 'var(--primary)' }}>{formatCurrency(inv.total || inv.total_amount || 0)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Right Side - Quick Export */}
            <div className="space-y-4">
              <div 
                className="rounded-lg p-5 transition-theme"
                style={{ backgroundColor: 'var(--card-bg)' }}
              >
                <h3 className="text-[18px] font-semibold mb-4 transition-theme" style={{ color: 'var(--text-primary)' }}>
                  تصدير سريع
                </h3>
                <div className="space-y-3">
                  <Button
                    variant="success"
                    fullWidth
                    className="flex items-center justify-center gap-2"
                    onClick={() => window.print()}
                  >
                    <Download className="w-5 h-5" />
                    طباعة التقرير
                  </Button>
                  <Button
                    variant="info"
                    fullWidth
                    className="flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    تصدير Excel
                  </Button>
                </div>
              </div>
              
              {/* Payment Methods Summary */}
              <div 
                className="rounded-lg p-5 transition-theme"
                style={{ backgroundColor: 'var(--card-bg)' }}
              >
                <h3 className="text-[18px] font-semibold mb-4 transition-theme" style={{ color: 'var(--text-primary)' }}>
                  ملخص طرق الدفع
                </h3>
                <div className="space-y-3">
                  <div 
                    className="flex items-center justify-between p-3 rounded-lg border transition-theme"
                    style={{ 
                      backgroundColor: 'var(--primary-light)',
                      borderColor: 'var(--primary)'
                    }}
                  >
                    <span className="text-[14px] transition-theme" style={{ color: 'var(--text-primary)' }}>إجمالي الإيرادات (المبيعات)</span>
                    <span className="text-[16px] font-bold" style={{ color: 'var(--primary)' }}>
                      {formatCurrency(filteredRevenue)}
                    </span>
                  </div>
                  <div 
                    className="flex items-center justify-between p-3 rounded-lg border transition-theme"
                    style={{ 
                      backgroundColor: 'var(--warning-bg)',
                      borderColor: 'var(--warning)'
                    }}
                  >
                    <span className="text-[14px] transition-theme" style={{ color: 'var(--text-primary)' }}>إجمالي المشتريات (المصروفات)</span>
                    <span className="text-[16px] font-bold" style={{ color: 'var(--warning)' }}>
                      {formatCurrency(totalPurchases)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div 
            className="rounded-lg p-5 transition-theme"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[21px] font-semibold flex items-center gap-2 transition-theme" style={{ color: 'var(--text-primary)' }}>
                <Package className="w-6 h-6" style={{ color: 'var(--warning)' }} />
                تقرير المخزون
              </h3>
              <Button variant="success" onClick={() => window.print()}>
                <Download className="w-5 h-5" />
                طباعة
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[14px]">
                <thead 
                  className="transition-theme"
                  style={{ backgroundColor: 'var(--surface-1)' }}
                >
                  <tr>
                    <th className="p-3 text-right transition-theme" style={{ color: 'var(--text-muted)' }}>الصنف</th>
                    <th className="p-3 text-right transition-theme" style={{ color: 'var(--text-muted)' }}>الباركود</th>
                    <th className="p-3 text-right transition-theme" style={{ color: 'var(--text-muted)' }}>التصنيف</th>
                    <th className="p-3 text-center transition-theme" style={{ color: 'var(--text-muted)' }}>المخزون</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryReport.map((product, idx) => (
                    <tr 
                      key={idx} 
                      className="border-b transition-theme"
                      style={{ borderColor: 'var(--surface-1)' }}
                    >
                      <td className="p-3 font-medium transition-theme" style={{ color: 'var(--text-primary)' }}>{product.name}</td>
                      <td className="p-3 font-mono transition-theme" style={{ color: 'var(--text-muted)' }}>{product.barcode}</td>
                      <td className="p-3 transition-theme" style={{ color: 'var(--text-muted)' }}>{product.category || '-'}</td>
                      <td className="p-3 text-center font-bold" style={{ color: 'var(--primary)' }}>{product.totalStock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'purchases' && (
          <div 
            className="rounded-lg p-5 transition-theme"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[21px] font-semibold flex items-center gap-2 transition-theme" style={{ color: 'var(--text-primary)' }}>
                <Store className="w-6 h-6" style={{ color: 'var(--info)' }} />
                تقرير المشتريات
              </h3>
              <Button variant="success" onClick={() => window.print()}>
                <Download className="w-5 h-5" />
                طباعة
              </Button>
            </div>
            <p className="mb-4 transition-theme" style={{ color: 'var(--text-muted)' }}>إجمالي فواتير المشتريات في المدة المحددة: {purchasesData.length}</p>
            <div className="overflow-x-auto">
              <table className="w-full text-[14px]">
                <thead 
                  className="transition-theme"
                  style={{ backgroundColor: 'var(--surface-1)' }}
                >
                  <tr>
                    <th className="p-3 text-right transition-theme" style={{ color: 'var(--text-muted)' }}>رقم الفاتورة</th>
                    <th className="p-3 text-right transition-theme" style={{ color: 'var(--text-muted)' }}>المورد</th>
                    <th className="p-3 text-right transition-theme" style={{ color: 'var(--text-muted)' }}>التاريخ</th>
                    <th className="p-3 text-right transition-theme" style={{ color: 'var(--text-muted)' }}>الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {purchasesData.map((p, idx) => (
                    <tr 
                      key={idx} 
                      className="border-b transition-theme"
                      style={{ borderColor: 'var(--surface-1)' }}
                    >
                      <td className="p-3 font-medium transition-theme" style={{ color: 'var(--text-primary)' }}>{p.purchase_number || p.invoice_number}</td>
                      <td className="p-3 transition-theme" style={{ color: 'var(--text-primary)' }}>{p.supplier_name || 'مورد غير معروف'}</td>
                      <td className="p-3 transition-theme" style={{ color: 'var(--text-muted)' }}>{p.date} {p.time}</td>
                      <td className="p-3 font-bold" style={{ color: 'var(--primary)' }}>{formatCurrency(p.total || p.net_amount || 0)}</td>
                    </tr>
                  ))}
                  {purchasesData.length === 0 && (
                    <tr><td colSpan={4} className="p-4 text-center transition-theme" style={{ color: 'var(--text-muted)' }}>لا توجد مشتريات في هذه الفترة</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
