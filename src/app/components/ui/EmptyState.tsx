import { PackageX, Search, FileX, Inbox } from 'lucide-react';

interface EmptyStateProps {
  type?: 'products' | 'search' | 'invoices' | 'generic';
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

const icons = {
  products: PackageX,
  search: Search,
  invoices: FileX,
  generic: Inbox,
};

const defaultTitles = {
  products: 'لا توجد منتجات',
  search: 'لا توجد نتائج',
  invoices: 'لا توجد فواتير',
  generic: 'لا توجد بيانات',
};

const defaultDescriptions = {
  products: 'جرّب تغيير الفلاتر أو أضف منتج جديد',
  search: 'جرّب البحث بكلمات مختلفة',
  invoices: 'لا توجد فواتير مسجلة بعد',
  generic: 'لم يتم العثور على أي بيانات',
};

export function EmptyState({
  type = 'generic',
  title,
  description,
  action,
}: EmptyStateProps) {
  const Icon = icons[type];
  const defaultTitle = defaultTitles[type];
  const defaultDesc = defaultDescriptions[type];

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div 
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-theme"
        style={{ backgroundColor: 'var(--surface-1)' }}
      >
        <Icon className="w-8 h-8 transition-theme" style={{ color: 'var(--text-muted)' }} />
      </div>
      <h3 className="text-[18px] font-bold mb-2 transition-theme" style={{ color: 'var(--text-primary)' }}>
        {title || defaultTitle}
      </h3>
      <p className="text-[14px] mb-4 transition-theme" style={{ color: 'var(--text-muted)' }}>
        {description || defaultDesc}
      </p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
