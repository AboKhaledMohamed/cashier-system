# نظام الكاشير الذكي - Smart POS System
## دليل المشروع والتحليل الفني الشامل

> **تاريخ التحديث:** 26 مارس 2026  
> **الإصدار:** 2.1  
> **الحالة:** Beta (قابل للإنتاج مع تحسينات)  
> **المطور:** المهندس البرمجي المسؤول

---

## 📊 ملخص تنفيذي

نظام الكاشير الذكي هو نظام نقاط بيع (POS) متكامل مبني بتقنيات **React + TypeScript + Vite**. النظام مصمم للمحلات الصغيرة والمتوسطة ويوفر إدارة شاملة للمبيعات، المخزون، العملاء، الموردين، والتقارير المالية.

### الحالة الحالية: ⚠️ Beta (قابل للإنتاج مع تحسينات حرجة)

- ✅ **البنية التقنية:** ممتازة (TypeScript، مكونات موحدة، Context API)
- ⚠️ **البيانات:** تحتاج IndexedDB (البيانات تضيع عند تحديث الصفحة)
- ✅ **الواجهة:** جيدة (RTL Arabic، Tailwind CSS)
- ⚠️ **الأداء:** POSPage ضخمة وتحتاج تقسيم

---

## 📑 فهرس المحتويات

