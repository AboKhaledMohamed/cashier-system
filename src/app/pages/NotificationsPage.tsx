import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Header from '../components/Header';
import Button from '../components/ui/Button';
import { useShop } from '../context/ShopContext';
import { notify } from '../utils/toast';
import {
  Bell,
  Package,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Trash2,
  Eye,
  Archive,
  ArrowRight,
  Filter,
  Search
} from 'lucide-react';

export default function NotificationsPage() {
  const { 
    notifications, 
    loadNotifications, 
    markNotificationRead, 
    markAllNotificationsRead,
    unreadCount 
  } = useShop();
  const navigate = useNavigate();
  
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  
  useEffect(() => {
    loadNotifications();
  }, []);
  
  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    // Filter by read status
    if (filter === 'unread' && n.is_read) return false;
    if (filter === 'read' && !n.is_read) return false;
    
    // Filter by type
    if (selectedType !== 'all' && n.type !== selectedType) return false;
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        n.title.toLowerCase().includes(term) ||
        n.message.toLowerCase().includes(term)
      );
    }
    
    return true;
  });
  
  // Get unique notification types
  const notificationTypes = ['all', ...new Set(notifications.map(n => n.type))];
  
  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'نقص_مخزون':
        return <Package className="w-5 h-5" />;
      case 'انتهاء_صلاحية':
        return <Calendar className="w-5 h-5" />;
      case 'دين_متأخر':
        return <AlertTriangle className="w-5 h-5" />;
      case 'إغلاق_صندوق':
        return <CheckCircle className="w-5 h-5" />;
      case 'نسخة_احتياطية':
        return <Archive className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };
  
  // Get notification color based on type
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'نقص_مخزون':
        return 'var(--warning)';
      case 'انتهاء_صلاحية':
        return 'var(--danger)';
      case 'دين_متأخر':
        return 'var(--danger)';
      case 'إغلاق_صندوق':
        return 'var(--success)';
      case 'نسخة_احتياطية':
        return 'var(--info)';
      default:
        return 'var(--primary)';
    }
  };
  
  // Handle notification click
  const handleNotificationClick = async (notification: any) => {
    // Mark as read
    if (!notification.is_read) {
      await markNotificationRead(notification.id);
    }
    
    // Navigate based on ref_type
    if (notification.ref_type && notification.ref_id) {
      switch (notification.ref_type) {
        case 'product':
          navigate('/inventory');
          break;
        case 'invoice':
          navigate('/reports');
          break;
        case 'customer':
          navigate('/customers');
          break;
        case 'cash_session':
          navigate('/cash-session');
          break;
        default:
          // Stay on notifications page if no specific route
          break;
      }
    }
  };
  
  // Handle mark all as read
  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    notify.success('تم تحديد جميع الإشعارات كمقروءة');
  };
  
  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get type label
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'نقص_مخزون': 'نقص مخزون',
      'انتهاء_صلاحية': 'انتهاء صلاحية',
      'دين_متأخر': 'دين متأخر',
      'إغلاق_صندوق': 'إغلاق صندوق',
      'نسخة_احتياطية': 'نسخة احتياطية',
      'نظام': 'نظام'
    };
    return labels[type] || type;
  };
  
  return (
    <div 
      className="h-screen overflow-hidden transition-theme flex flex-col"
      style={{ backgroundColor: 'var(--page-bg)' }}
    >
      <Header title="الإشعارات" />
      
      <div className="p-6 flex-1 overflow-hidden">
        <div className="h-full flex flex-col gap-4">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 flex-shrink-0">
            <div 
              className="rounded-xl p-4 transition-theme"
              style={{ backgroundColor: 'var(--card-bg)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] transition-theme" style={{ color: 'var(--text-muted)' }}>إجمالي الإشعارات</p>
                  <p className="text-[24px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>
                    {notifications.length}
                  </p>
                </div>
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'var(--primary-light)' }}
                >
                  <Bell className="w-6 h-6" style={{ color: 'var(--primary)' }} />
                </div>
              </div>
            </div>
            
            <div 
              className="rounded-xl p-4 transition-theme"
              style={{ backgroundColor: 'var(--card-bg)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] transition-theme" style={{ color: 'var(--text-muted)' }}>غير مقروءة</p>
                  <p className="text-[24px] font-bold" style={{ color: 'var(--danger)' }}>
                    {unreadCount}
                  </p>
                </div>
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'var(--danger-bg)' }}
                >
                  <Bell className="w-6 h-6" style={{ color: 'var(--danger)' }} />
                </div>
              </div>
            </div>
            
            <div 
              className="rounded-xl p-4 transition-theme"
              style={{ backgroundColor: 'var(--card-bg)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] transition-theme" style={{ color: 'var(--text-muted)' }}>مقروءة</p>
                  <p className="text-[24px] font-bold transition-theme" style={{ color: 'var(--success)' }}>
                    {notifications.filter(n => n.is_read).length}
                  </p>
                </div>
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'var(--success-bg)' }}
                >
                  <CheckCircle className="w-6 h-6" style={{ color: 'var(--success)' }} />
                </div>
              </div>
            </div>
            
            <div 
              className="rounded-xl p-4 transition-theme cursor-pointer hover:opacity-80"
              style={{ backgroundColor: 'var(--info-bg)' }}
              onClick={handleMarkAllRead}
            >
              <div className="flex items-center justify-between h-full">
                <div>
                  <p className="text-[13px] font-medium" style={{ color: 'var(--info)' }}>تحديد الكل كمقروء</p>
                  <p className="text-[12px]" style={{ color: 'var(--info)' }}>مسح جميع الإشعارات من العداد</p>
                </div>
                <CheckCircle className="w-6 h-6" style={{ color: 'var(--info)' }} />
              </div>
            </div>
          </div>
          
          {/* Filters */}
          <div 
            className="flex items-center gap-4 p-4 rounded-xl transition-theme flex-shrink-0"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              <span className="text-[14px]" style={{ color: 'var(--text-muted)' }}>تصفية:</span>
            </div>
            
            {/* Filter tabs */}
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'unread', label: 'غير مقروء' },
                { id: 'read', label: 'مقروء' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as any)}
                  className="px-4 py-2 rounded-lg text-[14px] transition-all"
                  style={{
                    backgroundColor: filter === f.id ? 'var(--primary)' : 'var(--surface-2)',
                    color: filter === f.id ? 'var(--text-on-primary)' : 'var(--text-muted)'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
            
            <div className="w-px h-8" style={{ backgroundColor: 'var(--border-color)' }} />
            
            {/* Type filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-[40px] rounded-lg px-3 text-[14px] outline-none cursor-pointer transition-theme"
              style={{
                backgroundColor: 'var(--surface-2)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)'
              }}
            >
              <option value="all">جميع الأنواع</option>
              {notificationTypes.filter(t => t !== 'all').map(type => (
                <option key={type} value={type}>{getTypeLabel(type)}</option>
              ))}
            </select>
            
            <div className="flex-1" />
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="البحث في الإشعارات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-[40px] w-[250px] rounded-lg pr-10 pl-4 text-[14px] outline-none transition-theme"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)'
                }}
              />
            </div>
          </div>
          
          {/* Notifications List */}
          <div 
            className="flex-1 rounded-xl overflow-hidden transition-theme flex flex-col"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
              <h3 className="text-[18px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                قائمة الإشعارات
              </h3>
              <span className="text-[14px]" style={{ color: 'var(--text-muted)' }}>
                {filteredNotifications.length} إشعار
              </span>
            </div>
            
            <div className="overflow-y-auto flex-1 p-4">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <Bell className="w-16 h-16 mb-4" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-[16px]" style={{ color: 'var(--text-muted)' }}>
                    لا توجد إشعارات
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 rounded-xl cursor-pointer transition-all hover:opacity-90 ${
                        !notification.is_read ? 'border-r-4' : ''
                      }`}
                      style={{
                        backgroundColor: !notification.is_read ? 'var(--surface-2)' : 'var(--surface-1)',
                        borderRightColor: getNotificationColor(notification.type)
                      }}
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ 
                            backgroundColor: `${getNotificationColor(notification.type)}20`,
                            color: getNotificationColor(notification.type)
                          }}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 
                                className={`text-[16px] mb-1 ${!notification.is_read ? 'font-semibold' : ''}`}
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {notification.title}
                              </h4>
                              <p className="text-[14px] mb-2" style={{ color: 'var(--text-secondary)' }}>
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-3">
                                <span 
                                  className="text-[12px] px-2 py-1 rounded-lg"
                                  style={{ 
                                    backgroundColor: `${getNotificationColor(notification.type)}20`,
                                    color: getNotificationColor(notification.type)
                                  }}
                                >
                                  {getTypeLabel(notification.type)}
                                </span>
                                <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                                  {formatDate(notification.created_at)}
                                </span>
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {!notification.is_read && (
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: 'var(--primary)' }}
                                />
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNotificationClick(notification);
                                }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                                style={{ 
                                  backgroundColor: 'var(--surface-3)',
                                  color: 'var(--primary)'
                                }}
                                title="عرض التفاصيل"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {notification.ref_type && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNotificationClick(notification);
                                  }}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                                  style={{ 
                                    backgroundColor: 'var(--surface-3)',
                                    color: 'var(--success)'
                                  }}
                                  title="الانتقال"
                                >
                                  <ArrowRight className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
