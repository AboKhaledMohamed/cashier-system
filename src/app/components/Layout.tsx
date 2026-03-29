import { Outlet } from 'react-router';
import Sidebar from './Sidebar';
import { useState, useEffect } from 'react';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div 
      className="min-h-screen transition-theme"
      style={{ backgroundColor: 'var(--page-bg)' }}
    >
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <main 
        className={`
          flex-1 min-h-screen transition-all duration-300
          ${isSidebarOpen ? 'lg:mr-[220px] md:mr-[200px]' : 'mr-0'}
          ${isMobile ? 'mr-0' : ''}
        `}
      >
        <Outlet />
      </main>
    </div>
  );
}