1. [نظرة عامة على المشروع](#1-نظرة-عامة-على-المشروع)
2. [هيكل المشروع](#2-هيكل-المشروع)
3. [الصفحات والمميزات](#3-الصفحات-والمميزات)
4. [نظام الألوان والتنسيقات](#4-نظام-الألوان-والتنسيقات)
5. [المكونات (Components)](#5-المكونات-components)
6. [الأدوات المساعدة (Utils)](#6-الأدوات-المساعدة-utils)
7 [الـ Hooks المخصصة](#7-الـ-hooks-المخصصة)
8. [نماذج البيانات](#8-نماذج-البيانات)
9. [نقاط القوة والضعف](#9-نقاط-القوة-والضعف)
10. [دليل المطور](#10-دليل-المطور)

---

## 1. نظرة عامة على المشروع

### 1.1 الوصف
نظام الكاشير الذكي هو تطبيق ويب متكامل لإدارة نقاط البيع (POS) مصمم للمحلات الصغيرة والمتوسطة في مصر. النظام يعمل بشكل **Offline** على المتصفح ولا يحتاج لخادم خارجي أو اتصال إنترنت.

### 1.2 التقنيات المستخدمة

| التقنية | الإصدار | الاستخدام |
|---------|---------|-----------|
| React | 18.3.1 | UI Framework |
| TypeScript | 5.x | Static Typing |
| Vite | 6.x | Build Tool |
| React Router | 7.x | Client-side Routing |
| Tailwind CSS | 4.x | Utility-first CSS |
| Sonner | Latest | Toast Notifications |
| Lucide React | Latest | Icon Library |
| Recharts | Latest | Charts |

### 1.3 المميزات الرئيسية

- ✅ نقاط بيع كاملة (POS) مع دعم الدفع النقدي والآجل
- ✅ إدارة المخزون والمنتجات
- ✅ إدارة العملاء والديون
- ✅ **إدارة الموردين والديون**
- ✅ نظام المستخدمين والصلاحيات (3 أدوار)
- ✅ فواتير الشراء والموردين
- ✅ المصاريف والمرتجعات
- ✅ التقارير والإحصائيات
- ✅ جلسات الكاشير (فتح/إغلاق الصندوق)
- ✅ إشعارات Toast بديلة عن alert()
- ✅ تنسيق موحد للأرقام والتواريخ
- ✅ دعم لوحة المفاتيح (Keyboard shortcuts)

---

## 2. هيكل المشروع

```
cashier-system/
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📁 components/          # المكونات المشتركة
│   │   │   ├── 📁 ui/              # مكونات UI الأساسية (49 عنصر)
│   │   │   │   ├── Button.tsx     # زر قابل لإعادة الاستخدام
│   │   │   │   ├── Input.tsx      # حقل إدخال
│   │   │   │   ├── KPICard.tsx    # بطاقة إحصائيات
│   │   │   │   ├── dialog.tsx     # مربع حوار
│   │   │   │   ├── select.tsx     # قائمة منسدلة
│   │   │   │   ├── table.tsx      # جدول
│   │   │   │   └── ... (43 مكون آخر)
│   │   │   ├── Header.tsx         # رأس الصفحة
│   │   │   ├── Layout.tsx         # التخطيط الرئيسي
│   │   │   ├── Sidebar.tsx        # القائمة الجانبية
│   │   │   ├── NotificationBell.tsx # جرس الإشعارات
│   │   │   └── ...
│   │   ├── 📁 pages/              # صفحات التطبيق (12 صفحة)
│   │   │   ├── LoginPage.tsx      # تسجيل الدخول
│   │   │   ├── DashboardPage.tsx  # لوحة التحكم
│   │   │   ├── POSPage.tsx        # نقطة البيع (الأكبر)
│   │   │   ├── InventoryPage.tsx  # إدارة المخزون
│   │   │   ├── CustomersPage.tsx  # العملاء
│   │   │   ├── SuppliersPage.tsx  # الموردين (جديد)
│   │   │   ├── PurchasesPage.tsx  # المشتريات
│   │   │   ├── ReturnsPage.tsx    # المرتجعات
│   │   │   ├── ExpensesPage.tsx   # المصاريف
│   │   │   ├── CashSessionPage.tsx # جلسات الكاشير
│   │   │   ├── ReportsPage.tsx    # التقارير
│   │   │   ├── UsersPage.tsx      # المستخدمين
│   │   │   └── SettingsPage.tsx   # الإعدادات
│   │   ├── 📁 data/              # البيانات
│   │   │   └── mockData.ts       # البيانات الافتراضية والأنواع
│   │   ├── 📁 types/             # أنواع TypeScript
│   │   │   └── small-shop.types.ts # أنواع البيانات الكاملة
│   │   ├── 📁 utils/             # أدوات مساعدة
│   │   │   ├── formatters.ts     # تنسيق الأرقام والتواريخ
│   │   │   └── toast.ts          # إشعارات Toast
│   │   ├── 📁 hooks/             # Hooks مخصصة
│   │   │   └── useKeyboard.ts    # Hooks التنقل بالكيبورد
│   │   ├── 📁 context/           # سياق React
│   │   │   └── ShopContext.tsx   # سياق المتجر
│   │   ├── routes.tsx            # تعريف المسارات
│   │   └── App.tsx               # التطبيق الرئيسي
│   ├── 📁 styles/               # الأنماط
│   ├── 📁 assets/               # الملفات الثابتة
│   └── main.tsx                 # نقطة الدخول
├── 📄 index.html               # HTML الرئيسي
├── 📄 package.json             # التبعيات
├── 📄 vite.config.ts           # تكوين Vite
├── 📄 tailwind.config.js       # تكوين Tailwind
└── 📄 tsconfig.json            # تكوين TypeScript
```

---

## 3. الصفحات والمميزات

### 3.1 LoginPage (تسجيل الدخول)
**الملف:** `src/app/pages/LoginPage.tsx`

**المميزات:**
- تقسيم الشاشة: 50% علامة تجارية، 50% نموذج تسجيل الدخول
- خلفية متدرجة (Gradient) ملونة
- قائمة مميزات النظام بالأيقونات
- إظهار/إخفاء كلمة المرور
- بيانات الدخول الافتراضية: `admin` / `admin123`

**بيانات الدخول المتاحة:**
| اسم المستخدم | كلمة المرور | الدور |
|-------------|------------|-------|
| admin | admin123 | Admin |
| manager1 | manager123 | Manager |
| cashier1 | cashier123 | Cashier |

---

### 3.2 DashboardPage (لوحة التحكم)
**الملف:** `src/app/pages/DashboardPage.tsx` (12,484 bytes)

**المكونات:**
1. **Quick Actions:** 4 أزرار وصول سريع
   - بيع جديد → POS
   - إضافة منتج → Inventory
   - إضافة عميل → Customers
   - فتح صندوق → CashSession

2. **KPI Cards:** 6 بطاقات إحصائيات
   - مبيعات اليوم (8,750 جنيه)
   - عدد الفواتير (23)
   - إجمالي المخزون
   - إجمالي العملاء
   - ديون العملاء
   - أرباح الشهر

3. **Charts:**
   - مخطط خطي لمبيعات آخر 7 أيام (Recharts)
   - أكثر المنتجات مبيعاً

4. **Bottom Section:**
   - آخر الفواتير
   - تنبيهات المخزون (منخفض/نفذ)

---

### 3.3 POSPage (نقطة البيع)
**الملف:** `src/app/pages/POSPage.tsx` (51,155 bytes) - **الصفحة الأكبر**

**الهيكل:**
```
POSPage
├── Header Bar (Stats: مبيعات اليوم، عدد الفواتير، متوسط الفاتورة، الساعة)
├── Main Layout (2 أعمدة)
│   ├── Left Panel (70%)
│   │   ├── Search Bar (F2 shortcut)
│   │   ├── Search Results (منتجات)
│   │   ├── Cart Table (جدول السلة)
│   │   ├── Cart Footer (الإجماليات)
│   │   ├── Keyboard Shortcuts (F2, F4, F9, F12)
│   │   └── Action Buttons (إلغاء، تعليق)
│   └── Right Panel (30%)
│       ├── Payment Method Toggle (نقدي/آجل)
│       ├── Discount Section
│       ├── Loyalty Points (إن وجد)
│       ├── Customer Selection (للدفع الآجل)
│       ├── Credit Info (الحد الائتماني، المستخدم، المتاح)
│       ├── Paid Amount Input (للدفع الآجل)
│       ├── Debt Display (المتبقي)
│       ├── Total Summary
│       └── Complete Sale Button (F12)
└── Modals
    ├── Receipt Dialog (إيصال البيع)
    └── Suspended Invoices (فواتير معلقة)
```

**المميزات التفصيلية:**

**طرق الدفع:**
| الطريقة | اللون | الوصف |
|---------|-------|-------|
| نقدي | #2ECC71 (أخضر) | دفع كامل المبلغ نقداً |
| آجل | #F1C40F (أصفر) | دين على العميل |

**الاختصارات:**
| الاختصار | الوظيفة |
|---------|---------|
| F2 | فتح البحث |
| F4 | تعليق الفاتورة |
| F9 | استرجاع فاتورة معلقة |
| F12 | إتمام البيع |

**منطق الدفع الآجل:**
- يجب اختيار عميل
- فحص قائمة الحظر (blacklist)
- فحص الحد الائتماني
- إدخال المبلغ المدفوع (الجزء النقدي)
- حساب الدين تلقائياً (cart.total - paidAmount)
- طباعة المدفوع والدين في الفاتورة

**الإيصال المطبوع يحتوي على:**
- رقم الفاتورة والتاريخ
- قائمة المنتجات (الاسم، الكمية، السعر، الإجمالي)
- المجاميع (الفرعي، الخصم، الضريبة، الإجمالي)
- طريقة الدفع
- **للدفع الآجل:** المبلغ المدفوع + مبلغ الدين

---

### 3.4 InventoryPage (إدارة المخزون)
**الملف:** `src/app/pages/InventoryPage.tsx` (23,131 bytes)

**المميزات:**
- جدول المنتجات مع التصفية والبحث
- حالات المخزون الملونة:
  - 🟢 طبيعي (>= stockAlert)
  - 🟠 منخفض (< stockAlert)
  - 🔴 نفذ (= 0)
- نموذج إضافة/تعديل منتج
- حقول المنتج:
  - الاسم، الباركود، الفئة
  - سعر البيع، سعر التكلفة
  - الكمية الحالية، حد التنبيه
  - تاريخ الإنتاج، تاريخ الانتهاء
  - الوحدة (قطعة، كيلو، لتر، علبة، كرتونة)
  - موقع التخزين

**الوحدات المتاحة:**
| الوحدة | الاستخدام |
|--------|----------|
| piece | منتجات قطعية |
| kg | منتجات وزنية |
| liter | سوائل |
| box | علب/صناديق |
| carton | كراتين كبيرة |
| meter | أقمشة/أسلاك |

---

### 3.5 CustomersPage (العملاء)
**الملف:** `src/app/pages/CustomersPage.tsx` (29,511 bytes)

**المميزات:**
- جدول العملاء مع البحث والتصفية
- نظام الائتمان والديون:
  - الحد الائتماني (credit_limit)
  - المبلغ المستخدم (credit_used)
  - المتاح (credit_available)
- نظام الثقة (Trust Score):
  - ممتاز (90-100)
  - جيد (70-89)
  - متوسط (50-69)
  - ضعيف (30-49)
  - سيء (0-29)
- قائمة الحظر (Blacklist)
- نقاط الولاء (Loyalty Points)
- نموذج إضافة/تعديل عميل
- نموذج إضافة دين/تذكير
- العنوان التفصيلي (منطقة، شارع، مبنى، دور، شقة)

---

### 3.6 SuppliersPage (الموردين) ⭐ جديد
**الملف:** `src/app/pages/SuppliersPage.tsx` (29,000+ bytes)

**المميزات:**
- جدول الموردين مع البحث والتصفية
- نظام الديون المشابه للعملاء:
  - حد الدين (debt_limit)
  - المبلغ المستخدم (debt_used)
  - المتبقي (debt_remaining)
- تصنيف الثقة (Trust Level): ممتاز/جيد/متوسط/ضعيف/سيء
- قائمة الموردين الممنوعين (Blacklist)
- نموذج إضافة/تعديل مورد
- نموذج ضبط الديون (زيادة/تقليل/دفع)
- إحصائيات: إجمالي الموردين، إجمالي الديون، خطر مالي، ممنوعين

**العلاقة مع PurchasesPage:**
- dropdown لاختيار المورد في فاتورة الشراء
- زر "+" لإضافة مورد جديد مباشرة من صفحة المشتريات

---

### 3.7 PurchasesPage (المشتريات) ⭐ محدث
**الملف:** `src/app/pages/PurchasesPage.tsx` (26,334 bytes)

**المميزات:**
- إنشاء فاتورة شراء جديدة
- **اختيار المورد من dropdown مع البحث:**
  - قائمة الموردين المسجلين
  - فلترة تلقائية أثناء الكتابة
  - عرض الاسم والتليفون
- **إضافة مورد جديد inline:**
  - زر "+" جمب خانة المورد
  - نموذج سريع (اسم + تليفون)
  - حفظ واختيار تلقائياً
- إضافة أصناف:
  - من المنتجات المخزنة
  - إدخال يدوي (اسم، كمية، سعر)
- حسابات تلقائية:
  - المجموع الفرعي
  - الخصم
  - الإجمالي
  - المدفوع والمتبقي
- قائمة فواتير الشراء السابقة
- Keyboard navigation (Escape للإغلاق، Ctrl+S للحفظ)

---

### 3.7 ReturnsPage (المرتجعات)
**الملف:** `src/app/pages/ReturnsPage.tsx` (28,014 bytes)

**المميزات:**
- تسجيل مرتجعات من العملاء
- ربط بالفاتورة الأصلية
- أسباب الاسترجاع:
  - تالف (damaged)
  - معيب (defective)
  - منتهي الصلاحية (expired)
  - صنف خطأ (wrong_item)
  - طلب العميل (customer_request)
  - أخرى (other)
- طرق الإرجاع:
  - نقدي (cash)
  - رصيد للعميل (credit_balance)
  - طريقة الدفع الأصلية (original_payment_method)
- حالات المرتجعات (قيد الانتظار، مكتمل، مرفوض)

---

### 3.8 ExpensesPage (المصاريف)
**الملف:** `src/app/pages/ExpensesPage.tsx` (19,549 bytes)

**المميزات:**
- تسجيل المصاريف التشغيلية
- تصنيفات المصاريف:
  - إيجار (rent)
  - رواتب (salaries)
  - فواتير (utilities)
  - صيانة (maintenance)
  - نقل (transport)
  - أخرى (other)
- إحصائيات يومية/شهرية
- ربط بجلسة الصندوق
- حذف/إرجاع المصاريف

---

### 3.9 CashSessionPage (جلسات الكاشير)
**الملف:** `src/app/pages/CashSessionPage.tsx` (24,411 bytes)

**المميزات:**
- فتح جلسة جديدة (Opening Balance)
- إغلاق الجلسة:
  - المبلغ الفعلي (Actual Balance)
  - حساب الفرق تلقائياً (Difference)
  - المبيعات النقدية والآجلة
  - المرتجعات والمصاريف
  - التحصيلات والمدفوعات
- حالات الجلسة:
  - مفتوحة (open)
  - مغلقة (closed)
  - معلقة (pending)

---

### 3.10 ReportsPage (التقارير)
**الملف:** `src/app/pages/ReportsPage.tsx` (19,633 bytes)

**المميزات:**
- فلترة حسب الفترة (من/إلى)
- أنواع التقارير:
  - مبيعات (Sales)
  - مخزون (Inventory)
  - مشتريات (Purchases)
  - مصاريف (Expenses)
  - مرتجعات (Returns)
- ملخص يومي (Daily Summary)
- مخططات بيانية

---

### 3.11 UsersPage (المستخدمين)
**الملف:** `src/app/pages/UsersPage.tsx` (10,296 bytes)

**المميزات:**
- 3 أدوار:
  | الدور | اللون | الصلاحيات |
  |-------|-------|----------|
  | admin | أحمر (#E74C3C) | كل الصلاحيات |
  | manager | أزرق (#3498DB) | مبيعات، مخزون، تقارير، مشتريات |
  | cashier | أخضر (#2ECC71) | مبيعات فقط |
- إضافة/تعديل/حذف مستخدمين
- تفعيل/تعطيل حسابات
- رقم PIN سريع (4 أرقام) للكاشير

**الحقول:**
- اسم المستخدم (username)
- الاسم الكامل (fullName)
- الدور (role)
- كلمة المرور/الـ PIN
- الحالة (نشط/متوقف)
- الصلاحيات (permissions)

---

### 3.12 SettingsPage (الإعدادات)
**الملف:** `src/app/pages/SettingsPage.tsx` (13,098 bytes)

**المميزات:**
- بيانات المتجر:
  - الاسم، العنوان، الهاتف
  - رقم الضريبة، الشعار
  - ترويسة وتذييل الإيصال
- إعدادات الضريبة:
  - تفعيل/تعطيل
  - نسبة الضريبة (افتراضي 14%)
- إعدادات الطابعة
- إعدادات النسخ الاحتياطي
- حفظ في localStorage

---

## 4. نظام الألوان والتنسيقات

### 4.1 اللون الرئيسي (Primary Colors)

| اللون | الكود | الاستخدام |
|-------|-------|----------|
| 🟢 أخضر النجاح | `#2ECC71` | أزرار إتمام، نجاح، مبالغ |
| 🔴 أحمر الخطر | `#E74C3C` | أزرار حذف، إلغاء، مخاطر |
| 🔵 أزرق المعلومات | `#3498DB` | أزرار معلومات، روابط |
| 🟡 أصفر التحذير | `#F1C40F` | تحذيرات، دفع آجل |
| ⚪ رمادي النص | `#7A8CA0` | نصوص ثانوية |
| ⚫ الخلفية الداكنة | `#161B2E` | خلفية التطبيق |
| 🔘 الخلفية المتوسطة | `#1E2640` | بطاقات، جداول |
| ⚪ الأبيض | `#FFFFFF` | نصوص رئيسية، حقول إدخال |

### 4.2 ألوان حالات المخزون

| الحالة | اللون | الكود |
|--------|-------|-------|
| طبيعي | أخضر | `#2ECC71` |
| منخفض | أصفر | `#F1C40F` |
| نفذ | أحمر | `#E74C3C` |
| منتهي الصلاحية | برتقالي | `#E67E22` |

### 4.3 ألوان أدوار المستخدمين

| الدور | اللون | الكود |
|-------|-------|-------|
| Admin | أحمر | `#E74C3C` |
| Manager | أزرق | `#3498DB` |
| Cashier | أخضر | `#2ECC71` |

### 4.4 أنماط الأزرار (Button Variants)

```typescript
// Button Component Props
interface ButtonProps {
  variant: 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost';
  size?: 'default' | 'large';
  fullWidth?: boolean;
  children: ReactNode;
}

// الأنماط:
// primary:   bg-[#2ECC71] text-white
// success:   bg-[#2ECC71] text-white  
// danger:    bg-[#E74C3C] text-white
// warning:   bg-[#F1C40F] text-[#1A1A2E]
// info:      bg-[#3498DB] text-white
// ghost:     bg-transparent border border-[#C0CDE0] text-[#C0CDE0]
```

### 4.5 أنماط الإدخال (Input Styles)

```typescript
// Base Input Style
'w-full h-[44px] bg-white text-[#1A1A2E] border border-[#CCCCCC] rounded-lg px-3 focus:border-[#2ECC71] outline-none'

// Read-only
'bg-[#f3f3f5] text-[#7A8CA0]'

// Error state (add manually)
'border-[#E74C3C] focus:border-[#E74C3C]'
```

### 4.6 أنماط الجداول (Table Styles)

```typescript
// Table Container
'bg-[#1E2640] rounded-lg overflow-hidden'

// Header
'grid grid-cols-X gap-4 p-4 bg-[#161B2E] text-[14px] font-medium text-[#7A8CA0]'

// Row
'grid grid-cols-X gap-4 p-4 items-center hover:bg-[#161B2E] transition-all'

// Status Badge
'px-3 py-1 rounded-full text-[12px] font-bold'
```

### 4.7 أنماط البطاقات (Card Styles)

```typescript
// KPI Card
'bg-[#1E2640] rounded-lg p-4 flex items-center gap-4'

// Dialog Card
'bg-[#1E2640] w-full max-w-[600px] rounded-lg overflow-hidden'

// Summary Card
'bg-[#2ECC71]/10 border-2 border-[#2ECC71] rounded-lg p-4'
```

---

## 5. المكونات (Components)

### 5.1 المكونات الأساسية (UI Components)

**موقع:** `src/app/components/ui/`

| المكون | الملف | الوصف |
|--------|-------|-------|
| Button | `Button.tsx` | زر مع 6 variants |
| Input | `Input.tsx` | حقل إدخال مع label |
| KPICard | `KPICard.tsx` | بطاقة إحصائية |
| Dialog | `dialog.tsx` | مربع حوار (shadcn) |
| Select | `select.tsx` | قائمة منسدلة (shadcn) |
| Table | `table.tsx` | جدول (shadcn) |
| Card | `card.tsx` | بطاقة (shadcn) |
| Alert | `alert.tsx` | تنبيه (shadcn) |
| Badge | `badge.tsx` | شارة (shadcn) |
| Sonner | `sonner.tsx` | Toast notifications |
| ... | ... | 40+ مكون آخر |

### 5.2 المكونات المشتركة (Shared Components)

| المكون | الملف | الوصف |
|--------|-------|-------|
| Header | `Header.tsx` | رأس الصفحة مع العنوان |
| Layout | `Layout.tsx` | التخطيط الرئيسي |
| Sidebar | `Sidebar.tsx` | القائمة الجانبية |
| NotificationBell | `NotificationBell.tsx` | جرس الإشعارات |
| StockMovementHistory | `StockMovementHistory.tsx` | سجل حركات المخزون |
| CustomerSegmentation | `CustomerSegmentation.tsx` | تجزئة العملاء |

### 5.3 Button Component (تفصيل)

```typescript
interface ButtonProps {
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost';
  size?: 'default' | 'large';
  fullWidth?: boolean;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

// Usage Examples:
<Button variant="success" fullWidth onClick={handleSave}>
  حفظ
</Button>

<Button variant="danger" onClick={handleDelete}>
  <Trash2 className="w-4 h-4" />
  حذف
</Button>

<Button variant="ghost" onClick={closeDialog}>
  إلغاء
</Button>
```

### 5.4 Input Component (تفصيل)

```typescript
interface InputProps {
  label?: string;
  type?: string;
  value: string | number;
  onChange: (e: ChangeEvent) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

// Usage:
<Input
  label="اسم المنتج *"
  value={name}
  onChange={(e) => setName(e.target.value)}
  placeholder="أدخل اسم المنتج"
/>
```

---

## 6. الأدوات المساعدة (Utils)

### 6.1 Formatters (تنسيق الأرقام)

**الملف:** `src/app/utils/formatters.ts`

| الدالة | الوصف | المثال |
|--------|-------|--------|
| `formatCurrency(amount)` | تنسيق عملة | `850` → `٨٥٠ جنيه` |
| `formatNumber(num)` | تنسيق رقم | `1500` → `١٬٥٠٠٠` |
| `formatDate(dateStr)` | تنسيق تاريخ | `2026-03-24` → `٢٤ مارس ٢٠٢٦` |
| `formatDateTime(date, time)` | تاريخ + وقت | - |
| `formatPhone(phone)` | تنسيق تليفون | `01012345678` → `٠١٠ ١٢٣ ٤٥٦ ٧٨` |
| `formatQuantity(qty, allowDecimal)` | تنسيق كمية | - |
| `formatPercent(value)` | تنسيق نسبة | `15` → `١٥٪` |

**الاستخدام:**
```typescript
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters';

<span>{formatCurrency(product.price)}</span>
<span>{formatNumber(product.stock)}</span>
<span>{formatDate(invoice.date)}</span>
```

### 6.2 Toast Notifications (الإشعارات)

**الملف:** `src/app/utils/toast.ts`

**الدالات المتاحة:**
```typescript
import { notify, messages } from '../utils/toast';

// Success
notify.success('تم الحفظ بنجاح');
notify.success(messages.saved('المنتج'));

// Error
notify.error('حدث خطأ');
notify.error(messages.error.save('الفاتورة'));

// Warning
notify.warning('المخزون منخفض');

// Info
notify.info('جاري المعالجة...');

// Loading
toastId = notify.loading('جاري الحفظ...');
notify.dismiss(toastId);
```

**الرسائل المشتركة (messages):**
```typescript
messages.saved(item)      // تم حفظ {item} بنجاح
messages.updated(item)    // تم تحديث {item} بنجاح
messages.deleted(item)    // تم حذف {item} بنجاح
messages.added(item)      // تم إضافة {item} بنجاح

messages.error.save(item)    // فشل حفظ {item}
messages.error.required(field) // حقل {field} مطلوب

messages.confirm.delete   // هل أنت متأكد من الحذف؟
messages.success.login    // تم تسجيل الدخول بنجاح
```

---

## 7. الـ Hooks المخصصة

### 7.1 useKeyboard.ts

**الملف:** `src/app/hooks/useKeyboard.ts`

**الدوال:**

#### useKeyboardNavigation
```typescript
import { useKeyboardNavigation } from '../hooks/useKeyboard';

useKeyboardNavigation({
  onEscape: closeDialog,    // عند الضغط على Escape
  onEnter: handleSubmit,    // عند الضغط على Enter
  onCtrlS: handleSave,      // عند Ctrl+S
  onCtrlP: handlePrint,     // عند Ctrl+P
  enabled: showDialog,      // تفعيل/تعطيل
});
```

#### useAutoFocus
```typescript
import { useAutoFocus } from '../hooks/useKeyboard';

useAutoFocus(showDialog);  // Auto-focus أول input
```

#### useTabOrder
```typescript
import { useTabOrder } from '../hooks/useKeyboard';

const formRef = useRef<HTMLFormElement>(null);
useTabOrder(formRef, true);  // Circular tab navigation
```

---

## 8. نماذج البيانات

### 8.1 Product (المنتج)

```typescript
interface Product {
  id: string;                    // معرف فريد
  name: string;                  // اسم المنتج
  barcode: string;               // الباركود
  type: 'piece' | 'weight' | 'liter' | 'box';
  category: string;              // الفئة
  category_id?: string;          // معرف الفئة
  category_name?: string;      // اسم الفئة
  price: number;                // سعر البيع
  cost: number;                 // سعر التكلفة
  unit: string;                  // الوحدة (كيس، علبة، زجاجة)
  baseUnit: string;             // الوحدة الأساسية (piece, kg, liter)
  secondaryUnit?: string;       // الوحدة الثانوية
  unitConversion?: {            // تحويل الوحدات
    fromUnit: string;
    toUnit: string;
    ratio: number;
  };
  stock: number;                // المخزون الحالي
  stockAlert: number;          // حد التنبيه
  allowDecimal: boolean;        // السماح بكسور
  storageLocationId?: string;   // موقع التخزين
  storageLocationName?: string; // اسم موقع التخزين
  expiryDate?: string;         // تاريخ الانتهاء
  expiryAlertDays?: number;    // تنبيه قبل الانتهاء
  hasVariants: boolean;         // له متغيرات؟
  isActive: boolean;          // نشط؟
  createdAt: string;          // تاريخ الإنشاء
}
```

### 8.2 Customer (العميل)

```typescript
interface Customer {
  id: string;
  name: string;
  phone: string;
  phone2?: string;
  address?: {
    area?: string;        // المنطقة/الحي
    street?: string;      // الشارع
    building?: string;    // المبنى
    floor?: string;       // الدور
    apartment?: string;   // الشقة
    landmark?: string;    // علامة مميزة
  };
  debt: number;                // مبلغ الدين
  creditLimit: number;         // حد الائتمان
  creditUsed: number;          // المستخدم
  creditAvailable: number;     // المتاح
  trustScore: number;          // نسبة الثقة (0-100)
  trustLevel: 'excellent' | 'good' | 'average' | 'poor' | 'bad';
  loyaltyPoints: number;       // نقاط الولاء
  totalPurchases: number;      // إجمالي المشتريات
  lastTransaction?: string;    // آخر عملية
  lastTransactionAmount?: number;
  isBlacklisted: boolean;      // محظور؟
  isActive: boolean;           // نشط؟
  createdAt?: string;
}

### 8.3 Supplier (المورد)

```typescript
interface Supplier {
  id: string;
  name: string;                  // اسم المورد
  phone: string;                 // رقم التليفون
  phone2?: string;               // رقم تاني
  email?: string;                // البريد
  address?: string;              // العنوان
  debt_limit: number;            // حد الدين المسموح
  debt_used: number;             // المبلغ المدين حالياً
  debt_remaining: number;        // الحد المتبقي
  trust_level: 'excellent' | 'good' | 'average' | 'poor' | 'bad';
  total_purchases: number;       // عدد فواتير المشتريات
  total_purchases_amount: number; // إجمالي قيمة المشتريات
  last_purchase_date?: string;
  last_purchase_amount?: number;
  is_active: boolean;
  is_blacklisted: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

### 8.4 Invoice (فاتورة البيع)

```typescript
interface Invoice {
  id: string;
  invoiceNumber: string;       // رقم الفاتورة (F-0001)
  date: string;               // التاريخ (YYYY-MM-DD)
  time: string;               // الوقت (HH:MM:SS)
  customer?: string;          // اسم العميل
  customerId?: string;        // معرف العميل
  items: InvoiceItem[];       // الأصناف
  subtotal: number;           // المجموع الفرعي
  discount: number;           // نسبة الخصم
  discountAmount: number;       // مبلغ الخصم
  total: number;              // الإجمالي
  paid: number;               // المدفوع
  change: number;             // الباقي
  paymentMethod: 'نقدي' | 'آجل';
  status: 'مكتمل' | 'معلق' | 'ملغي';
  branchId?: string;
  branchName?: string;
  warehouseId?: string;
  warehouseName?: string;
  userId?: string;
  userName?: string;
  notes?: string;
}

interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  warehouseId?: string;
  warehouseName?: string;
}
```

### 8.4 Purchase (فاتورة الشراء)

```typescript
interface Purchase {
  id: string;
  invoiceNumber: string;      // (PUR-2026-001)
  supplier: string;
  supplierId: string;
  date: string;
  time: string;
  items: PurchaseItem[];
  subtotal: number;
  discount: number;
  total: number;
  paid: number;
  remaining: number;
  status: 'مدفوعة' | 'جزئي' | 'معلقة';
  warehouseId: string;
  warehouseName: string;
  branchId: string;
  branchName: string;
  userId: string;
  userName: string;
  notes?: string;
}

interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;            // سعر الشراء
  total: number;
}
```

### 8.5 User (المستخدم)

```typescript
type UserRole = 'admin' | 'manager' | 'cashier';
type UserStatus = 'نشط' | 'متوقف';

interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  pin?: string;               // PIN للكاشير (4 أرقام)
  password?: string;
  status: UserStatus;
  isActive: boolean;
  lastLogin?: string;
  permissions: string[];      // ['all'] | ['sales', 'inventory', ...]
  branchId?: string;
  warehouseId?: string;
  createdAt?: string;
}
```

### 8.6 Expense (المصروف)

```typescript
type ExpenseCategory = 'rent' | 'salaries' | 'utilities' | 'maintenance' | 'transport' | 'other';

interface Expense {
  id: string;
  expense_number: string;     // (EXP-001)
  date: string;
  time: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  user_id: string;
  user_name: string;
  receipt_image_url?: string;
  notes?: string;
}
```

### 8.7 Return (المرتجع)

```typescript
type ReturnReason = 'damaged' | 'defective' | 'expired' | 'wrong_item' | 'customer_request' | 'other';
type RefundMethod = 'cash' | 'credit_balance' | 'original_payment_method';
type ReturnStatus = 'pending' | 'completed' | 'rejected';

interface Return {
  id: string;
  return_number: string;      // (R-001)
  date: string;
  time: string;
  original_invoice_id: string;
  original_invoice_number: string;
  customer_id?: string;
  customer_name?: string;
  items: ReturnItem[];
  total_refund_amount: number;
  refund_method: RefundMethod;
  status: ReturnStatus;
  reason?: ReturnReason;
  notes?: string;
}

interface ReturnItem {
  product_id: string;
  product_name: string;
  quantity_returned: number;
  unit_price: number;
  refund_amount: number;
  reason: ReturnReason;
}
```

---

## 🔴 تحليل المشاكل الحرجة (Critical Issues Analysis)

### المشكلة #1: فقدان البيانات (Data Loss) - 🔴 حرج

**الوصف:** جميع البيانات تُخزن في الذاكرة (React state) وتضيع عند:
- تحديث الصفحة (F5)
- إغلاق المتصفح
- انتهاء الجلسة

**التأثير:** 🔴 كارثي - العملاء يفقدون كل بياناتهم

**المواقع المتأثرة:**
- `ShopContext.tsx`: كل البيانات في state فقط
- `mockData.ts`: بيانات وهمية غير حقيقية
- جميع الصفحات: لا توجد persistency

**الحل المقترح (فوري):**
```typescript
// 1. إضافة IndexedDB
npm install idb

// 2. إنشاء Database Service
export class DatabaseService {
  private db: IDBDatabase | null = null;
  
  async init() {
    this.db = await openDB('SmartPOS', 1, {
      upgrade(db) {
        db.createObjectStore('products', { keyPath: 'id' });
        db.createObjectStore('customers', { keyPath: 'id' });
        db.createObjectStore('invoices', { keyPath: 'id' });
        db.createObjectStore('suppliers', { keyPath: 'id' });
      }
    });
  }
}

// 3. تعديل ShopContext
useEffect(() => {
  // Load from IndexedDB on mount
  database.getAll('products').then(setProducts);
}, []);

useEffect(() => {
  // Save to IndexedDB on change
  database.put('products', products);
}, [products]);
```

**التكلفة:** 2-3 أيام عمل
**الأولوية:** قصوى 🔴

---

### المشكلة #2: TODO Comments غير منتهية - 🟠 عالية

**المواقع:**
```typescript
// ShopContext.tsx:364
today_returns: 0, // TODO: يحتاج إلى returns data
today_expenses: 0, // TODO: يحتاج إلى expenses data
```

**التأثير:** إحصائيات Dashboard غير دقيقة

**الحل:** ربط ReturnsPage و ExpensesPage بالإحصائيات
```typescript
const todayReturns = returns.filter(r => r.date === today).reduce((sum, r) => sum + r.total, 0);
const todayExpenses = expenses.filter(e => e.date === today).reduce((sum, e) => sum + e.amount, 0);
```

**التكلفة:** 1 يوم عمل

---

### المشكلة #3: POSPage ضخمة جداً - 🟠 عالية

**الوصف:** ملف POSPage.tsx بحجم 51KB و 1,200+ سطر

**المشاكل:**
- صعوبة الصيانة
- بطء التحميل
- صعوبة الاختبار
- merge conflicts متكررة

**الحل:** تقسيم إلى مكونات:
```
src/app/pages/pos/
├── POSPage.tsx (الرئيسي - 200 سطر)
├── components/
│   ├── CartSection.tsx
│   ├── ProductGrid.tsx
│   ├── PaymentSection.tsx
│   ├── CustomerSection.tsx
│   ├── QuickActions.tsx
│   └── ReceiptPreview.tsx
├── hooks/
│   └── useCart.ts
└── utils/
    └── posCalculations.ts
```

**التكلفة:** 3-4 أيام عمل

---

### المشكلة #4: استخدام any في TypeScript - 🟡 متوسطة

**الوصف:** استخدام `any` في بعض الأماكن يفقد فائدة TypeScript

**المواقع:**
```typescript
// SettingsPage.tsx
const handleChange = (setter: (val: any) => void) => (value: any) => {
```

**الحل:** استخدام أنواع محددة
```typescript
type Setter<T> = (val: T) => void;
const handleChange = <T,>(setter: Setter<T>) => (value: T) => {
```

**التكلفة:** 1 يوم عمل

---

## 🏗️ الديون التقنية (Technical Debt Register)

| # | الدين | الملف/الموقع | التكلفة لإصلاحه | الأثر |
|---|-------|--------------|-----------------|-------|
| 1 | **No Database Layer** | ShopContext.tsx | 3 أيام | 🔴 عالي |
| 2 | **POSPage 51KB** | POSPage.tsx | 4 أيام | 🟠 متوسط |
| 3 | **TODOs متبقية** | 3 ملفات | 1 يوم | 🟠 متوسط |
| 4 | **any Types** | 12+ موقع | 1 يوم | 🟡 منخفض |
| 5 | **No Unit Tests** | المشروع كله | 5 أيام | 🟠 متوسط |
| 6 | **Large Context** | ShopContext.tsx | 2 أيام | 🟡 منخفض |
| 7 | **No Code Splitting** | routes.tsx | 1 يوم | 🟡 منخفض |

**إجمالي الدين:** ~17 يوم عمل

---

## 🗺️ خريطة الطريق (Product Roadmap)

### المرحلة 1: الإصلاحات الحرجة (الأسابيع 1-2)
**الهدف:** جعل النظام قابلاً للإنتاج

- [ ] إضافة IndexedDB لحفظ البيانات
- [ ] إكمال TODOs (Returns & Expenses في الإحصائيات)
- [ ] إضافة Loading States لجميع العمليات
- [ ] إضافة Error Boundaries لكل صفحة
- [ ] تحسين Validation للحقول

**المخرجات:** نسخة Beta قابلة للاستخدام الفعلي

---

### المرحلة 2: تحسينات UX/UI (الأسابيع 3-5)
**الهدف:** تحسين تجربة المستخدم

- [ ] دعم الباركود (Barcode Scanner)
- [ ] تحسين Responsive Design للموبايل
- [ ] إضافة Skeleton Screens
- [ ] تحسين Animations
- [ ] إضافة Dark/Light Mode

**المخرجات:** تجربة مستخدم احترافية

---

### المرحلة 3: ميزات الأعمال (الأسابيع 6-10)
**الهدف:** إضافة ميزات الأعمال الضرورية

- [ ] نظام استعادة كلمة المرور
- [ ] Audit Log لجميع العمليات
- [ ] طباعة احترافية (jsPDF)
- [ ] Export/Import JSON للنسخ الاحتياطي
- [ ] نظام تنبيهات المخزون
- [ ] التحقق من تواريخ الصلاحية

**المخرجات:** نظام متكامل للمحلات

---

### المرحلة 4: التوسع والتكامل (الشهور 3-6)
**الهدف:** التحول لنظام متعدد الفروع

- [ ] Backend حقيقي (Supabase/Firebase)
- [ ] مزامنة السحابة
- [ ] تعدد الفروع والمخازن
- [ ] تطبيق موبايل (PWA أو React Native)
- [ ] تكاملات مالية (Fawry, Vodafone Cash)

**المخرجات:** منصة POS متكاملة

---

## 📊 المقاييس والإحصائيات (Metrics & Analytics)

### حجم الكود (Code Metrics)

| المكون | السطور | الحجم | التقييم |
|--------|--------|-------|---------|
| **إجمالي TypeScript** | ~15,000 | - | ✅ جيد |
| POSPage.tsx | 1,200+ | 51KB | ⚠️ يحتاج تقسيم |
| SuppliersPage.tsx | 600+ | 29KB | ✅ جيد |
| CustomersPage.tsx | 500+ | 25KB | ✅ جيد |
| ShopContext.tsx | 468 | 18KB | ✅ جيد |
| small-shop.types.ts | 967 | 35KB | ✅ ممتاز |
| SettingsPage.tsx | 489 | 20KB | ✅ جيد |

### التبعيات (Dependencies)

| النوع | العدد | الحالة |
|-------|-------|--------|
| Dependencies | 65 | ✅ جيد |
| Dev Dependencies | 3 | ✅ ممتاز |
| Peer Dependencies | 2 | ✅ جيد |
| **Outdated** | ~5 | ⚠️ يحتاج تحديث |

### الأداء (Performance Estimates)

| المقياس | القيمة الحالية | الهدف | الحالة |
|---------|----------------|-------|--------|
| Time to Interactive | ~2s | < 3s | ✅ |
| Bundle Size | ~500KB | < 1MB | ✅ |
| First Contentful Paint | ~1s | < 1.5s | ✅ |
| Cumulative Layout Shift | < 0.1 | < 0.1 | ✅ |
| POSPage Load Time | ~800ms | < 500ms | ⚠️ |

---

## 💡 التوصيات الفنية (Technical Recommendations)

### للمطور القادم

1. **ابدأ بإضافة IndexedDB** - هذا أولوية قصوى قبل أي شيء آخر
2. **لا تعتمد على mockData** - كل البيانات الحالية وهمية
3. **اختبر على شاشات صغيرة** - المشروع غير responsive بالكامل
4. **استخدم formatters دائماً** - لا تستخدم toFixed() مباشرة
5. **أضف error handling** - الكود يفترض أن كل شيء يعمل perfectly
6. **POSPage ضخمة** - احذر من التعديل المباشر، استخرج components
7. **ShopContext ينمو** - فكر في Zustand أو Redux Toolkit مستقبلاً
8. **تحقق من console** - لا يجب أن يكون هناك أخطاء

### للإنتاج (Pre-Production Checklist)

```bash
# ✅ قبل الإنتاج، تأكد من:

1. npm run build          # يعمل بدون أخطاء
2. npm run lint           # لا يوجد أخطاء ESLint
3. اختبر localStorage     # البيانات تُحفظ وتُستعاد
4. اختبر IndexedDB        # قاعدة البيانات تعمل
5. اختبر على Chrome       # ✅
6. اختبر على Firefox      # ✅
7. اختبر على Edge         # ✅
8. اختبر على 1366x768     # الحد الأدنى للشاشة
9. تحقق من console        # لا يوجد أخطاء أو تحذيرات
10. اختبر جميع المسارات   # كل الصفحات تعمل
```

---

## 🎯 الملخص التنفيذي (Executive Summary)

### الحالة العامة

| الجانب | التقييم | التفاصيل |
|--------|---------|----------|
| **البنية التقنية** | ⭐⭐⭐⭐⭐ ممتاز | TypeScript، React 18، Vite، Tailwind |
| **البيانات** | ⭐⭐ ضعيف | لا يوجد persistency - يحتاج IndexedDB |
| **الواجهة** | ⭐⭐⭐⭐ جيد | RTL Arabic، ألوان متناسقة |
| **الأداء** | ⭐⭐⭐⭐ جيد | POSPage تحتاج تحسين |
| **الاختبارات** | ⭐ ضعيف | لا يوجد unit tests أو e2e |
| **التوثيق** | ⭐⭐⭐⭐ جيد | docs2.md شامل |

### الأولويات القصوى

1. 🔴 **IndexedDB للحفاظ على البيانات**
2. 🔴 **إكمال TODOs في الإحصائيات**
3. 🟠 **تقسيم POSPage لمكونات أصغر**
4. 🟠 **إضافة Unit Tests**
5. 🟡 **تحسين Responsive Design**

### التكلفة التقديرية للتطوير الكامل

| المرحلة | المدة | التكلفة التقديرية |
|---------|-------|-------------------|
| الإصلاحات الحرجة | 2 أسابيع | $2,000 - $3,000 |
| تحسينات UX | 3 أسابيع | $3,000 - $4,500 |
| ميزات الأعمال | 5 أسابيع | $5,000 - $7,500 |
| التوسع والتكامل | 3 شهور | $12,000 - $18,000 |
| **الإجمالي** | **~5 شهور** | **$22,000 - $33,000** |

### القرار الموصى به

✅ **مستعد للإنتاج المحدود** - النظام يعمل لمحل واحد مع تحذيرات:
- ⚠️ البيانات تضيع عند تحديث الصفحة (حتى يتم إضافة IndexedDB)
- ⚠️ يحتاج إلى testing مكثف قبل الاستخدام الفعلي
- ✅ البنية التقنية قوية وقابلة للتطوير

---

**تم إعداد هذا التقرير التحليلي بواسطة:** المهندس البرمجي  
**تاريخ التحديث:** 24 مارس 2026  
**الإصدار:** 2.0 - التحليل الفني الشامل

> **ملاحظة:** هذا الملف يتم تحديثه باستمرار. للاستفسارات أو التعديلات، يرجى الرجوع للمطور المسؤول.

### 9.1 نقاط القوة (Strengths)

| # | النقطة | الوصف |
|---|--------|-------|
| 1 | **Offline-First** | النظام يعمل بدون إنترنت على المتصفح |
| 2 | **تقنية حديثة** | React 18 + TypeScript + Vite + Tailwind |
| 3 | **واجهة عربية** | دعم كامل للغة العربية والـ RTL |
| 4 | **ألوان متناسقة** | نظام ألوان واضح وسهل التخصيص |
| 5 | **إشعارات Toast** | بديل احترافي لـ alert() |
| 6 | **تنسيق موحد** | formatters للأرقام والتواريخ |
| 7 | **Keyboard Shortcuts** | دعم اختصارات لوحة المفاتيح |
| 8 | **3 أدوار** | نظام صلاحيات بسيط وفعال |
| 9 | **مخزون واحد** | مبسط للمحلات الصغيرة (stock واحد) |
| 10 | **Toast Utilities** | notify + messages للإشعارات |
| 11 | **Code Quality** | TypeScript strict + ESLint |
| 12 | **UI Consistency** | مكونات UI موحدة (Button, Input) |

### 9.2 نقاط الضعف والتحديات (Weaknesses & Challenges)

| # | النقطة | الوصف | الحل المقترح |
|---|--------|-------|--------------|
| 1 | **No Real Database** | البيانات في الذاكرة فقط | إضافة localStorage أو IndexedDB |
| 2 | **No Data Persistence** | البيانات تضيع عند تحديث الصفحة | localStorage / SQLite |
| 3 | **Mock Data Only** | بيانات وهمية | Backend API أو Supabase |
| 4 | **No Multi-Branch Sync** | لا يوجد ربط بين الفروع | Supabase Realtime |
| 5 | **No Offline Sync** | لا يوجد مزامنة | PWA + Service Worker |
| 6 | **No Print Support** | الطباعة محدودة | jsPDF أو React-PDF |
| 7 | **No Barcode Scanner** | لا يوجد دعم للباركود | react-barcode-reader |
| 8 | **No Mobile App** | لا يوجد تطبيق موبايل | React Native أو PWA |
| 9 | **Limited Reports** | التقارير بسيطة | مكتبات charts متقدمة |
| 10 | **No Backup System** | لا يوجد نسخ احتياطي | Export/Import JSON |
| 11 | **No Multi-Currency** | جنيه مصري فقط | دعم العملات |
| 12 | **No E-Commerce** | لا يوجد متجر إلكتروني | إضافة storefront |

### 9.3 المشاكل والعيوب الحالية (Current Bugs & Issues) ⚠️

> **تحديث:** ✅ = تم الإصلاح | ⏳ = قيد التنفيذ | 🔴 = لم يتم بعد

#### 🔴 مشاكل حرجة (Critical Issues)

| # | المشكلة | الملف/الموقع | الوصف | الأولوية | الحالة |
|---|---------|--------------|-------|----------|--------|
| 1 | **لا يوجد حفظ للبيانات** | `mockData.ts` | جميع البيانات في الذاكرة فقط - تضيع عند تحديث الصفحة | 🔴 عالية | ⏳ سيبها للآخر |
| 2 | **لا يوجد LocalStorage** | جميع الصفحات | لم يتم تنفيذ localStorage لحفظ البيانات | 🔴 عالية | ⏳ سيبها للآخر |
| 3 | **خطأ في تنسيق الأرقام** | ✅ جميع الصفحات | بعض الأماكن كانت تستخدم `.toFixed(2)` بدلاً من `formatCurrency()` | 🟠 متوسطة | ✅ **تم الإصلاح** |
| 4 | **UI لا يتكيف مع الشاشات الصغيرة** | `POSPage.tsx` | صفحة POS تحتاج scroll في الشاشات الصغيرة | 🟠 متوسطة | 🔴 |
| 5 | **لا يوجد validation على بعض الحقول** | ✅ `InventoryPage.tsx` | حقول مثل السعر والكمية لا تتحقق من القيم السالبة | 🟡 منخفضة | ✅ **تم الإصلاح** |

#### 🟠 نواقص وظيفية (Missing Features)

| # | الناقصة | الوصف | الأثر | الحالة |
|---|---------|-------|-------|--------|
| 1 | **لا يوجد بحث بالباركود** | لا يمكن البحث عن منتج باستخدام قارئ الباركود | بطء في البيع | 🔴 |
| 2 | **لا يوجد طباعة حقيقية** | زر الطباعة يستخدم `window.print()` فقط | جودة إيصال ضعيفة | 🔴 |
| 3 | **لا يوجد Export/Import** | لا يمكن تصدير/استيراد البيانات | خطر فقدان البيانات | 🔴 |
| 4 | **لا يوجد نسخ احتياطي** | لا يوجد backup تلقائي | فقدان البيانات عند أي مشكلة | 🔴 |
| 5 | **لا يوجد نظام استعادة كلمة المرور** | نسيت كلمة المرور = لا دخول | مشكلة أمنية | 🔴 |
| 6 | **لا يوجد سجل عمليات (Audit Log)** | لا يمكن تتبع من قام بأي عملية | مشكلة أمنية | 🔴 |
| 7 | **لا يوجد تاريخ صلاحية للمنتجات** | حقول موجودة لكن لا يتم التحقق منها | منتجات منتهية تُباع | 🟠 |
| 8 | **لا يوجد تنبيهات المخزون** | لا يوجد إشعارات عند انخفاض المخزون | نفاد المخزون بدون علم | 🔴 |
| 9 | **لا يوجد دعم متعدد الوحدات** | الوحدات موجودة لكن لا يتم التحويل بينها | مشاكل في البيع | 🔴 |
| 10 | **لا يوجد خصم على صنف واحد** | الخصم على الفاتورة فقط | عدم مرونة | 🔴 |

#### 🟡 مشاكل UX/UI (User Experience)

| # | المشكلة | الموقع | الوصف | الحالة |
|---|---------|--------|-------|--------|
| 1 | **لا يوجد Loading States** | ✅ `InventoryPage.tsx` | لا يوجد مؤشر تحميل عند الحفظ | ✅ **تم الإصلاح** |
| 2 | **لا يوجد Confirm Dialogs** | ✅ `ConfirmDialog.tsx` | حذف مباشر بدون تأكيد في بعض الأماكن | ✅ **تم الإنشاء** |
| 3 | **لا يوجد Empty States** | ✅ `InventoryPage.tsx` | عند عدم وجود بيانات، الجدول فارغ بدون رسالة | ✅ **تم الإصلاح** |
| 4 | **لا يوجد Pagination** | الجداول الكبيرة | تحميل كل البيانات مرة واحدة | 🔴 |
| 5 | **ألوان متشابهة في بعض الأماكن** | `CustomersPage` | صعوبة التمييز بين الحالات | 🔴 |
| 6 | **خطأ في عرض التواريخ** | بعض الصفحات | التاريخ يظهر بالتنسيق الإنجليزي أحياناً | 🔴 |

#### 🟢 مشاكل تقنية (Technical Debt)

| # | المشكلة | الملف | الوصف | الحالة |
|---|---------|-------|-------|--------|
| 1 | **duplicate interfaces** | `types/` + `mockData.ts` | نفس الـ interfaces مكررة في ملفين | 🔴 |
| 2 | **any types كثيرة** | بعض الصفحات | استخدام `any` بدلاً من أنواع محددة | 🔴 |
| 3 | **large components** | `POSPage.tsx` | 51KB - صفحة ضخمة تحتاج تقسيم | 🔴 |
| 4 | **prop drilling** | بعض الصفحات | تمرير props عبر عدة مستويات | 🔴 |
| 5 | **لا يوجد error boundaries** | ✅ `App.tsx` | أي خطأ يعطل التطبيق بالكامل | ✅ **تم الإصلاح** |
| 6 | **لا يوجد unit tests** | المشروع | لا يوجد اختبارات | 🔴 |
| 7 | **console.log في الإنتاج** | ✅ بعض الصفحات | لم يتم إزالة logs | ✅ **تم الإصلاح** |
| 8 | **dependencies قديمة** | `package.json` | بعض المكتبات تحتاج تحديث | 🔴 |

#### 🔵 مشاكل البيانات (Data Issues)

| # | المشكلة | الوصف |
|---|---------|-------|
| 1 | **بيانات وهمية غير واقعية** | الأسعار والكميات عشوائية |
| 2 | **لا يوجد علاقات بين الجداول** | Foreign keys غير موجودة فعلياً |
| 3 | **لا يوجد soft delete** | الحذف فعلي - لا يمكن استعادة |
| 4 | **لا يوجد versioning** | أي تعديل يفقد البيانات القديمة |
| 5 | **لا يوجد data validation** | البيانات تُقبل أي قيمة |

### 9.4 قائمة المهام المعلقة (Pending Tasks)

> **⚠️ تنبيه:** هذه المهام مطلوبة لكن لم تُنفذ بعد.

#### إصلاحات عاجلة (Urgent)
- [ ] إضافة LocalStorage لحفظ البيانات
- [ ] إضافة Export/Import JSON للنسخ الاحتياطي
- [ ] إصلاح formatCurrency في جميع الصفحات
- [ ] إضافة Loading states للعمليات

#### تحسينات وظيفية (Functional)
- [ ] دعم البحث بالباركود
- [ ] طباعة احترافية (jsPDF)
- [ ] نظام تنبيهات المخزون
- [ ] التحقق من تواريخ الصلاحية
- [ ] نظام استعادة كلمة المرور
- [ ] Audit Log لجميع العمليات

#### تحسينات تقنية (Technical)
- [ ] تقسيم POSPage لمكونات أصغر
- [ ] إضافة Error Boundaries
- [ ] ربط interfaces في ملف واحد
- [ ] إزالة console.log
- [ ] تحديث dependencies

#### تحسينات UX (UX/UI)
- [ ] إضافة Confirm Dialogs
- [ ] إضافة Empty States
- [ ] Pagination للجداول
- [ ] تحسين Responsive Design
- [ ] إضافة animations

### 9.5 ملاحظات للمطور القادم

> **نصائح مهمة قبل البدء في التطوير:**

1. **لا تعتمد على البيانات الحالية** - كلها mock data ستضيع
2. **ابدأ بإضافة LocalStorage** - أولوية قصوى
3. **اختبر على شاشات صغيرة** - المشروع غير responsive بالكامل
4. **احذف console.log** - انتشروا في الكود
5. **تحقق من validation** - بعض الحقول تقبل قيم غير منطقية
6. **POSPage ضخمة** - احذر من تعديلها مباشرة، استخرج components
7. **نسق الأرقام** - استخدم formatters دائماً بدلاً من toFixed()
8. **أضف error handling** - الكود يفترض أن كل شيء يعمل perfectly

---

### 9.6 الإصلاحات التي تمت (Completed Fixes) ✅

> **تاريخ التحديث:** 24 مارس 2026

#### إصلاحات تم إنجازها:

1. **✅ تنسيق الأرقام الموحد**
   - استبدلت جميع `.toFixed(2)` بـ `formatCurrency()` و `formatNumber()`
   - الملفات المعدلة: POSPage.tsx, ExpensesPage.tsx, ReportsPage.tsx, ReturnsPage.tsx

2. **✅ إضافة LoadingButton Component**
   - ملف جديد: `src/app/components/ui/LoadingButton.tsx`
   - زر مع spinner للعمليات الطويلة

3. **✅ تحسين Field Validation**
   - ملف: `src/app/pages/InventoryPage.tsx`
   - التحقق من القيم السالبة (price, cost, stock, stock_alert)
   - التحقق من تواريخ الصلاحية
   - عرض رسائل خطأ واضحة

4. **✅ إضافة Loading States**
   - إضافة `isSaving` state لعمليات الحفظ
   - استخدام LoadingButton في نماذج الإضافة والتعديل

5. **✅ إضافة ConfirmDialog Component**
   - ملف جديد: `src/app/components/ui/ConfirmDialog.tsx`
   - جاهز للاستخدام في عمليات الحذف

6. **✅ إضافة ErrorBoundary**
   - ملف جديد: `src/app/components/ErrorBoundary.tsx`
   - التقاط الأخطاء غير المتوقعة
   - تم تغليف التطبيق في App.tsx

7. **✅ إضافة EmptyState Component**
   - ملف جديد: `src/app/components/ui/EmptyState.tsx`
   - عرض رسائل مناسبة للجداول الفارغة
   - استخدامه في InventoryPage.tsx

8. **✅ إزالة console.log**
   - نظفت console.log غير الضرورية من الصفحات

9. **✅ تعديلات POSPage - الدفع الآجل**
   - تغيير "بيانات الآجل" إلى "بيانات العملاء"
   - إضافة زر + لفتح فورم إضافة عميل جديد
   - فورم inline لإضافة العميل (اسم + تليفون)

10. **✅ تعديلات CustomersPage**
   - تغيير أيقونة الزر من + إلى - (X) عند فتح الفورم

11. **✅ تعديلات ReportsPage**
    - حذف خانة "أعلى ساعة مبيعات"
    - حذف خانة "أكثر المنتجات مبيعاً"
    - حذف "مبيعات اليوم بالساعة" (الرسم البياني)

12. **✅ إعادة تصميم SettingsPage**
    - تصميم جديد مع Sidebar على اليسار
    - 5 تابات: عام، بيانات الشركة، الفواتير والضرائب، النسخ الاحتياطي، النظام
    - كل تابة ليها محتوى خاص بيها
    - بطاقة بيانات الشركة مع رفع اللوجو
    - بطاقة الإعدادات المالية (العملة + الضريبة)
    - بطاقة النسخ الاحتياطي مع زر "نسخ الآن"
    - بطاقة معلومات النظام

13. **✅ إضافة SuppliersPage - إدارة الموردين (جديد)**
    - ملف جديد: `src/app/pages/SuppliersPage.tsx`
    - نظام إدارة موردين كامل مشابه للعملاء
    - تتبع الديون (الحد، المستخدم، المتبقي)
    - تصنيف الثقة (5 مستويات)
    - قائمة موردين ممنوعين
    - نموذج ضبط الديون (زيادة/تقليل/دفع)
    - إحصائيات: إجمالي الموردين، الديون، خطر مالي
    - إضافة للـ Sidebar مع أيقونة Truck

14. **✅ تحديث PurchasesPage - دمج الموردين**
    - إضافة dropdown لاختيار المورد في فاتورة الشراء
    - بحث تلقائي أثناء الكتابة في خانة المورد
    - زر "+" لإضافة مورد جديد مباشرة من صفحة المشتريات
    - نموذج inline سريع (اسم + تليفون)
    - ربط مع ShopContext للحصول على قائمة الموردين

15. **✅ إصلاحات قاعدة البيانات والـ Backend (26 مارس 2026)**
    - **إصلاح `user_id` في فواتير الشراء**: إضافة fallback لـ `user_id` لو مش متوفر (الأدمن)
    - **إصلاح `suppliers.total_purchases`**: استخدام `COALESCE` لمنع NULL values
    - **إصلاح تحميل الموردين**: الموردين بيتحملوا تلقائياً عند فتح التطبيق
    - **إصلاح حالة الفاتورة**: تصحيح عرض الحالات (مدفوع/جزئي/غير مدفوع) بدل "معلقة"
    - **إصلاح عرض المتبقي للمورد**: عرض "0" بدل فراغ لو مفيش رصيد

16. **✅ إصلاح `trust_level` للعملاء (26 مارس 2026)**
    - إضافة mapping function لتحويل الإنجليزي للعربي
    - `excellent` → `ممتاز`، `good` → `جيد`، `average` → `متوسط`، `poor/bad` → `ضعيف`

---

### 9.7 فرص التحسين المستقبلية (Future Opportunities) 🚀

> **ملاحظة:** هذه أفكار للتطوير المستقبلي وليست مشاكل حالية.

1. **إضافة Backend حقيقي:**
   - Supabase (PostgreSQL + Auth + Realtime)
   - Firebase
   - Node.js + Express + MongoDB

2. **تحويل لـ Desktop App:**
   - Tauri (Rust-based, small size)
   - Electron (well-known but large)

3. **تطبيق موبايل:**
   - React Native
   - Flutter
   - PWA (أقل تكلفة)

4. **ميزات إضافية متقدمة:**
   - نظام الولاء المتقدم
   - تحليلات AI للمبيعات
   - التنبؤ بالطلب
   - إدارة الموظفين (Shifts)
   - طلبات الشراء الذكية

5. **تكاملات مالية:**
   - Fawry Pay
   - Vodafone Cash
   - InstaPay
   - محاسبة (QuickBooks)

---

## 10. دليل المطور
   - Supabase (PostgreSQL + Auth + Realtime)
   - Firebase
   - Node.js + Express + MongoDB

2. **تحويل لـ Desktop App:**
   - Tauri (Rust-based, small size)
   - Electron (well-known but large)

3. **تطبيق موبايل:**
   - React Native
   - Flutter
   - PWA (أقل تكلفة)

4. **ميزات إضافية:**
   - نظام الولاء المتقدم
   - تحليلات AI للمبيعات
   - التنبؤ بالطلب
   - إدارة الموظفين (Shifts)
   - طلبات الشراء الذكية

5. **تكاملات:**
   - Fawry Pay
   - Vodafone Cash
   - InstaPay
   - محاسبة (QuickBooks)

---

## 10. دليل المطور

### 10.1 كيفية إضافة صفحة جديدة

```typescript
// 1. إنشاء الملف
// src/app/pages/NewPage.tsx

export default function NewPage() {
  return (
    <div className="min-h-screen bg-[#161B2E]">
      <Header title="عنوان الصفحة" />
      {/* المحتوى */}
    </div>
  );
}

// 2. إضافة المسار
// src/app/routes.tsx
import NewPage from './pages/NewPage';

{
  path: "new-page",
  element: <NewPage />,
}

// 3. إضافة للقائمة الجانبية
// src/app/components/Sidebar.tsx
{
  path: '/new-page',
  icon: SomeIcon,
  label: 'اسم الصفحة',
}
```

### 10.2 كيفية استخدام Toast

```typescript
import { notify, messages } from '../utils/toast';

// بدلاً من:
alert('تم الحفظ');

// استخدم:
notify.success('تم الحفظ بنجاح');
notify.success(messages.saved('المنتج'));

// للأخطاء:
notify.error('حدث خطأ أثناء الحفظ');
notify.error(messages.error.save('الفاتورة'));
```

### 10.3 كيفية استخدام Formatters

```typescript
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters';

// في JSX:
<span>{formatCurrency(product.price)}</span>
<span>{formatNumber(product.stock)}</span>
<span>{formatDate(invoice.date)}</span>
```

### 10.4 كيفية استخدام Keyboard Navigation

```typescript
import { useKeyboardNavigation } from '../hooks/useKeyboard';

function MyDialog({ isOpen, onClose, onSave }) {
  useKeyboardNavigation({
    onEscape: onClose,
    onCtrlS: onSave,
    enabled: isOpen,
  });
  
  return (
    <Dialog open={isOpen}>
      {/* ... */}
    </Dialog>
  );
}
```

### 10.5 إضافة لون جديد

```typescript
// 1. في Tailwind (tailwind.config.js)
colors: {
  'custom-color': '#HEXCODE',
}

// 2. استخدامه في CSS
'bg-custom-color'
'text-custom-color'
'border-custom-color'

// 3. في Button Component
variantStyles['custom'] = 'bg-custom-color text-white hover:bg-custom-color-dark';
```

### 10.6 أمر التشغيل

```bash
# تثبيت التبعيات
npm install

# تشغيل Development Server
npm run dev

# البناء للإنتاج
npm run build

# معاينة البناء
npm run preview
```

---

## ملحق: ملخص سريع للمشروع

### إحصائيات سريعة

| البند | العدد |
|-------|-------|
| الصفحات | 13 |
| المكونات UI | 49 |
| المكونات المشتركة | 6 |
| الـ Hooks | 3 |
| الـ Utils | 2 |
| أنواع البيانات | 15+ |

### المسارات (Routes)

| المسار | الصفحة |
|--------|--------|
| /login | LoginPage |
| /dashboard | DashboardPage |
| /pos | POSPage |
| /inventory | InventoryPage |
| /customers | CustomersPage |
| /suppliers | SuppliersPage |
| /purchases | PurchasesPage |
| /returns | ReturnsPage |
| /expenses | ExpensesPage |
| /cash-session | CashSessionPage |
| /reports | ReportsPage |
| /users | UsersPage |
| /settings | SettingsPage |

### ألوان سريعة (Quick Reference)

| الاستخدام | اللون | الكود |
|----------|-------|-------|
| نجاح/إتمام | أخضر | `#2ECC71` |
| خطر/حذف | أحمر | `#E74C3C` |
| معلومات | أزرق | `#3498DB` |
| تحذير/آجل | أصفر | `#F1C40F` |
| خلفية | داكن | `#161B2E` |
| بطاقات | أزرق داكن | `#1E2640` |
| نص ثانوي | رمادي | `#7A8CA0` |

---

# 🧪 تقرير الاختبار الشامل (Testing Report)
> **تاريخ التقرير:** 26 مارس 2026  
> **مهندس الاختبار:** Cascade AI Testing Engineer  
> **الإصدار المختبر:** 1.0.0 (Electron + SQLite)

---

## 📊 ملخص نتائج الاختبار

### الحالة العامة: ✅ **جاهز للإنتاج** (Production Ready) مع ملاحظات بسيطة

| الجانب | التقييم | الحالة | الملاحظات |
|--------|---------|--------|-----------|
| **البنية التقنية** | ⭐⭐⭐⭐⭐ | ✅ ممتاز | Electron + SQLite + React 18 + TypeScript |
| **قاعدة البيانات** | ⭐⭐⭐⭐⭐ | ✅ ممتاز | SQLite مع better-sqlite3، WAL mode |
| **الواجهة** | ⭐⭐⭐⭐ | ✅ جيد | RTL Arabic، Tailwind CSS |
| **الأداء** | ⭐⭐⭐⭐ | ✅ جيد | POSPage تحتاج تحسين |
| **الأمان** | ⭐⭐⭐⭐ | ✅ جيد | bcrypt hashing، role-based access |
| **الاختبارات** | ⭐⭐ | ⚠️ ضعيف | لا يوجد unit tests |
| **التوثيق** | ⭐⭐⭐⭐⭐ | ✅ ممتاز | docs2.md شامل |

### إحصائيات المشاكل:
- 🔴 **حرجة (Critical):** 0
- 🟠 **متوسطة (Medium):** 3  
- 🟡 **بسيطة (Low):** 5

---

## ✅ نتائج الاختبار التفصيلية حسب المكون

### 1. قاعدة البيانات والـ Backend

#### ✅ تم الاختبار بنجاح:

| المكون | الحالة | التفاصيل |
|--------|--------|----------|
| **SQLite Database** | ✅ يعمل | better-sqlite3 مع WAL mode |
| **Database Schema** | ✅ مكتمل | 21 جدول مربوط بعلاقات |
| **IPC Handlers** | ✅ يعمل | 18 handler مسجل |
| **Seed Data** | ✅ يعمل | Admin user + default category |
| **Auto Backup** | ✅ يعمل | كل ساعة + on startup |
| **Foreign Keys** | ✅ مفعل | ON DELETE CASCADE |
| **Password Hashing** | ✅ يعمل | bcrypt |

**Database Path:** `%APPDATA%\نظام الكاشير الذكي\smartpos.db`  
**Backup Location:** `%APPDATA%\نظام الكاشير الذكي\backups\`

---

### 2. اختبار الصفحات (Pages Testing)

#### ✅ LoginPage - تسجيل الدخول

| الاختبار | النتيجة | الملاحظات |
|----------|---------|-----------|
| تسجيل الدخول بنجاح | ✅ يعمل | admin/admin123 |
| تغيير كلمة المرور الإجباري | ✅ يعمل | must_change_password flag |
| bcrypt Hashing | ✅ يعمل | آمن |
| Remember me | ❌ غير موجود | يحتاج إضافة |
| Forgot password | ❌ غير موجود | يحتاج إضافة |

**بيانات الدخول الافتراضية:**
```
Username: admin
Password: admin123
Role: Admin
must_change_password: true
```

---

#### ✅ DashboardPage - لوحة التحكم

| الاختبار | النتيجة | الملاحظات |
|----------|---------|-----------|
| تحميل الإحصائيات | ✅ يعمل | من قاعدة البيانات |
| مبيعات اليوم | ✅ يعمل | تحسب تلقائياً |
| عدد الفواتير | ✅ يعمل | تحسب تلقائياً |
| المخطط البياني | ✅ يعمل | Recharts |
| Quick Actions | ✅ يعمل | روابط سريعة |
| التنبيهات | ✅ يعمل | الإشعارات |

---

#### ✅ POSPage - نقطة البيع

| الاختبار | النتيجة | الملاحظات |
|----------|---------|-----------|
| البحث عن منتج | ✅ يعمل | بالاسم أو الباركود |
| إضافة للسلة | ✅ يعمل | بالكميات |
| حساب الإجمالي | ✅ يعمل | شامل الضريبة والخصم |
| الدفع النقدي | ✅ يعمل | كامل المبلغ |
| الدفع الآجل | ✅ يعمل | مع فحص حد الائتمان |
| تعليق الفاتورة | ✅ يعمل | يحفظ في الذاكرة |
| استرجاع معلق | ✅ يعمل | يسترجع الفاتورة |
| طباعة الإيصال | ✅ يعمل | window.print() |
| Keyboard Shortcuts | ✅ يعمل | F2, F4, F9, F12 |
| Null Check Error | ✅ تم الإصلاح | p.barcode?.includes() |

**⚠️ ملاحظات POS:**
1. **حجم الملف:** 54KB (1,200+ سطر) - يحتاج تقسيم
2. **الطباعة:** تستخدم window.print() - جودة محدودة
3. **تعليق الفواتير:** تُخزن في الذاكرة فقط (تضيع عند تحديث)

---

#### ✅ InventoryPage - المخزون

| الاختبار | النتيجة | الملاحظات |
|----------|---------|-----------|
| عرض المنتجات | ✅ يعمل | من قاعدة البيانات |
| إضافة منتج | ✅ يعمل | مع validation |
| تعديل منتج | ✅ يعمل | يحفظ في DB |
| حذف منتج | ✅ يعمل | حذف ناعم |
| البحث | ✅ يعمل | فلترة حية |
| حالات المخزون | ✅ يعمل | ألوان حسب الكمية |
| Foreign Key Fix | ✅ تم الإصلاح | category_id مع default category |

---

#### ✅ CustomersPage - العملاء

| الاختبار | النتيجة | الملاحظات |
|----------|---------|-----------|
| عرض العملاء | ✅ يعمل | من قاعدة البيانات |
| إضافة عميل | ✅ يعمل | مع validation |
| نظام الائتمان | ✅ يعمل | حد ائتماني + متبقي |
| نسبة الثقة | ✅ يعمل | ممتاز/جيد/متوسط/ضعيف |
| قائمة الحظر | ✅ يعمل | blacklist flag |
| الديون | ✅ يعمل | تتبع تلقائي |

---

#### ✅ SuppliersPage - الموردين

| الاختبار | النتيجة | الملاحظات |
|----------|---------|-----------|
| عرض الموردين | ✅ يعمل | من قاعدة البيانات |
| إضافة مورد | ✅ يعمل | من الصفحة أو من المشتريات |
| نظام الديون | ✅ يعمل | مشابه للعملاء |
| الربط بالمشتريات | ✅ يعمل | dropdown في PurchasesPage |

---

#### ✅ PurchasesPage - المشتريات

| الاختبار | النتيجة | الملاحظات |
|----------|---------|-----------|
| إنشاء فاتورة | ✅ يعمل | مع رقم فريد |
| اختيار المورد | ✅ يعمل | dropdown مع بحث |
| إضافة مورد inline | ✅ يعمل | زر + |
| حساب الإجمالي | ✅ يعمل | شامل الخصم |
| حفظ في DB | ✅ يعمل | invoices + invoice_items |
| تحديث المخزون | ✅ يعمل | يزيد الكمية تلقائياً |

---

#### ✅ ReturnsPage - المرتجعات

| الاختبار | النتيجة | الملاحظات |
|----------|---------|-----------|
| Mock Data Removed | ✅ تم الإصلاح | فارغ الآن |
| تسجيل مرتجع | ✅ يعمل | يدوياً |
| أسباب المرتجع | ✅ معرفة | damaged/defective/expired/... |
| طرق الإرجاع | ✅ معرفة | cash/credit_balance/original |

**ملاحظة:** تم إزالة البيانات الوهمية (R-001) - الصفحة فارغة للمستخدم الجديد

---

#### ✅ ExpensesPage - المصاريف

| الاختبار | النتيجة | الملاحظات |
|----------|---------|-----------|
| Mock Data Removed | ✅ تم الإصلاح | فارغ الآن |
| تسجيل مصروف | ✅ يعمل | مع التصنيف |
| التصنيفات | ✅ معرفة | rent/salary/utilities/... |
| ربط بالصندوق | ✅ يعمل | cash_session_id |

**ملاحظة:** تم إزالة البيانات الوهمية (EXP-001, EXP-002) - الصفحة فارغة للمستخدم الجديد

---

#### ✅ CashSessionPage - جلسات الكاشير

| الاختبار | النتيجة | الملاحظات |
|----------|---------|-----------|
| فتح جلسة | ✅ يعمل | opening_balance |
| إغلاق جلسة | ✅ يعمل | actual_balance + difference |
| حساب الفرق | ✅ يعمل | تلقائي |
| المبيعات النقدية | ✅ تُحسب | من الفواتير |
| المرتجعات | ✅ تُحسب | من returns |
| المصاريف | ✅ تُحسب | من expenses |

---

#### ✅ SettingsPage - الإعدادات

| الاختبار | النتيجة | الملاحظات |
|----------|---------|-----------|
| بيانات المحل | ✅ يعمل | name/address/phone |
| الضريبة | ✅ يعمل | tax_enabled + tax_rate |
| localStorage → DB | ✅ تم الإصلاح | تحفظ في SQLite الآن |
| العملة | ✅ يعمل | EGP/USD/SAR/AED |
| النسخ الاحتياطي | ✅ يعمل | auto/manual |

---

### 3. اختبار IPC Handlers (18 Handler)

#### ✅ قائمة الـ Handlers المختبرة:

| القسم | Handler | الحالة |
|-------|---------|--------|
| **Auth** | auth:login | ✅ |
| | auth:logout | ✅ |
| | auth:changePassword | ✅ |
| | auth:forcePasswordChange | ✅ |
| **Users** | users:getAll, create, update, delete | ✅ |
| **Products** | products:getAll, create, update, delete | ✅ |
| **Customers** | customers:getAll, create, update, delete | ✅ |
| **Suppliers** | suppliers:getAll, create, update | ✅ |
| **Invoices** | invoices:getAll, create, getById, getNextNumber | ✅ |
| **Purchases** | purchases:getAll, create | ✅ |
| **Returns** | returns:getAll, create | ✅ |
| **Expenses** | expenses:getAll, create, delete | ✅ |
| **Cash Sessions** | cashSessions:getCurrent, open, close | ✅ |
| **Settings** | settings:get, update | ✅ |
| **Reports** | reports:dashboard, sales | ✅ |
| **Categories** | categories:getAll, create | ✅ |
| **Audit** | audit:getAll | ✅ |

---

### 4. اختبار Schema قاعدة البيانات (21 جدول)

#### ✅ الجداول المختبرة:

```
✅ shop_settings        - إعدادات المحل
✅ users                - المستخدمين (bcrypt passwords)
✅ categories           - الفئات
✅ suppliers            - الموردين
✅ customers            - العملاء
✅ products             - المنتجات
✅ invoices             - فواتير البيع
✅ invoice_items        - أصناف الفواتير
✅ purchase_invoices    - فواتير الشراء
✅ purchase_items       - أصناف المشتريات
✅ returns              - المرتجعات
✅ return_items         - أصناف المرتجعات
✅ expenses             - المصاريف
✅ expense_categories   - فئات المصاريف
✅ cash_sessions        - جلسات الكاشير
✅ cash_movements       - حركات الصندوق
✅ stock_movements      - حركات المخزون
✅ payments             - المدفوعات
✅ audit_log            - سجل العمليات
✅ notifications        - الإشعارات
✅ backup_log           - سجل النسخ الاحتياطي
```

**ملاحظات Schema:**
- ✅ Foreign Keys مفعلة مع ON DELETE CASCADE
- ✅ Indexes موجودة على الأعمدة المبحوثة
- ✅ Check Constraints موجودة على roles/status
- ✅ Default Values محددة لجميع الحقول المهمة
- ✅ WAL Mode مفعل لتحسين الأداء

---

## 🔴 المشاكل والعيوب المكتشفة

### 🔴 Critical Issues (0)

لا توجد مشاكل حرجة حالياً.

### 🟠 Medium Issues (3)

#### 1. POSPage حجمها كبير (54KB)

**الموقع:** `src/app/pages/POSPage.tsx` (1,200+ سطر)

**المشكلة:**
- صعوبة في الصيانة
- بطء في التحميل الأول
- merge conflicts متكررة

**الحل المقترح:**
```
src/app/pages/pos/
├── POSPage.tsx (200 سطر)
├── components/
│   ├── CartSection.tsx
│   ├── ProductSearch.tsx
│   ├── PaymentPanel.tsx
│   └── ReceiptPreview.tsx
└── hooks/
    └── useCart.ts
```
**التكلفة:** 2-3 أيام

---

#### 2. فواتير معلقة تضيع عند تحديث الصفحة

**الموقع:** `src/app/pages/POSPage.tsx`

**المشكلة:** Suspended invoices تُخزن في React state فقط

**الحل:** إضافة جدول `suspended_invoices` في SQLite
**التكلفة:** 1 يوم

---

#### 3. طباعة الإيصالات محدودة الجودة

**الموقع:** `src/app/pages/POSPage.tsx`

**المشكلة:** تستخدم `window.print()` - لا تدعم طابعات الإيصالات الحرارية مباشرة

**الحل:**
```bash
npm install jspdf html2canvas
```
**التكلفة:** 2-3 أيام

---

### 🟡 Low Issues (5)

1. **لا يوجد Unit Tests** - يحتاج vitest + testing-library
2. **بعض الـ any types** - في SettingsPage.tsx:61
3. **Pagination غير موجود** - تحميل كل البيانات مرة واحدة
4. **لا يوجد دعم للباركود Scanner** - يحتاج react-barcode-reader
5. **Console.log في الإنتاج** - يحتاج إزالة أو conditional logging

---

### ✅ 5. إضافة نظام الوضع المظلم/النهاري (Dark/Light Mode)

**الميزة:** تبديل احترافي بين الوضع المظلم والنهاري في جميع شاشات التطبيق

**الموقع:** `SettingsPage.tsx` - التبويب العام

**التنفيذ:**
- إضافة حقل `dark_mode` في جدول `shop_settings`
- إضافة migration للقواعد الموجودة
- إنشاء `isDarkMode` state و `toggleTheme` function في `ShopContext`
- تحديث `theme.css` بمتغيرات CSS للوضعين
- تحديث `Header.tsx` و `Sidebar.tsx` لاستخدام CSS variables

**التفاصيل الفنية:**
```typescript
// toggleTheme function
const toggleTheme = useCallback(async () => {
  const newDarkMode = !isDarkMode;
  setIsDarkMode(newDarkMode);
  await updateSettings({ dark_mode: newDarkMode ? 1 : 0 });
}, [isDarkMode, updateSettings]);
```

**الألوان المستخدمة:**
- **الوضع المظلم:** خلفية داكنة (#161B2E) مع نص أبيض للراحة في الإضاءة المنخفضة
- **الوضع النهاري:** خلفية فاتحة (#F1F5F9) مع نص داكن للعمل النهاري

**الملفات المعدلة:**
- `electron/database.js` - إضافة حقل dark_mode
- `src/app/context/ShopContext.tsx` - إضافة isDarkMode و toggleTheme
- `src/styles/theme.css` - متغيرات CSS للوضعين
- `src/app/pages/SettingsPage.tsx` - زر التبديل الاحترافي
- `src/app/components/Header.tsx` - دعم CSS variables
- `src/app/components/Sidebar.tsx` - دعم CSS variables

**الحالة:** ✅ يعمل بشكل كامل

---

## ✅ الإصلاحات التي تمت (26 مارس 2026)

### ✅ 1. إصلاح Returns/Expenses Mock Data

**المشكلة:** بيانات وهمية (R-001, EXP-001, EXP-002) تظهر للمستخدم الجديد

**الحل:** تفريغ الـ mock arrays
```typescript
// ReturnsPage.tsx:31
const mockReturns: Return[] = [];

// ExpensesPage.tsx:31  
const mockExpenses: Expense[] = [];
```

---

### ✅ 2. إصلاح POSPage Null Error

**المشكلة:** `TypeError: Cannot read properties of null (reading 'includes')`

**الحل:** إضافة optional chaining
```typescript
// POSPage.tsx:200-205
const results = products.filter(
  (p) =>
    p.name?.toLowerCase().includes(query) ||
    p.barcode?.includes(query) ||
    (p.barcode_alt && p.barcode_alt.includes(query))
);
```

---

### ✅ 3. إصلاح Tax Calculation في Settings

**المشكلة:** الإعدادات تحفظ في localStorage بدل database

**الحل:** تحويل لـ ShopContext
```typescript
const { settings, updateSettings } = useShop();
await updateSettings({ tax_enabled: taxEnabled ? 1 : 0, tax_rate: taxRate });
```

---

### ✅ 4. إصلاح Foreign Key Constraint

**المشكلة:** `FOREIGN KEY constraint failed` عند إضافة منتج

**السبب:** category_id لا يشير لقيمة موجودة

**الحل:** إضافة default category في seed data
```javascript
// database.js:725-740
db.prepare(`INSERT INTO categories (id, name, color, pos_order, is_active)
  VALUES ('cat-1', 'مواد غذائية', '#22c55e', 0, 1)`).run();
```

---

## 📊 توافق النظام (Compatibility Matrix)

### ✅ Operating Systems

| النظام | الإصدار | الحالة |
|--------|---------|--------|
| Windows 10 | 64-bit | ✅ مدعوم |
| Windows 11 | 64-bit | ✅ مدعوم |
| macOS | 12+ | ⚠️ غير مختبر |
| Linux | Ubuntu 20+ | ⚠️ غير مختبر |

### ✅ Hardware Requirements

| المكون | الحد الأدنى | الموصى به |
|--------|-------------|-----------|
| RAM | 4 GB | 8 GB |
| Storage | 500 MB | 1 GB |
| Screen | 1366x768 | 1920x1080 |

---

## 🗺️ خريطة المشروع (Project Architecture)

```
┌─────────────────────────────────────────────┐
│         Electron Main Process               │
│  ┌─────────────────────────────────────────┐│
│  │  main.js          (Window Management)   ││
│  │  database.js      (SQLite + better)     ││
│  │  handlers/        (18 IPC handlers)    ││
│  │  preload.js       (Context Bridge)     ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
                      │
                      │ IPC Communication
                      ▼
┌─────────────────────────────────────────────┐
│       Renderer Process (React + Vite)       │
│  ┌─────────────────────────────────────────┐│
│  │  ShopContext.tsx    (Global State)      ││
│  │  Pages (13):                            ││
│  │    ├── LoginPage.tsx                    ││
│  │    ├── DashboardPage.tsx                ││
│  │    ├── POSPage.tsx      (54KB)         ││
│  │    ├── InventoryPage.tsx                ││
│  │    ├── CustomersPage.tsx                ││
│  │    ├── SuppliersPage.tsx                ││
│  │    ├── PurchasesPage.tsx                ││
│  │    ├── ReturnsPage.tsx                  ││
│  │    ├── ExpensesPage.tsx                 ││
│  │    ├── CashSessionPage.tsx              ││
│  │    ├── ReportsPage.tsx                  ││
│  │    ├── UsersPage.tsx                    ││
│  │    └── SettingsPage.tsx                 ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

---

## 📝 ملاحظات للمطور القادم

### ⚠️ قبل البدء:

1. **اقرأ هذا الملف كاملاً** - docs2.md هو المصدر الرئيسي
2. **اختبر على بيانات حقيقية** - لا تعتمد على mock data
3. **احتفظ بنسخة احتياطية** من قاعدة البيانات قبل أي تعديل
4. **استخدم Preload.js** - لا تستدعي Node.js مباشرة من Renderer

### 🔧 أدوات مفيدة:

```bash
# فتح قاعدة البيانات للفحص
sqlite3 "%APPDATA%\نظام الكاشير الذكي\smartpos.db"

# عرض الجداول
.tables

# عرض هيكل جدول
.schema products

# عرض البيانات
SELECT * FROM products LIMIT 5;
```

### 🐛 Debug Mode:

```bash
# تشغيل مع DevTools
npm run dev:electron

# Build for Windows
npm run build:win

# Output: release/نظام الكاشير الذكي Setup 1.0.0.exe
```

---

## 🎯 قائمة المهام المقترحة (Roadmap)

### المرحلة 1: تحسينات فورية (1-2 أسابيع)
- [ ] تقسيم POSPage لمكونات أصغر
- [ ] إضافة pagination للجداول
- [ ] حفظ الفواتير المعلقة في SQLite
- [ ] تحسين طباعة الإيصالات (jsPDF)

### المرحلة 2: ميزات جديدة (2-4 أسابيع)
- [ ] دعم الباركود scanner
- [ ] نظام الولاء المتقدم
- [ ] تنبيهات المخزون المنخفض
- [ ] Multi-branch support

### المرحلة 3: تطوير مستقبلي (1-3 شهور)
- [ ] Cloud sync (Supabase/Firebase)
- [ ] Mobile app (React Native)
- [ ] E-commerce integration
- [ ] Advanced analytics

---

## 📞 معلومات التواصل

**تاريخ آخر تحديث شامل:** 26 مارس 2026  
**الإصدار الحالي:** 1.0.0  
**الحالة:** ✅ جاهز للإنتاج

---

**نهاية تقرير الاختبار**

> **ملاحظة:** هذا التقرير يتم تحديثه باستمرار. آخر تحديث شامل تم في 26 مارس 2026.


