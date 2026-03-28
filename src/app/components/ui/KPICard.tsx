import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}

export default function KPICard({
  title,
  value,
  change,
  icon: Icon,
  iconColor,
  iconBg,
}: KPICardProps) {
  const isPositive = change !== undefined && change >= 0;
  
  return (
    <div 
      className="rounded-[10px] p-5 flex items-start gap-4 transition-all"
      style={{ backgroundColor: 'var(--card-bg)' }}
    >
      {/* Icon */}
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0`}
        style={{ backgroundColor: iconBg }}
      >
        <Icon className="w-6 h-6" style={{ color: iconColor }} />
      </div>
      
      {/* Content */}
      <div className="flex-1">
        <p className="text-[14px] mb-1 transition-theme" style={{ color: 'var(--text-muted)' }}>{title}</p>
        <h3 className="text-[26px] font-bold mb-1 transition-theme" style={{ color: 'var(--text-primary)' }}>{value}</h3>
        {change !== undefined && (
          <div className="flex items-center gap-1">
            <span
              className="text-[12px] font-medium"
              style={{ color: isPositive ? 'var(--primary)' : 'var(--danger)' }}
            >
              {isPositive ? '↑' : '↓'} {Math.abs(change)}%
            </span>
            <span className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>عن الأمس</span>
          </div>
        )}
      </div>
    </div>
  );
}
