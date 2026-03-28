import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { notify, messages } from '../utils/toast';
import { useShop } from '../context/ShopContext';
import {
  Store,
  Printer,
  Database,
  Palette,
  Receipt,
  Save,
  Upload,
  Trash2,
  Building2,
  CreditCard,
  Cloud,
  Settings,
  X,
  Folder,
  Moon,
  Sun,
} from 'lucide-react';

type SettingsTab = 'general' | 'company' | 'billing' | 'backup' | 'system';

export default function SettingsPage() {
  const { settings, loadSettings, updateSettings, currentUser, isDarkMode, toggleTheme } = useShop();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [storeName, setStoreName] = useState('الكاشير الذكي');
  const [storeAddress, setStoreAddress] = useState('شارع الجمهورية، المنصورة');
  const [storePhone, setStorePhone] = useState('0123456789');
  const [taxRate, setTaxRate] = useState(14);
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxName, setTaxName] = useState('ضريبة القيمة المضافة');
  const [taxInclusive, setTaxInclusive] = useState(false);
  const [currency, setCurrency] = useState('EGP');
  const [backupSchedule, setBackupSchedule] = useState('daily');
  const [backupLocation, setBackupLocation] = useState('C:\\SmartPOS\\Backups');
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    loadSettings();
  }, []);
  
  useEffect(() => {
    if (settings) {
      setStoreName(settings.shop_name || 'الكاشير الذكي');
      setStoreAddress(settings.address || 'شارع الجمهورية، المنصورة');
      setStorePhone(settings.phone || '0123456789');
      setTaxEnabled(Boolean(settings.tax_enabled));
      setTaxRate(settings.tax_rate || 14);
      setTaxName(settings.tax_name || 'ضريبة القيمة المضافة');
      setTaxInclusive(Boolean(settings.tax_inclusive));
      setCurrency(settings.currency || 'EGP');
      setBackupSchedule(settings.backup_auto ? 'daily' : 'manual');
      setBackupLocation(settings.backup_path || 'C:\\SmartPOS\\Backups');
    }
  }, [settings]);
  
  const handleChange = (setter: (val: any) => void) => (value: any) => {
    setter(value);
    setHasChanges(true);
  };
  
  const saveSettings = async () => {
    setIsLoading(true);
    try {
      await updateSettings({
        shop_name: storeName,
        address: storeAddress,
        phone: storePhone,
        tax_enabled: taxEnabled ? 1 : 0,
        tax_rate: taxRate,
        tax_name: taxName,
        tax_inclusive: taxInclusive ? 1 : 0,
        currency: currency,
        backup_auto: backupSchedule === 'daily' ? 1 : 0,
        backup_path: backupLocation,
      });
      setHasChanges(false);
      notify.success(messages.saved('الإعدادات'));
    } catch (err: any) {
      notify.error(err.message || 'فشل في حفظ الإعدادات');
    } finally {
      setIsLoading(false);
    }
  };
  
  const cancelChanges = () => {
    if (settings) {
      setStoreName(settings.shop_name || 'الكاشير الذكي');
      setStoreAddress(settings.address || 'شارع الجمهورية، المنصورة');
      setStorePhone(settings.phone || '0123456789');
      setTaxEnabled(Boolean(settings.tax_enabled));
      setTaxRate(settings.tax_rate || 14);
      setTaxName(settings.tax_name || 'ضريبة القيمة المضافة');
      setTaxInclusive(Boolean(settings.tax_inclusive));
      setCurrency(settings.currency || 'EGP');
      setBackupSchedule(settings.backup_auto ? 'daily' : 'manual');
      setBackupLocation(settings.backup_path || 'C:\\SmartPOS\\Backups');
    }
    setHasChanges(false);
    notify.info('تم إلغاء التغييرات');
  };

  const tabs = [
    { id: 'general', label: 'عام', icon: Settings },
    { id: 'company', label: 'بيانات الشركة', icon: Building2 },
    { id: 'billing', label: 'الفواتير والضرائب', icon: CreditCard },
    { id: 'backup', label: 'النسخ الاحتياطي', icon: Cloud },
    { id: 'system', label: 'النظام', icon: Database },
  ];

  return (
    <div 
      className="min-h-screen transition-theme"
      style={{ backgroundColor: 'var(--page-bg)' }}
    >
      <Header title="الإعدادات" />
      
      <div className="p-6">
        <div className="flex gap-6 h-[calc(100vh-140px)]">
          {/* Left Sidebar */}
          <div 
            className="w-[280px] rounded-xl p-4 flex flex-col transition-theme"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <h2 className="text-[18px] font-bold mb-6 px-2 transition-theme" style={{ color: 'var(--text-primary)' }}>الإعدادات</h2>
            <nav className="space-y-1 flex-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as SettingsTab)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] font-medium transition-all text-right"
                    style={{
                      backgroundColor: isActive ? 'var(--accent-blue)' : 'transparent',
                      color: isActive ? 'var(--text-on-primary)' : 'var(--text-muted)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'var(--surface-2)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--text-muted)';
                      }
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
            </div>
          </div>

          {/* Right Content */}
          <div 
            className="flex-1 rounded-xl p-6 overflow-y-auto transition-theme"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
              <>
                <div 
                  className="rounded-xl p-6 mb-6 transition-theme"
                  style={{ backgroundColor: 'var(--surface-1)' }}
                >
                  <h3 className="text-[16px] font-semibold mb-6 transition-theme" style={{ color: 'var(--text-primary)' }}>الإعدادات العامة</h3>
                  
                  <div className="space-y-4">
                    {/* Dark Mode Toggle - Professional */}
                    <div 
                      className="flex items-center justify-between p-4 rounded-lg transition-theme"
                      style={{ backgroundColor: 'var(--surface-2)' }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isDarkMode ? 'bg-indigo-500/20' : 'bg-amber-500/20'}`}>
                          {isDarkMode ? (
                            <Moon className="w-5 h-5 text-indigo-400" />
                          ) : (
                            <Sun className="w-5 h-5 text-amber-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-[14px] font-medium transition-theme" style={{ color: 'var(--text-primary)' }}>
                            {isDarkMode ? 'الوضع المظلم' : 'الوضع النهاري'}
                          </p>
                          <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>
                            {isDarkMode ? 'تصميم داكن مريح للعين في الإضاءة المنخفضة' : 'تصميم فاتح ومشرق للعمل النهاري'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={toggleTheme}
                        className={`w-[56px] h-[30px] rounded-full relative transition-all duration-300 ease-in-out ${
                          isDarkMode ? 'bg-indigo-500' : 'bg-amber-400'
                        }`}
                      >
                        <span
                          className={`absolute top-[3px] w-[24px] h-[24px] bg-white rounded-full transition-all duration-300 ease-in-out shadow-md flex items-center justify-center ${
                            isDarkMode ? 'right-[3px]' : 'left-[3px]'
                          }`}
                        >
                          {isDarkMode ? (
                            <Moon className="w-3 h-3 text-indigo-500" />
                          ) : (
                            <Sun className="w-3 h-3 text-amber-500" />
                          )}
                        </span>
                      </button>
                    </div>
                    
                    <div 
                      className="flex items-center justify-between p-4 rounded-lg transition-theme"
                      style={{ backgroundColor: 'var(--surface-2)' }}
                    >
                      <div>
                        <p className="text-[14px] font-medium transition-theme" style={{ color: 'var(--text-primary)' }}>اللغة</p>
                        <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>لغة واجهة التطبيق</p>
                      </div>
                      <select 
                        className="h-[40px] rounded-lg px-3 text-[14px] outline-none appearance-none cursor-pointer transition-theme"
                        style={{ 
                          backgroundColor: 'var(--input-bg)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        <option>العربية</option>
                        <option>English</option>
                      </select>
                    </div>
                    
                    <div 
                      className="flex items-center justify-between p-4 rounded-lg transition-theme"
                      style={{ backgroundColor: 'var(--surface-2)' }}
                    >
                      <div>
                        <p className="text-[14px] font-medium transition-theme" style={{ color: 'var(--text-primary)' }}>حجم الخط</p>
                        <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>حجم الخط في التطبيق</p>
                      </div>
                      <select 
                        className="h-[40px] rounded-lg px-3 text-[14px] outline-none appearance-none cursor-pointer transition-theme"
                        style={{ 
                          backgroundColor: 'var(--input-bg)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        <option>صغير</option>
                        <option selected>متوسط</option>
                        <option>كبير</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="ghost"
                    onClick={cancelChanges}
                    className="h-[44px] px-6 transition-theme"
                    style={{ 
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    إلغاء
                  </Button>
                  <Button
                    variant="primary"
                    onClick={saveSettings}
                    className="h-[44px] px-6"
                    style={{ backgroundColor: 'var(--accent-blue)' }}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    حفظ التغييرات
                  </Button>
                </div>
              </>
            )}

            {/* COMPANY TAB */}
            {activeTab === 'company' && (
              <>
                {/* Company Information Card */}
                <div 
                  className="rounded-xl p-6 mb-6 transition-theme"
                  style={{ backgroundColor: 'var(--surface-1)' }}
                >
                  <h3 className="text-[16px] font-semibold mb-6 transition-theme" style={{ color: 'var(--text-primary)' }}>بيانات الشركة</h3>
                  
                  <div className="flex gap-6">
                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="block text-[13px] mb-2 transition-theme" style={{ color: 'var(--text-muted)' }}>اسم الشركة</label>
                        <input
                          type="text"
                          value={storeName}
                          onChange={(e) => handleChange(setStoreName)(e.target.value)}
                          className="w-full h-[44px] rounded-lg px-4 text-[14px] outline-none transition-theme"
                          style={{
                            backgroundColor: 'var(--input-bg)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-color)'
                          }}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[13px] mb-2 transition-theme" style={{ color: 'var(--text-muted)' }}>العنوان</label>
                        <input
                          type="text"
                          value={storeAddress}
                          onChange={(e) => handleChange(setStoreAddress)(e.target.value)}
                          className="w-full h-[44px] rounded-lg px-4 text-[14px] outline-none transition-theme"
                          style={{
                            backgroundColor: 'var(--input-bg)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-color)'
                          }}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[13px] mb-2 transition-theme" style={{ color: 'var(--text-muted)' }}>رقم التليفون</label>
                        <input
                          type="tel"
                          value={storePhone}
                          onChange={(e) => handleChange(setStorePhone)(e.target.value)}
                          className="w-full h-[44px] rounded-lg px-4 text-[14px] outline-none transition-theme"
                          style={{
                            backgroundColor: 'var(--input-bg)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-color)'
                          }}
                        />
                      </div>
                    </div>

                    <div className="w-[160px]">
                      <label className="block text-[13px] mb-2 transition-theme" style={{ color: 'var(--text-muted)' }}>اللوجو</label>
                      <div 
                        className="w-[120px] h-[120px] rounded-xl flex items-center justify-center mb-3"
                        style={{ background: 'linear-gradient(135deg, var(--primary), var(--info))' }}
                      >
                        <Store className="w-12 h-12" style={{ color: 'var(--text-on-primary)' }} />
                      </div>
                      <div className="flex gap-2">
                        <button 
                          className="flex-1 h-[36px] rounded-lg text-[12px] font-medium flex items-center justify-center gap-1 transition-colors"
                          style={{ backgroundColor: 'var(--accent-blue)', color: 'var(--text-on-primary)' }}
                        >
                          <Upload className="w-4 h-4" />
                          رفع صورة
                        </button>
                        <button 
                          className="w-[36px] h-[36px] rounded-lg flex items-center justify-center transition-colors"
                          style={{ backgroundColor: 'var(--surface-2)', color: 'var(--danger)' }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="ghost"
                    onClick={cancelChanges}
                    className="h-[44px] px-6 transition-theme"
                    style={{ 
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    إلغاء
                  </Button>
                  <Button
                    variant="primary"
                    onClick={saveSettings}
                    className="h-[44px] px-6"
                    style={{ backgroundColor: 'var(--accent-blue)' }}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    حفظ التغييرات
                  </Button>
                </div>
              </>
            )}

            {/* BILLING TAB */}
            {activeTab === 'billing' && (
              <>
                {/* Financial Settings Card */}
                <div 
                  className="rounded-xl p-6 mb-6 transition-theme"
                  style={{ backgroundColor: 'var(--surface-1)' }}
                >
                  <h3 className="text-[16px] font-semibold mb-6 transition-theme" style={{ color: 'var(--text-primary)' }}>الإعدادات المالية</h3>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[13px] mb-2 transition-theme" style={{ color: 'var(--text-muted)' }}>العملة</label>
                      <select
                        value={currency}
                        onChange={(e) => handleChange(setCurrency)(e.target.value)}
                        className="w-full h-[44px] rounded-lg px-4 text-[14px] outline-none appearance-none cursor-pointer transition-theme"
                        style={{
                          backgroundColor: 'var(--input-bg)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-color)',
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394A3B8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'left 12px center'
                        }}
                      >
                        <option value="EGP">جنيه مصري</option>
                        <option value="USD">دولار أمريكي</option>
                        <option value="SAR">ريال سعودي</option>
                        <option value="AED">درهم إماراتي</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-[13px] mb-2 transition-theme" style={{ color: 'var(--text-muted)' }}>نسبة الضريبة (%)</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          value={taxRate}
                          onChange={(e) => handleChange(setTaxRate)(Number(e.target.value))}
                          disabled={!taxEnabled}
                          className="flex-1 h-[44px] rounded-lg px-4 text-[14px] outline-none transition-theme disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            backgroundColor: 'var(--input-bg)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-color)'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className="mt-4 flex items-center justify-between p-4 rounded-lg transition-theme"
                    style={{ backgroundColor: 'var(--surface-2)' }}
                  >
                    <div>
                      <p className="text-[14px] font-medium transition-theme" style={{ color: 'var(--text-primary)' }}>تفعيل الضريبة</p>
                      <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>إضافة الضريبة تلقائياً على الفواتير</p>
                    </div>
                    <button
                      onClick={() => {
                        setTaxEnabled(!taxEnabled);
                        setHasChanges(true);
                      }}
                      className="w-[52px] h-[28px] rounded-full relative transition-all"
                      style={{ backgroundColor: taxEnabled ? 'var(--accent-blue)' : 'var(--surface-4)' }}
                    >
                      <span
                        className="absolute top-[2px] w-[24px] h-[24px] bg-white rounded-full transition-all"
                        style={{ [taxEnabled ? 'right' : 'left']: '2px' }}
                      />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="ghost"
                    onClick={cancelChanges}
                    className="h-[44px] px-6 transition-theme"
                    style={{ 
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    إلغاء
                  </Button>
                  <Button
                    variant="primary"
                    onClick={saveSettings}
                    className="h-[44px] px-6"
                    style={{ backgroundColor: 'var(--accent-blue)' }}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    حفظ التغييرات
                  </Button>
                </div>
              </>
            )}

            {/* BACKUP TAB */}
            {activeTab === 'backup' && (
              <>
                {/* Backup Settings Card */}
                <div 
                  className="rounded-xl p-6 mb-6 transition-theme"
                  style={{ backgroundColor: 'var(--surface-1)' }}
                >
                  <h3 className="text-[16px] font-semibold mb-6 transition-theme" style={{ color: 'var(--text-primary)' }}>إعدادات النسخ الاحتياطي</h3>
                  
                  <div className="flex items-center justify-between mb-6">
                    <Button
                      variant="primary"
                      onClick={() => notify.success('تم إنشاء نسخة احتياطية')}
                      className="h-[44px] px-6"
                      style={{ backgroundColor: 'var(--accent-blue)' }}
                    >
                      نسخ الآن
                    </Button>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] transition-theme" style={{ color: 'var(--text-muted)' }}>جدولة النسخ</span>
                      <select
                        value={backupSchedule}
                        onChange={(e) => handleChange(setBackupSchedule)(e.target.value)}
                        className="h-[44px] rounded-lg px-4 text-[14px] outline-none appearance-none cursor-pointer min-w-[140px] transition-theme"
                        style={{
                          backgroundColor: 'var(--input-bg)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-color)',
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394A3B8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'left 12px center'
                        }}
                      >
                        <option value="daily">يومياً</option>
                        <option value="weekly">أسبوعياً</option>
                        <option value="monthly">شهرياً</option>
                        <option value="manual">يدوياً فقط</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Backup Location */}
                  <div className="mb-6">
                    <label className="block text-[13px] mb-2 transition-theme" style={{ color: 'var(--text-muted)' }}>مكان حفظ النسخ الاحتياطية</label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Folder className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-theme" style={{ color: 'var(--text-muted)' }} />
                        <input
                          type="text"
                          value={backupLocation}
                          onChange={(e) => handleChange(setBackupLocation)(e.target.value)}
                          placeholder="C:\\SmartPOS\\Backups"
                          className="w-full h-[44px] rounded-lg pr-10 pl-4 text-[14px] outline-none transition-theme"
                          style={{
                            backgroundColor: 'var(--input-bg)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-color)'
                          }}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          notify.info('اختيار المجلد (يتطلب تطبيق سطح مكتب)');
                        }}
                        className="h-[44px] px-4 transition-theme"
                        style={{ 
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <Folder className="w-4 h-4 ml-2" />
                        استعراض
                      </Button>
                    </div>
                    <p className="text-[12px] mt-1 transition-theme" style={{ color: 'var(--text-muted)' }}>
                      المجلد حيث سيتم حفظ ملفات النسخ الاحتياطي
                    </p>
                  </div>
                  
                  <div 
                    className="p-4 rounded-lg transition-theme"
                    style={{ backgroundColor: 'var(--surface-2)' }}
                  >
                    <p className="text-[14px] font-medium mb-2 transition-theme" style={{ color: 'var(--text-primary)' }}>آخر نسخة احتياطية</p>
                    <p className="text-[12px] transition-theme" style={{ color: 'var(--text-muted)' }}>لم يتم إنشاء نسخة احتياطية بعد</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="ghost"
                    onClick={cancelChanges}
                    className="h-[44px] px-6 transition-theme"
                    style={{ 
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    إلغاء
                  </Button>
                  <Button
                    variant="primary"
                    onClick={saveSettings}
                    className="h-[44px] px-6"
                    style={{ backgroundColor: 'var(--accent-blue)' }}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    حفظ التغييرات
                  </Button>
                </div>
              </>
            )}

            {/* SYSTEM TAB */}
            {activeTab === 'system' && (
              <>
                <div 
                  className="rounded-xl p-6 mb-6 transition-theme"
                  style={{ backgroundColor: 'var(--surface-1)' }}
                >
                  <h3 className="text-[16px] font-semibold mb-6 transition-theme" style={{ color: 'var(--text-primary)' }}>معلومات النظام</h3>
                  
                  <div className="space-y-3">
                    <div 
                      className="flex justify-between p-4 rounded-lg transition-theme"
                      style={{ backgroundColor: 'var(--surface-2)' }}
                    >
                      <span className="text-[14px] transition-theme" style={{ color: 'var(--text-muted)' }}>الإصدار</span>
                      <span className="text-[14px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>1.0</span>
                    </div>
                    <div 
                      className="flex justify-between p-4 rounded-lg transition-theme"
                      style={{ backgroundColor: 'var(--surface-2)' }}
                    >
                      <span className="text-[14px] transition-theme" style={{ color: 'var(--text-muted)' }}>آخر تحديث</span>
                      <span className="text-[14px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>24 مارس 2026</span>
                    </div>
                    <div 
                      className="flex justify-between p-4 rounded-lg transition-theme"
                      style={{ backgroundColor: 'var(--surface-2)' }}
                    >
                      <span className="text-[14px] transition-theme" style={{ color: 'var(--text-muted)' }}>قاعدة البيانات</span>
                      <span className="text-[14px] font-bold" style={{ color: 'var(--primary)' }}>متصلة</span>
                    </div>
                    <div 
                      className="flex justify-between p-4 rounded-lg transition-theme"
                      style={{ backgroundColor: 'var(--surface-2)' }}
                    >
                      <span className="text-[14px] transition-theme" style={{ color: 'var(--text-muted)' }}>عدد المنتجات</span>
                      <span className="text-[14px] font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>672</span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button
                      variant="info"
                      fullWidth
                      onClick={() => notify.info('النظام محدث')}
                      style={{ backgroundColor: 'var(--info)' }}
                    >
                      التحقق من التحديثات
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="ghost"
                    onClick={cancelChanges}
                    className="h-[44px] px-6 transition-theme"
                    style={{ 
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    إلغاء
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
