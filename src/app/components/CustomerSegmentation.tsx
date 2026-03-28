import { useMemo } from 'react';
import { Users, Star, TrendingUp, AlertTriangle, Crown } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function CustomerSegmentation() {
  const { customers, invoices } = useShop();

  // Calculate customer segments based on purchase history
  const customerSegments = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const segments = {
      vip: [] as typeof customers,
      regular: [] as typeof customers,
      atRisk: [] as typeof customers,
      new: [] as typeof customers,
    };

    customers.forEach(customer => {
      // Get customer's invoices from last 30 days
      const customerInvoices = invoices.filter(inv => 
        inv.customer_id === customer.id && 
        new Date(inv.created_at) >= thirtyDaysAgo
      );

      const totalPurchases = customerInvoices.reduce((sum, inv) => sum + inv.total, 0);
      const purchaseCount = customerInvoices.length;

      // Check if customer is new (first purchase in last 30 days)
      const firstPurchase = invoices.find(inv => 
        inv.customer_id === customer.id && 
        new Date(inv.created_at) >= thirtyDaysAgo
      );

      if (totalPurchases >= 5000 || purchaseCount >= 5) {
        segments.vip.push(customer);
      } else if (totalPurchases >= 1000 || purchaseCount >= 2) {
        // Check if at risk (no purchases in last 30 days but had purchases 30-60 days ago)
        const olderInvoices = invoices.filter(inv =>
          inv.customer_id === customer.id &&
          new Date(inv.created_at) >= sixtyDaysAgo &&
          new Date(inv.created_at) < thirtyDaysAgo
        );
        
        if (olderInvoices.length > 0) {
          segments.atRisk.push(customer);
        } else {
          segments.regular.push(customer);
        }
      } else if (!firstPurchase && invoices.some(inv => inv.customer_id === customer.id)) {
        // Has purchases but none in last 30 days
        segments.atRisk.push(customer);
      } else if (!firstPurchase) {
        segments.new.push(customer);
      } else {
        segments.regular.push(customer);
      }
    });

    return segments;
  }, [customers, invoices]);

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'vip':
        return 'text-amber-400';
      case 'regular':
        return 'text-blue-400';
      case 'atRisk':
        return 'text-red-400';
      case 'new':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const getSegmentBg = (segment: string) => {
    switch (segment) {
      case 'vip':
        return 'bg-amber-500/10 border-amber-500/30';
      case 'regular':
        return 'bg-blue-500/10 border-blue-500/30';
      case 'atRisk':
        return 'bg-red-500/10 border-red-500/30';
      case 'new':
        return 'bg-green-500/10 border-green-500/30';
      default:
        return 'bg-gray-500/10 border-gray-500/30';
    }
  };

  const SegmentCard = ({ 
    title, 
    count, 
    icon: Icon, 
    segment 
  }: { 
    title: string; 
    count: number; 
    icon: React.ElementType; 
    segment: string;
  }) => (
    <div className={`p-4 rounded-lg border ${getSegmentBg(segment)}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#7A8CA0] text-sm">{title}</p>
          <p className={`text-2xl font-bold ${getSegmentColor(segment)}`}>{count}</p>
        </div>
        <Icon className={`w-8 h-8 ${getSegmentColor(segment)}`} />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-white font-bold text-lg">تصنيف العملاء</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SegmentCard 
          title="عملاء VIP" 
          count={customerSegments.vip.length} 
          icon={Crown}
          segment="vip"
        />
        <SegmentCard 
          title="عملاء منتظمون" 
          count={customerSegments.regular.length} 
          icon={Users}
          segment="regular"
        />
        <SegmentCard 
          title="عملاء معرضون للخطر" 
          count={customerSegments.atRisk.length} 
          icon={AlertTriangle}
          segment="atRisk"
        />
        <SegmentCard 
          title="عملاء جدد" 
          count={customerSegments.new.length} 
          icon={TrendingUp}
          segment="new"
        />
      </div>

      {/* High Value Customers */}
      {customerSegments.vip.length > 0 && (
        <div className="mt-6">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400" />
            أهم العملاء
          </h4>
          <div className="space-y-2">
            {customerSegments.vip.slice(0, 5).map(customer => (
              <div 
                key={customer.id}
                className="flex items-center justify-between p-3 bg-[#1E2640] rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                    <span className="text-amber-400 font-bold">
                      {customer.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{customer.name}</p>
                    <p className="text-[#7A8CA0] text-sm">{customer.phone || 'لا يوجد رقم'}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-amber-400 font-bold">
                    {customer.credit_used.toFixed(2)} ج.م
                  </p>
                  <p className="text-[#5A6A7A] text-xs">رصيد مستحق</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}