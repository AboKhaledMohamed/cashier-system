import { useEffect, useState } from 'react';
import { LogOut, Clock } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useShop } from '../context/ShopContext';
import NotificationBell from './NotificationBell';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const navigate = useNavigate();
  const { currentUser } = useShop();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const handleLogout = () => {
    navigate('/login');
  };
  
  return (
    <header 
      className="h-[64px] border-b flex items-center justify-between px-7 transition-theme"
      style={{ 
        backgroundColor: 'var(--page-bg)',
        borderColor: 'var(--border-color)'
      }}
    >
      {/* Title */}
      <h1 
        className="text-[26px] font-bold transition-theme"
        style={{ color: 'var(--text-primary)' }}
      >
        {title}
      </h1>
      
      {/* Right Side */}
      <div className="flex items-center gap-4">
        <NotificationBell />
        {/* Time & Date */}
        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              <p 
                className="text-[18px] font-bold transition-theme"
                style={{ color: 'var(--text-primary)' }}
              >
                {formatTime(currentTime)}
              </p>
            </div>
            <p 
              className="text-[12px] transition-theme"
              style={{ color: 'var(--text-muted)' }}
            >
              {formatDate(currentTime)}
            </p>
          </div>
        </div>
        
        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p 
              className="text-[14px] font-bold transition-theme"
              style={{ color: 'var(--text-primary)' }}
            >
              {currentUser?.full_name || 'مستخدم'}
            </p>
            <p 
              className="text-[12px] transition-theme"
              style={{ color: 'var(--text-muted)' }}
            >
              {currentUser?.role === 'admin' ? 'مدير النظام' : 
               currentUser?.role === 'manager' ? 'مدير' : 
               currentUser?.role === 'cashier' ? 'كاشير' : 'مستخدم'}
            </p>
          </div>
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center transition-theme"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <span className="font-bold" style={{ color: 'var(--text-on-primary)' }}>
              {(currentUser?.full_name?.[0] || 'م')}
            </span>
          </div>
        </div>
        
        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:opacity-90"
          style={{ 
            backgroundColor: 'var(--surface-2)',
            color: 'var(--danger)'
          }}
        >
          <LogOut className="w-4 h-4" />
          <span className="text-[14px] font-medium">تسجيل خروج</span>
        </button>
      </div>
    </header>
  );
}
