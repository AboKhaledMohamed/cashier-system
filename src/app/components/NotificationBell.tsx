import { useState, useRef, useEffect } from 'react';
import { Bell, AlertTriangle, AlertCircle, CheckCircle, Info, Eye, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useShop } from '../context/ShopContext';
import type { ShopNotification } from '../context/ShopContext';

export default function NotificationBell() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useShop();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: ShopNotification['type']) => {
    switch (type) {
      case 'warning':
      case 'نقص_مخزون':
      case 'انتهاء_صلاحية':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'error':
      case 'دين_متأخر':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'success':
      case 'إغلاق_صندوق':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTypeColor = (type: ShopNotification['type']) => {
    switch (type) {
      case 'warning':
      case 'نقص_مخزون':
      case 'انتهاء_صلاحية':
        return 'bg-amber-500/10 border-amber-500/30';
      case 'error':
      case 'دين_متأخر':
        return 'bg-red-500/10 border-red-500/30';
      case 'success':
      case 'إغلاق_صندوق':
        return 'bg-green-500/10 border-green-500/30';
      default:
        return 'bg-blue-500/10 border-blue-500/30';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return date.toLocaleDateString('ar-EG');
  };

  const handleNotificationClick = async (notification: ShopNotification) => {
    // Mark as read
    if (!notification.is_read) {
      await markNotificationRead(notification.id);
    }
    
    // Close dropdown
    setIsOpen(false);
    
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
          // If no specific page, go to notifications page
          navigate('/notifications');
          break;
      }
    } else {
      // Navigate to notifications page
      navigate('/notifications');
    }
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate('/notifications');
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    // Keep dropdown open so user can still see notifications
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg transition-all transition-theme"
        style={{
          backgroundColor: 'var(--surface-2)',
          color: 'var(--text-muted)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--surface-3)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--surface-2)';
          e.currentTarget.style.color = 'var(--text-muted)';
        }}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 w-5 h-5 text-xs font-bold rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--danger)', color: 'white' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          className="absolute left-0 top-12 w-80 rounded-lg shadow-xl z-50 overflow-hidden transition-theme"
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)'
          }}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between px-4 py-3 border-b transition-theme"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <h3 className="font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>الإشعارات</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs px-2 py-1 rounded transition-colors"
                  style={{ 
                    color: 'var(--text-muted)',
                    backgroundColor: 'var(--surface-2)'
                  }}
                >
                  مسح الكل
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center transition-theme" style={{ color: 'var(--text-muted)' }}>
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>لا توجد إشعارات</p>
              </div>
            ) : (
              notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-3 cursor-pointer transition-colors ${
                    !notification.is_read ? '' : ''
                  } ${getTypeColor(notification.type)} border-r-4`}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    backgroundColor: !notification.is_read ? 'var(--surface-1)' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = !notification.is_read ? 'var(--surface-1)' : 'transparent';
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm transition-theme" style={{ color: 'var(--text-primary)' }}>{notification.title}</p>
                      <p className="text-xs mt-1 line-clamp-2 transition-theme" style={{ color: 'var(--text-muted)' }}>{notification.message}</p>
                      <p className="text-xs mt-2 transition-theme" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>{formatTime(notification.created_at)}</p>
                    </div>
                    {!notification.is_read && (
                      <div 
                        className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                        style={{ backgroundColor: 'var(--info)' }}
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Footer - View All */}
          {notifications.length > 0 && (
            <div 
              className="px-4 py-3 border-t transition-theme cursor-pointer"
              style={{ 
                borderColor: 'var(--border-color)',
                backgroundColor: 'var(--surface-1)'
              }}
              onClick={handleViewAll}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-1)';
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
                  عرض جميع الإشعارات
                </span>
                <ArrowLeft className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}