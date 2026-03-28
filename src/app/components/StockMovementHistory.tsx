import { ArrowUpDown, ArrowDown, ArrowRightLeft, RotateCcw } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import type { StockMovement } from '../context/ShopContext';

interface StockMovementHistoryProps {
  productId?: string;
  limit?: number;
}

export default function StockMovementHistory({ productId, limit = 20 }: StockMovementHistoryProps) {
  const { stockMovements, products } = useShop();
  
  // Filter by product if specified
  const filteredMovements = productId
    ? stockMovements.filter(m => m.product_id === productId)
    : stockMovements;

  // Limit the results
  const displayedMovements = filteredMovements.slice(0, limit);

  const getMovementIcon = (type: StockMovement['movement_type']) => {
    switch (type) {
      case 'purchase':
        return <ArrowDown className="w-4 h-4 text-green-500" />;
      case 'sale':
        return <ArrowUpDown className="w-4 h-4 text-red-500" />;
      case 'return':
        return <RotateCcw className="w-4 h-4 text-amber-500" />;
      case 'adjustment':
        return <ArrowRightLeft className="w-4 h-4 text-blue-500" />;
      default:
        return <ArrowUpDown className="w-4 h-4 text-gray-500" />;
    }
  };

  const getMovementLabel = (type: StockMovement['movement_type']) => {
    switch (type) {
      case 'purchase':
        return 'شراء';
      case 'sale':
        return 'بيع';
      case 'return':
        return 'مرتجع';
      case 'adjustment':
        return 'تسوية';
      default:
        return type;
    }
  };

  const getMovementColor = (type: StockMovement['movement_type']) => {
    switch (type) {
      case 'purchase':
        return 'text-green-500';
      case 'sale':
        return 'text-red-500';
      case 'return':
        return 'text-amber-500';
      case 'adjustment':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (displayedMovements.length === 0) {
    return (
      <div className="text-center py-8 text-[#7A8CA0]">
        <ArrowUpDown className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>لا توجد حركات مخزون</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displayedMovements.map((movement) => (
        <div
          key={movement.id}
          className="flex items-center justify-between p-3 bg-[#1E2640] rounded-lg hover:bg-[#2A3550] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#2A3550] rounded-lg">
              {getMovementIcon(movement.movement_type)}
            </div>
            <div>
              <p className="text-white font-medium">{movement.product_name}</p>
              <p className="text-[#7A8CA0] text-sm">
                {movement.notes || '-'}
              </p>
            </div>
          </div>
          
          <div className="text-left">
            <p className={`font-bold ${getMovementColor(movement.movement_type)}`}>
              {movement.movement_type === 'sale' ? '-' : '+'}{movement.quantity}
            </p>
            <p className="text-[#7A8CA0] text-xs">
              {movement.old_quantity} → {movement.new_quantity}
            </p>
          </div>
          
          <div className="text-right">
            <span className={`text-sm font-medium ${getMovementColor(movement.movement_type)}`}>
              {getMovementLabel(movement.movement_type)}
            </span>
            <p className="text-[#5A6A7A] text-xs mt-1">
              {formatDate(movement.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}