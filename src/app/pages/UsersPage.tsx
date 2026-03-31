import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { notify, messages } from '../utils/toast';
import { Plus, Edit, UserCog, X } from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';
import type { User } from '../types/small-shop.types';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const api = (window as any).electronAPI;
  const { canManageUsers, isAdmin } = usePermissions();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState<Partial<User> & { password?: string }>({
    username: '',
    full_name: '',
    role: 'cashier',
    is_active: true,
  });
  
  const getRoleColor = (role: string) => {
    if (role === 'admin') return { color: 'var(--danger)', bg: 'var(--danger-bg)' };
    if (role === 'manager') return { color: 'var(--info)', bg: 'var(--info-bg)' };
    return { color: 'var(--primary)', bg: 'var(--primary-light)' };
  };
  
  const loadUsers = async () => {
    try {
      const data = await api.users.getAll();
      setUsers(data);
    } catch(e: any) { notify.error(e.message); }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSave = async () => {
    if (!formData.username || !formData.full_name) {
      notify.error('اسم المستخدم والاسم الكامل إلزاميان');
      return;
    }
    
    try {
      if (editingUser) {
        await api.users.update(editingUser.id, formData);
        notify.success('تم تحديث المستخدم بنجاح');
      } else {
        await api.users.create({
          full_name: formData.full_name,
          username: formData.username,
          password: formData.password || '123456', // default password
          role: formData.role,
          is_active: formData.is_active,
        });
        notify.success('تم إضافة المستخدم بنجاح');
      }
      await loadUsers();
      closeDialog();
    } catch(e: any) { notify.error(e.message); }
  };
  
  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData(user);
    setShowAddDialog(true);
  };
  
  const closeDialog = () => {
    setShowAddDialog(false);
    setEditingUser(null);
    setFormData({
      username: '',
      full_name: '',
      role: 'cashier',
      is_active: true,
    });
  };
  
  const toggleUserStatus = async (userId: string) => {
    try {
      await api.users.toggleActive(userId);
      await loadUsers();
    } catch(e: any) { notify.error(e.message); }
  };
  
  return (
    <div 
      className="min-h-screen transition-theme"
      style={{ backgroundColor: 'var(--page-bg)' }}
    >
      <Header title="إدارة المستخدمين" />
      
      <div className="p-7 space-y-6">
        {/* Top Bar */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <UserCog className="w-8 h-8" style={{ color: 'var(--primary)' }} />
            <div>
              <h2 
                className="text-[21px] font-bold transition-theme"
                style={{ color: 'var(--text-primary)' }}
              >
                إدارة المستخدمين والصلاحيات
              </h2>
              <p 
                className="text-[14px] transition-theme"
                style={{ color: 'var(--text-muted)' }}
              >
                إجمالي المستخدمين: {users.length}
              </p>
            </div>
          </div>
          
          <Button
            variant="info"
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2"
            disabled={!canManageUsers}
          >
            <Plus className="w-5 h-5" />
            إضافة مستخدم
          </Button>
        </div>
        
        {/* Users Table */}
        <div 
          className="rounded-lg overflow-hidden transition-theme overflow-x-auto"
          style={{ backgroundColor: 'var(--card-bg)' }}
        >
          <div 
            className="grid grid-cols-12 gap-4 p-4 text-[14px] font-medium transition-theme"
            style={{ 
              backgroundColor: 'var(--surface-1)',
              color: 'var(--text-muted)'
            }}
          >
            <div className="col-span-3">الاسم الكامل</div>
            <div className="col-span-2">اسم المستخدم</div>
            <div className="col-span-2 text-center">الدور</div>
            <div className="col-span-2 text-center">الحالة</div>
            <div className="col-span-2">آخر دخول</div>
            <div className="col-span-1 text-center">إدارة</div>
          </div>
          
          <div 
            className="divide-y transition-theme"
            style={{ borderColor: 'var(--surface-1)' }}
          >
            {users.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-12 gap-4 p-4 items-center transition-all"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div className="col-span-3">
                  <p className="text-[14px] font-medium transition-theme" style={{ color: 'var(--text-primary)' }}>
                    {user.full_name}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-[13px] font-mono transition-theme" style={{ color: 'var(--text-muted)' }}>
                    {user.username}
                  </p>
                </div>
                <div className="col-span-2 text-center">
                  <span
                    className="px-3 py-1 rounded-full text-[12px] font-bold"
                    style={{
                      color: user.role === 'admin' ? 'var(--danger)' : user.role === 'manager' ? 'var(--info)' : 'var(--primary)',
                      backgroundColor: user.role === 'admin' ? 'var(--danger-bg)' : user.role === 'manager' ? 'var(--info-bg)' : 'var(--primary-light)'
                    }}
                  >
                    {user.role === 'admin' ? 'مدير نظام' : user.role === 'manager' ? 'مدير' : 'كاشير'}
                  </span>
                </div>
                <div className="col-span-2 text-center">
                  <button
                    onClick={() => canManageUsers && toggleUserStatus(user.id)}
                    disabled={!canManageUsers || user.id === 'user-admin-001'}
                    className="px-3 py-1 rounded-full text-[12px] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      color: user.is_active ? 'var(--primary)' : 'var(--danger)',
                      backgroundColor: user.is_active ? 'var(--primary-light)' : 'var(--danger-bg)'
                    }}
                  >
                    {user.is_active ? 'نشط' : 'متوقف'}
                  </button>
                </div>
                <div className="col-span-2">
                  <p className="text-[13px] transition-theme" style={{ color: 'var(--text-muted)' }}>
                    {user.last_login_at || 'لم يسجل دخول بعد'}
                  </p>
                </div>
                <div className="col-span-1 text-center">
                  <button
                    onClick={() => canManageUsers && openEditDialog(user)}
                    disabled={!canManageUsers}
                    className="w-8 h-8 rounded flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: canManageUsers ? 'var(--info-bg)' : 'var(--surface-2)', 
                      color: canManageUsers ? 'var(--info)' : 'var(--text-muted)' 
                    }}
                    onMouseEnter={(e) => {
                      if (canManageUsers) {
                        e.currentTarget.style.backgroundColor = 'var(--info)';
                        e.currentTarget.style.color = 'white';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (canManageUsers) {
                        e.currentTarget.style.backgroundColor = 'var(--info-bg)';
                        e.currentTarget.style.color = 'var(--info)';
                      }
                    }}
                  >
                    <Edit className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Add/Edit Dialog */}
      {showAddDialog && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'var(--overlay-bg)' }}
        >
          <div 
            className="w-full max-w-[600px] rounded-lg overflow-hidden transition-theme"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div 
              className="p-4 flex items-center justify-between"
              style={{ backgroundColor: 'var(--info)' }}
            >
              <h3 className="text-[21px] font-bold" style={{ color: 'white' }}>
                {editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
              </h3>
              <button
                onClick={closeDialog}
                className="w-8 h-8 bg-white/20 rounded hover:bg-white/30 flex items-center justify-center"
              >
                <X className="w-5 h-5" style={{ color: 'white' }} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <Input
                label="اسم المستخدم *"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="username"
                disabled={!!editingUser}
              />
              <Input
                label="الاسم الكامل *"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                placeholder="أدخل الاسم الكامل"
              />
              
              {!editingUser && (
                <Input
                  label="كلمة المرور *"
                  type="password"
                  value={formData.password || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="أدخل كلمة المرور"
                />
              )}
              
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-medium transition-theme" style={{ color: 'var(--text-muted)' }}>
                  الدور *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as any })
                  }
                  className="h-[42px] rounded-lg px-3 outline-none transition-theme"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <option value="admin">Admin - مدير النظام</option>
                  <option value="manager">Manager - مدير</option>
                  <option value="cashier">Cashier - كاشير</option>
                </select>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-medium transition-theme" style={{ color: 'var(--text-muted)' }}>
                  الحالة
                </label>
                <select
                  value={formData.is_active ? 'true' : 'false'}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.value === 'true' })
                  }
                  className="h-[42px] rounded-lg px-3 outline-none transition-theme"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <option value="true">نشط</option>
                  <option value="false">متوقف</option>
                </select>
              </div>
              
              <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>* الحقول الإلزامية</p>
            </div>
            
            <div 
              className="p-4 flex gap-3 transition-theme"
              style={{ backgroundColor: 'var(--surface-1)' }}
            >
              <Button variant="ghost" onClick={closeDialog} fullWidth>
                إلغاء
              </Button>
              <Button variant="success" onClick={handleSave} fullWidth>
                {editingUser ? 'حفظ التعديلات' : 'إضافة المستخدم'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
