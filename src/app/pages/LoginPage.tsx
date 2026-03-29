import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ShoppingCart, Eye, EyeOff, CheckCircle, Loader2, Lock, AlertTriangle } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useShop } from '../context/ShopContext';
import { notify } from '../utils/toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useShop();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Password change dialog state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const api = (window as any).electronAPI;
      if (!api) {
        throw new Error('API not available');
      }
      
      const user = await api.auth.login(username.trim(), password);
      
      // Check if password change is required
      if (user.must_change_password === 1) {
        setLoggedInUser(user);
        setShowPasswordChange(true);
        setLoading(false);
        return;
      }
      
      // Normal login flow - pass username and password
      await login(username, password);
      notify.success('تم تسجيل الدخول بنجاح');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول');
      notify.error(err.message || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setPasswordError('');
    
    // Validation
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('كلمات المرور غير متطابقة');
      return;
    }
    
    if (newPassword === 'admin123') {
      setPasswordError('يجب اختيار كلمة مرور مختلفة عن الافتراضية');
      return;
    }
    
    setChangingPassword(true);
    
    try {
      const api = (window as any).electronAPI;
      await api.auth.forcePasswordChange(loggedInUser.id, newPassword);
      
      // Login with new password
      await login(loggedInUser.username, newPassword);
      
      notify.success('تم تغيير كلمة المرور بنجاح');
      setShowPasswordChange(false);
      navigate('/dashboard');
    } catch (err: any) {
      setPasswordError(err.message || 'فشل تغيير كلمة المرور');
      notify.error(err.message || 'فشل تغيير كلمة المرور');
    } finally {
      setChangingPassword(false);
    }
  };
  
  const features = [
    'إدارة متكاملة لنقاط البيع',
    'تتبع المخزون والمبيعات',
    'إدارة العملاء والديون',
    'تقارير شاملة ومفصلة',
    'واجهة سهلة وسريعة',
  ];
  
  // Password Change Dialog
  if (showPasswordChange) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center transition-theme" 
        style={{ backgroundColor: 'var(--page-bg)' }}
        dir="rtl"
      >
        <div className="w-full max-w-[480px]">
          <div 
            className="rounded-[10px] overflow-hidden shadow-2xl transition-theme"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div className="h-[5px]" style={{ backgroundColor: 'var(--warning)' }}></div>
            
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--warning-bg)' }}
                >
                  <AlertTriangle className="w-6 h-6" style={{ color: 'var(--warning)' }} />
                </div>
                <div>
                  <h2 
                    className="text-[24px] font-bold transition-theme"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    تغيير كلمة المرور
                  </h2>
                  <p style={{ color: 'var(--warning)' }}>
                    مطلوب قبل استخدام النظام
                  </p>
                </div>
              </div>
              
              <div 
                className="rounded-lg p-4 mb-6 border transition-theme"
                style={{ 
                  backgroundColor: 'var(--warning-bg)',
                  borderColor: 'var(--warning)'
                }}
              >
                <p className="text-[14px] transition-theme" style={{ color: 'var(--text-muted)' }}>
                  هذه أول مرة تسجل دخول. يجب تغيير كلمة المرور الافتراضية لحسابك لأسباب أمنية.
                </p>
              </div>
              
              <form onSubmit={handlePasswordChange} className="space-y-5">
                <div className="relative">
                  <Input
                    label="كلمة المرور الجديدة *"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="أدخل كلمة المرور الجديدة (6 أحرف على الأقل)"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordError('');
                    }}
                    inputSize="large"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute left-3 top-[38px] transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                <div className="relative">
                  <Input
                    label="تأكيد كلمة المرور *"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="أعد إدخال كلمة المرور الجديدة"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordError('');
                    }}
                    inputSize="large"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-[38px] transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {passwordError && (
                  <div 
                    className="rounded-lg p-3 border transition-theme"
                    style={{ 
                      backgroundColor: 'var(--danger-bg)',
                      borderColor: 'var(--danger)'
                    }}
                  >
                    <p className="text-[14px] text-center" style={{ color: 'var(--danger)' }}>{passwordError}</p>
                  </div>
                )}
                
                <Button
                  type="submit"
                  variant="warning"
                  size="large"
                  fullWidth
                  className="mt-6"
                  disabled={changingPassword}
                >
                  {changingPassword ? (
                    <span className="flex items-center gap-2 justify-center">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري الحفظ...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 justify-center">
                      <Lock className="w-5 h-5" />
                      حفظ كلمة المرور
                    </span>
                  )}
                </Button>
              </form>
              
              <p className="text-[12px] text-center mt-4 transition-theme" style={{ color: 'var(--text-muted)' }}>
                لا يمكن تخطي هذه الخطوة لأسباب أمنية
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Right Side - Brand */}
      <div className="w-[42%] bg-[#12131A] flex flex-col items-center justify-center p-12 relative">
        <div className="mb-8">
          <div className="w-24 h-24 bg-[#2ECC71] rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <ShoppingCart className="w-14 h-14 text-white" />
          </div>
          <h1 className="text-[32px] font-bold text-white text-center mb-2">
            الكاشير الذكي
          </h1>
          <p className="text-[18px] text-[#7A8CA0] text-center">
            Smart POS System
          </p>
        </div>
        
        <div className="mt-8 w-full max-w-md">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-5 h-5 text-[#2ECC71] flex-shrink-0" />
              <p className="text-[16px] text-[#C0CDE0]">{feature}</p>
            </div>
          ))}
        </div>
        
        <div className="absolute bottom-8">
          <p className="text-[14px] text-[#7A8CA0]">الإصدار 1.0</p>
        </div>
      </div>
      
      {/* Left Side - Login Form */}
      <div 
        className="w-[58%] flex items-center justify-center transition-theme"
        style={{ backgroundColor: 'var(--page-bg)' }}
      >
        <div className="w-full max-w-[420px]">
          <div 
            className="rounded-[10px] overflow-hidden shadow-2xl transition-theme"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div className="h-[5px]" style={{ backgroundColor: 'var(--primary)' }}></div>
            
            <div className="p-8">
              <h2 
                className="text-[26px] font-bold mb-2 text-center transition-theme"
                style={{ color: 'var(--text-primary)' }}
              >
                تسجيل الدخول
              </h2>
              <p 
                className="text-[14px] mb-8 text-center transition-theme"
                style={{ color: 'var(--text-muted)' }}
              >
                مرحباً بك! قم بتسجيل الدخول للمتابعة
              </p>
              
              <form onSubmit={handleLogin} className="space-y-5">
                <Input
                  label="اسم المستخدم"
                  type="text"
                  placeholder="أدخل اسم المستخدم"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  inputSize="large"
                />
                
                <div className="relative">
                  <Input
                    label="كلمة المرور"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="أدخل كلمة المرور"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    inputSize="large"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-[38px] transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                
                {error && (
                  <div 
                    className="rounded-lg p-3 border transition-theme"
                    style={{ 
                      backgroundColor: 'var(--danger-bg)',
                      borderColor: 'var(--danger)'
                    }}
                  >
                    <p className="text-[14px] text-center" style={{ color: 'var(--danger)' }}>{error}</p>
                  </div>
                )}
                
                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  fullWidth
                  className="mt-6"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري تسجيل الدخول...
                    </span>
                  ) : (
                    'تسجيل الدخول'
                  )}
                </Button>
              </form>
              
              <div 
                className="mt-6 p-4 rounded-lg border transition-theme"
                style={{ 
                  backgroundColor: 'var(--surface-1)',
                  borderColor: 'var(--primary)'
                }}
              >
                <p className="text-[12px] text-center mb-2 transition-theme" style={{ color: 'var(--text-muted)' }}>
                  بيانات الدخول:
                </p>
                <p className="text-[13px] text-center transition-theme" style={{ color: 'var(--text-primary)' }}>
                  المستخدم: <span className="font-bold" style={{ color: 'var(--primary)' }}>admin</span> | 
                  كلمة المرور: <span className="font-bold" style={{ color: 'var(--primary)' }}>admin123</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}