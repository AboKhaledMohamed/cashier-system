import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useShop } from '../context/ShopContext';
import { formatCurrency } from '../utils/formatters';
import {
  FileText,
  Download,
  Store,
  Package,
  Eye,
  Trash2,
  X,
  Printer,
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

  // State for modals
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<{id: string, number: string} | null>(null);

  // Handle print invoice
  const handlePrintInvoice = (inv: any) => {
    setSelectedInvoice(inv);
    // Open print window after a short delay to ensure state is updated
    setTimeout(() => {
      window.print();
    }, 100);
  };
  const handleViewInvoice = (inv: any) => {
    setSelectedInvoice(inv);
    setShowInvoiceModal(true);
  };

  // Handle delete invoice - non-blocking with custom modal
  const confirmDeleteInvoice = (id: string, invoiceNumber: string) => {
    setInvoiceToDelete({id, number: invoiceNumber});
  };

  const executeDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
    
    try {
      await api.invoices.delete(invoiceToDelete.id);
      // Remove deleted invoice from local state immediately (no blocking)
      setSalesData(prev => prev.filter(inv => inv.id !== invoiceToDelete.id));
    } catch (e: any) {
      console.error('Delete error:', e);
      alert('فشل حذف الفاتورة: ' + (e.message || 'خطأ غير معروف'));
    } finally {
      setInvoiceToDelete(null);
    }
  };
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
      className="h-screen overflow-hidden transition-theme flex flex-col"
      style={{ backgroundColor: 'var(--page-bg)' }}
    >
      <Header title="التقارير" />
      
      <div className="p-7 space-y-6 flex-1 overflow-hidden">
        {/* Report Type Tabs */}
        <div 
          className="flex gap-2 border-b transition-theme flex-shrink-0 items-center justify-between"
          style={{ borderColor: 'var(--card-bg)' }}
        >
          <div className="flex gap-2">
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
          
          {/* Report Type Selector */}
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-[36px] rounded-lg px-3 outline-none transition-theme text-[14px]"
              style={{
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)'
              }}
            />
            <span style={{ color: 'var(--text-muted)' }}>إلى</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-[36px] rounded-lg px-3 outline-none transition-theme text-[14px]"
              style={{
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)'
              }}
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
                  const month = todayBtn.getMonth();
                  const monthStr = String(month + 1).padStart(2, '0');
                  setDateFrom(`${year}-${monthStr}-01`);
                  
                  // Get last day of month (handles 28/29/30/31 days)
                  const lastDay = new Date(year, month + 1, 0).getDate();
                  setDateTo(`${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`);
                }
              }}
              className="h-[36px] rounded-lg px-3 outline-none transition-theme text-[14px]"
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
          </div>
        </div>
        
        {/* Main Content - Based on Active Tab */}
        {activeTab === 'sales' && (
          <div className="grid grid-cols-3 gap-6" style={{ height: 'calc(100vh - 220px)' }}>
            {/* Left Side - Invoices Table */}
            <div className="col-span-2 flex flex-col gap-4 overflow-hidden">
              {/* Filtered Invoices Table */}
              <div 
                className="rounded-lg p-5 transition-theme flex flex-col flex-1 overflow-hidden"
                style={{ backgroundColor: 'var(--card-bg)' }}
              >
                <h3 className="text-[21px] font-semibold mb-4 transition-theme flex-shrink-0 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                  فواتير المبيعات
                  <span 
                    className="text-[14px] px-3 py-1 rounded-full font-medium"
                    style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}
                  >
                    {salesData.length} فاتورة
                  </span>
                </h3>
                <div className="overflow-auto flex-1">
                  <table className="w-full text-[14px]">
                    <thead 
                      className="transition-theme sticky top-0"
                      style={{ backgroundColor: 'var(--surface-1)' }}
                    >
                      <tr>
                        <th className="p-3 text-right transition-theme" style={{ color: 'var(--text-muted)' }}>رقم الفاتورة</th>
                        <th className="p-3 text-right transition-theme" style={{ color: 'var(--text-muted)' }}>التاريخ</th>
                        <th className="p-3 text-right transition-theme" style={{ color: 'var(--text-muted)' }}>اسم العميل</th>
                        <th className="p-3 text-right transition-theme" style={{ color: 'var(--text-muted)' }}>الإجمالي</th>
                        <th className="p-3 text-center transition-theme" style={{ color: 'var(--text-muted)' }}>إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData.length === 0 ? (
                        <tr><td colSpan={5} className="p-4 text-center transition-theme" style={{ color: 'var(--text-muted)' }}>لا توجد مبيعات في هذه الفترة</td></tr>
                      ) : (
                        salesData.map((inv) => (
                          <tr 
                            key={inv.id} 
                            className="border-b transition-theme"
                            style={{ borderColor: 'var(--surface-1)' }}
                          >
                            <td className="p-3 transition-theme" style={{ color: 'var(--text-primary)' }}>{inv.invoice_number}</td>
                            <td className="p-3 transition-theme" style={{ color: 'var(--text-muted)' }}>{inv.date} {inv.time}</td>
                            <td className="p-3 transition-theme" style={{ color: 'var(--text-primary)' }}>{inv.customer_name || 'عميل نقدي'}</td>
                            <td className="p-3 font-bold" style={{ color: 'var(--primary)' }}>{formatCurrency(inv.total || inv.total_amount || 0)}</td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleViewInvoice(inv)}
                                  className="w-8 h-8 rounded flex items-center justify-center transition-colors"
                                  style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}
                                  title="عرض التفاصيل"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handlePrintInvoice(inv)}
                                  className="w-8 h-8 rounded flex items-center justify-center transition-colors"
                                  style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}
                                  title="طباعة الفاتورة"
                                >
                                  <Printer className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => confirmDeleteInvoice(inv.id, inv.invoice_number)}
                                  className="w-8 h-8 rounded flex items-center justify-center transition-colors"
                                  style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}
                                  title="حذف"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Right Side - Quick Export */}
            <div className="space-y-4 flex-shrink-0">
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

        {/* Invoice Details Modal */}
        {showInvoiceModal && selectedInvoice && (
          <div 
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: 'var(--overlay-bg)' }}
          >
            <div 
              className="rounded-xl p-6 w-[600px] max-w-[90%] max-h-[80vh] overflow-y-auto transition-theme"
              style={{ backgroundColor: 'var(--card-bg)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[20px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>
                  تفاصيل الفاتورة {selectedInvoice.invoice_number}
                </h3>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="w-8 h-8 rounded flex items-center justify-center transition-colors"
                  style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Invoice Info */}
              <div 
                className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-lg"
                style={{ backgroundColor: 'var(--surface-1)' }}
              >
                <div>
                  <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>رقم الفاتورة</p>
                  <p className="text-[16px] font-bold" style={{ color: 'var(--text-primary)' }}>{selectedInvoice.invoice_number}</p>
                </div>
                <div>
                  <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>التاريخ</p>
                  <p className="text-[14px]" style={{ color: 'var(--text-primary)' }}>{selectedInvoice.date} {selectedInvoice.time}</p>
                </div>
                <div>
                  <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>العميل</p>
                  <p className="text-[14px]" style={{ color: 'var(--text-primary)' }}>{selectedInvoice.customer_name || 'عميل نقدي'}</p>
                </div>
                <div>
                  <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>طريقة الدفع</p>
                  <p className="text-[14px]" style={{ color: 'var(--primary)' }}>{selectedInvoice.payment_method || 'نقدي'}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-4">
                <h4 className="text-[16px] font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>الأصناف</h4>
                {(!selectedInvoice.items || selectedInvoice.items.length === 0) ? (
                  <p className="text-[14px] p-3 rounded" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--surface-1)' }}>
                    لا توجد أصناف في هذه الفاتورة
                  </p>
                ) : (
                  <table className="w-full text-[13px]">
                    <thead style={{ backgroundColor: 'var(--surface-1)' }}>
                      <tr>
                        <th className="p-2 text-right" style={{ color: 'var(--text-muted)' }}>المنتج</th>
                        <th className="p-2 text-center" style={{ color: 'var(--text-muted)' }}>الكمية</th>
                        <th className="p-2 text-center" style={{ color: 'var(--text-muted)' }}>السعر</th>
                        <th className="p-2 text-left" style={{ color: 'var(--text-muted)' }}>الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items.map((item: any, idx: number) => (
                        <tr key={idx} className="border-b" style={{ borderColor: 'var(--surface-1)' }}>
                          <td className="p-2" style={{ color: 'var(--text-primary)' }}>{item.product_name}</td>
                          <td className="p-2 text-center" style={{ color: 'var(--text-primary)' }}>{item.qty}</td>
                          <td className="p-2 text-center" style={{ color: 'var(--text-primary)' }}>{formatCurrency(item.unit_price)}</td>
                          <td className="p-2 text-left font-bold" style={{ color: 'var(--primary)' }}>{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Totals */}
              <div 
                className="p-4 rounded-lg space-y-2"
                style={{ backgroundColor: 'var(--surface-1)' }}
              >
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>المجموع:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{formatCurrency(selectedInvoice.subtotal || 0)}</span>
                </div>
                {selectedInvoice.discount_amount > 0 && (
                  <div className="flex justify-between" style={{ color: 'var(--danger)' }}>
                    <span>الخصم:</span>
                    <span>-{formatCurrency(selectedInvoice.discount_amount)}</span>
                  </div>
                )}
                {selectedInvoice.tax_amount > 0 && (
                  <div className="flex justify-between" style={{ color: 'var(--info)' }}>
                    <span>الضريبة:</span>
                    <span>+{formatCurrency(selectedInvoice.tax_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[18px] font-bold pt-2 border-t" style={{ borderColor: 'var(--primary)' }}>
                  <span style={{ color: 'var(--text-primary)' }}>الإجمالي:</span>
                  <span style={{ color: 'var(--primary)' }}>{formatCurrency(selectedInvoice.total || selectedInvoice.total_amount || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Delete Confirmation Modal */}
        {invoiceToDelete && (
          <div 
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: 'var(--overlay-bg)' }}
          >
            <div 
              className="rounded-xl p-6 w-[400px] max-w-[90%] transition-theme"
              style={{ backgroundColor: 'var(--card-bg)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--danger-bg)' }}
                >
                  <Trash2 className="w-6 h-6" style={{ color: 'var(--danger)' }} />
                </div>
                <h3 className="text-[20px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>
                  تأكيد الحذف
                </h3>
              </div>
              
              <p className="text-[16px] mb-6 transition-theme" style={{ color: 'var(--text-secondary)' }}>
                هل أنت متأكد من حذف فاتورة <strong>{invoiceToDelete.number}</strong>؟<br/>
                <span className="text-[14px]" style={{ color: 'var(--danger)' }}>لا يمكن التراجع عن هذا الإجراء</span>
              </p>
              
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => setInvoiceToDelete(null)}
                >
                  إلغاء
                </Button>
                <Button
                  variant="danger"
                  fullWidth
                  onClick={executeDeleteInvoice}
                >
                  حذف
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
