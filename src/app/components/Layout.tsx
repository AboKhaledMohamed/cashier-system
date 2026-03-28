import { Outlet } from 'react-router';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div 
      className="min-h-screen transition-theme"
      style={{ backgroundColor: 'var(--page-bg)' }}
    >
      <Sidebar />
      <main className="mr-[220px]">
        <Outlet />
      </main>
    </div>
  );
}
