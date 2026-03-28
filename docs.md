# نظام الكاشير الذكي - Smart POS System
## دليل المشروع الشامل (Project Documentation)

> **ملاحظة مهمة:** هذا الملف يحتوي على كل تفاصيل المشروع لتسهيل فهمه وتعديله من قبل أي مطور أو AI آخر.
> 
> **الإصدار:** 5.0 (منظم ومحسن)  
> **تاريخ آخر تحديث:** 22 مارس 2026  
> **المؤلف:** Senior Software Engineer Review

---

## 📑 فهرس المحتويات (Table of Contents)

### 🚀 البداية السريعة (Quick Start)
- [2.1 متطلبات النظام](#21-متطلبات-النظام)
- [2.2 خطوات التشغيل](#22-خطوات-التشغيل)
- [2.3 هيكل المشروع](#23-هيكل-المشروع)

### 📖 نظرة عامة
- [1.1 الوصف والمميزات](#11-الوصف-والمميزات)
- [1.2 التقنيات المستخدمة](#12-التقنيات-المستخدمة)
- [1.3 المميزات التنافسية المتقدمة](#13-المميزات-التنافسية-المتقدمة)

### 💻 دليل المطور (Developer Guide)
- [3.1 هيكل المجلدات](#31-هيكل-المجلدات)
- [3.2 أنماط الكود](#32-أنماط-الكود)
- [3.3 دليل المكونات](#33-دليل-المكونات)
- [3.4 إدارة الحالة](#34-إدارة-الحالة)

### 🗄️ نماذج البيانات
- [4.1 الواجهات الرئيسية](#41-الواجهات-الرئيسية)
- [4.2 العلاقات بين الكيانات](#42-العلاقات-بين-الكيانات)
- [4.3 البيانات الافتراضية](#43-البيانات-الافتراضية)

### 📱 الصفحات والمكونات
- [5.1 صفحة تسجيل الدخول](#51-صفحة-تسجيل-الدخول)
- [5.2 لوحة التحكم](#52-لوحة-التحكم)
- [5.3 نقطة البيع (POS)](#53-نقطة-البيع-pos)
- [5.4 إدارة المخزون](#54-إدارة-المخزون)
- [5.5 العملاء والموردين](#55-العملاء-والموردين)
- [5.6 التقارير](#56-التقارير)
- [5.7 المستخدمين والصلاحيات](#57-المستخدمين-والصلاحيات)

### 🏗️ المعمارية التقنية المتقدمة
- [6.1 معمارية ربط الفروع](#61-معمارية-ربط-الفروع)
- [6.2 استراتيجيات Sync](#62-استراتيجيات-sync)
- [6.3 نقل البيانات (Migration)](#63-نقل-البيانات-migration)
- [6.4 تحويل لـ Desktop](#64-تحويل-لـ-desktop)

### 📊 المقارنات والتنافس
- [7.1 مقارنة مع Odoo POS](#71-مقارنة-مع-odoo-pos)
- [7.2 مقارنة مع Square POS](#72-مقارنة-مع-square-pos)
- [7.3 مقارنة مع البرامج المحلية](#73-مقارنة-مع-البرامج-المحلية)

### 🗺️ خارطة الطريق
- [8.1 المرحلة القادمة (Q2 2026)](#81-المرحلة-القادمة-q2-2026)
- [8.2 الرؤية المستقبلية](#82-الرؤية-المستقبلية)

### ❓ الأسئلة الشائعة (FAQ)
- [9.1 للمطورين الجدد](#91-للمطورين-الجدد)
- [9.2 المشاكل الشائعة](#92-المشاكل-الشائعة)
- [9.3 نصائح للتطوير](#93-نصائح-للتطوير)

### 🧪 دليل الاختبار (Testing Guide)
- [10.1 اختبارات الوحدة](#101-اختبارات-الوحدة)
- [10.2 اختبارات التكامل](#102-اختبارات-التكامل)
- [10.3 اختبارات E2E](#103-اختبارات-e2e)

### 🔧 إعدادات وتكوين
- [11.1 إعدادات التطوير](#111-إعدادات-التطوير)
- [11.2 إعدادات الإنتاج](#112-إعدادات-الإنتاج)
- [11.3 shortcuts لوحة المفاتيح](#113-shortcuts-لوحة-المفاتيح)

### ⚠️ استكشاف الأخطاء
- [12.1 المشاكل المعروفة](#121-المشاكل-المعروفة)
- [12.2 الحلول الشائعة](#122-الحلول-الشائعة)

### 📎 ملحق تقني
- [A.1 معمارية ربط الفروع](#a1-معمارية-ربط-الفروع)
- [A.2 استراتيجيات Sync](#a2-استراتيجيات-sync)
- [A.3 نقل البيانات](#a3-نقل-البيانات)
- [A.4 تحويل لـ Desktop](#a4-تحويل-لـ-desktop)
- [A.5 أدوات وأطر العمل](#a5-أدوات-وأطر-العمل)
- [7.1 مقارنة مع Odoo POS](#71-مقارنة-مع-odoo-pos)
- [7.2 مقارنة مع Square POS](#72-مقارنة-مع-square-pos)
- [7.3 مقارنة مع البرامج المحلية](#73-مقارنة-مع-البرامج-المحلية)

### 🗺️ خارطة الطريق
- [8.1 المرحلة القادمة (Q2 2026)](#81-المرحلة-القادمة-q2-2026)
- [8.2 الرؤية المستقبلية](#82-الرؤية-المستقبلية)

### 🔧 إعدادات وتكوين
- [9.1 إعدادات التطوير](#91-إعدادات-التطوير)
- [9.2 إعدادات الإنتاج](#92-إعدادات-الإنتاج)
- [9.3 shortcuts لوحة المفاتيح](#93-shortcuts-لوحة-المفاتيح)

### ⚠️ استكشاف الأخطاء
- [10.1 المشاكل المعروفة](#101-المشاكل-المعروفة)
- [10.2 الحلول الشائعة](#102-الحلول-الشائعة)

---

## 🚀 2. البداية السريعة (Quick Start Guide)

### 2.1 متطلبات النظام

**للمطور:**
```
Node.js: v18+ (مستحسن v20 LTS)
npm: v9+ أو yarn: v1.22+
Git: v2.40+
VS Code (مستحسن)
```

**للتشغيل:**
```
Chrome/Edge/Firefox (أحدث إصدار)
شاشة: 1366×768 على الأقل
RAM: 4GB+
```

### 2.2 خطوات التشغيل

```bash
# 1. Clone Repository
git clone https://github.com/AboKhaledMohamed/cashier-system.git
cd cashier-system

# 2. Install Dependencies
npm install

# 3. Start Development Server
npm run dev

# 4. Open Browser
http://localhost:5173
```

**بيانات الدخول الافتراضية:**
- Username: `admin`
- Password: `admin`

### 2.3 هيكل المشروع (Project Structure)

```
cashier-system/
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📁 components/          # مكونات مشتركة
│   │   │   ├── 📁 ui/             # مكونات أساسية
│   │   │   │   ├── Button.tsx     # زر قابل لإعادة الاستخدام
│   │   │   │   ├── Input.tsx      # حقل إدخال
│   │   │   │   └── KPICard.tsx    # بطاقة KPI
│   │   │   ├── Header.tsx         # رأس الصفحة
│   │   │   ├── Layout.tsx         # التخطيط الرئيسي
│   │   │   └── Sidebar.tsx        # القائمة الجانبية
│   │   ├── 📁 data/
│   │   │   └── mockData.ts        # البيانات والأنواع
│   │   ├── 📁 pages/              # صفحات التطبيق
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── POSPage.tsx        # نقطة البيع الرئيسية
│   │   │   ├── InventoryPage.tsx
│   │   │   ├── CustomersPage.tsx
│   │   │   ├── ReportsPage.tsx
│   │   │   ├── PurchasesPage.tsx
│   │   │   ├── UsersPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   └── routes.tsx              # تكوين التوجيه
│   ├── 📁 styles/
│   │   ├── index.css              # الأنماط الرئيسية
│   │   ├── theme.css              # المتغيرات والألوان
│   │   ├── fonts.css              # الخطوط
│   │   └── tailwind.css           # Tailwind configuration
│   ├── main.tsx                   # نقطة الدخول
│   └── vite-env.d.ts              # أنواع Vite
├── 📄 index.html                  # HTML الرئيسي
├── 📄 package.json                # التبعيات
├── 📄 vite.config.ts              # تكوين Vite
├── 📄 tailwind.config.js          # تكوين Tailwind
└── 📄 tsconfig.json               # تكوين TypeScript
```

---

## 📖 1. نظرة عامة على المشروع

### 1.1 الوصف والمميزات

نظام الكاشير الذكي هو تطبيق ويب متكامل لإدارة نقاط البيع (POS) والمخازن مصمم للمحلات والسوبر ماركت. النظام يدعم:

**المميزات الأساسية:**
- ✅ نقاط البيع (POS): فواتير بيع مع دعم الدفع النقدي والآجل
- ✅ إدارة المخازن: تتبع المخزون لكل مخزن على حدة
- ✅ الفروع والمخازن: دعم متعدد الفروع والمخازن
- ✅ المشتريات: فواتير شراء مع الموردين
- ✅ التقارير: تقارير مبيعات ومخزون ومشتريات مع فلترة
- ✅ العملاء: إدارة العملاء والديون
- ✅ المستخدمين: نظام صلاحيات (Admin, Manager, Cashier)

**المميزات المتقدمة:**
- 🧠 تحليلات AI للمبيعات والتنبؤ بالطلب
- 🔄 مزامنة فورية بين الفروع
- 📱 دعم Offline-First
- 💳 تكامل مع بوابات الدفع المحلية (Fawry, Vodafone Cash)
- 📊 تقارير مالية متقدمة وضرائب

### 1.2 التقنيات المستخدمة

**Core Stack:**
| التقنية | الإصدار | الاستخدام |
|---------|---------|-----------|
| React | 18.3.1 | Framework UI |
| TypeScript | 5.x | Typing |
| Vite | 6.4.1 | Build Tool |
| React Router | 7.13.0 | Routing |
| Tailwind CSS | 4.1.12 | Styling |

**UI/UX:**
- Radix UI Components - مكونات قابلة للوصول
- Lucide React - Icons
- Recharts - Charts
- Framer Motion - Animations

**Future Backend:**
- Supabase (PostgreSQL + Realtime)
- Redis (Cache)
- Node.js/Express (API)

### 1.3 المميزات التنافسية المتقدمة

**🧠 الذكاء الاصطناعي:**
- نظام التنبؤ بالمبيعات (3-12 شهر)
- تحليل RFM للعملاء (Recency, Frequency, Monetary)
- ABC Analysis للمنتجات
- اقتراحات طلبات الشراء الذكية

**💳 نظام الدفع:**
- Fawry (QR Code)
- Vodafone Cash
- InstaPay
- تقسيط فواتير (3/6/12 شهر)

**🌐 Multi-Branch:**
- Real-time Sync
- Offline Mode
- Conflict Resolution
- نقل مخزون بين الفروع

---

## 💻 3. دليل المطور (Developer Guide)

### 3.1 أنماط الكود (Code Patterns)

**Component Structure:**
```typescript
// Pattern: Container/Presentational
// src/app/pages/POSPage.tsx

// 1. Imports (ordered: React, Libs, Local)
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockProducts } from '../data/mockData';
import { Product } from '../types';

// 2. Types
interface POSPageProps {
  branchId: string;
}

// 3. Component
export default function POSPage({ branchId }: POSPageProps) {
  // State
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Data Fetching
  const { data: products } = useQuery({
    queryKey: ['products', branchId],
    queryFn: () => fetchProducts(branchId)
  });
  
  // Handlers
  const addToCart = (product: Product) => {
    setCart(prev => [...prev, { product, quantity: 1 }]);
  };
  
  // Render
  return (
    <div className="pos-page">
      <ProductGrid products={products} onAdd={addToCart} />
      <Cart items={cart} />
    </div>
  );
}
```

**Naming Conventions:**
```typescript
// Files: PascalCase for components
ProductCard.tsx, POSPage.tsx

// Variables: camelCase
const productName = '...';

// Constants: UPPER_SNAKE_CASE
const MAX_CART_ITEMS = 100;

// Types/Interfaces: PascalCase + descriptive
interface ProductVariant {}
type PaymentMethod = 'cash' | 'credit';

// Functions: camelCase + verb prefix
const getProductById = () => {};
const handleAddToCart = () => {};
const calculateTotal = () => {};
```

### 3.2 أهم المكونات المشتركة

**Button Component:**
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

// Usage:
<Button variant="primary" size="lg" fullWidth onClick={completeSale}>
  إتمام البيع
</Button>
```

**Data Fetching Pattern:**
```typescript
// Custom Hook for API calls
function useProducts(branchId: string) {
  return useQuery({
    queryKey: ['products', branchId],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('branch_id', branchId);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

---

## 🗄️ 4. نماذج البيانات (Data Models)

### 4.1 الواجهات الرئيسية

**Core Entities Diagram:**
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Branch    │────▶│  Warehouse  │────▶│   Product   │
└─────────────┘     └─────────────┘     └─────────────┘
      │                                       │
      │                                       │
      ▼                                       ▼
┌─────────────┐                       ┌─────────────┐
│   Invoice   │◀───────────────────────│ InvoiceItem │
└─────────────┘                       └─────────────┘
      │
      │
      ▼
┌─────────────┐
│  Customer   │
└─────────────┘
```

**Key Interfaces:**
```typescript
// Product (المنتج)
interface Product {
  id: string;
  name: string;
  barcode: string;
  price: number;          // سعر البيع
  cost: number;           // سعر التكلفة
  unit: string;           // الوحدة (كجم، قطعة)
  category: string;
  warehouseStock: Record<string, number>; // المخزون لكل مخزن
  totalStock: number;
  stockAlert: number;     // حد التنبيه
  productionDate?: string;
  expiryDate?: string;
}

// Invoice (فاتورة البيع)
interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  time: string;
  branchId: string;
  branchName: string;
  warehouseId: string;
  warehouseName: string;
  customer: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  discountAmount: number;
  total: number;
  paymentMethod: 'نقدي' | 'آجل';
  paid: number;
  creditAmount: number;
  userId: string;
  userName: string;
}
```

---

## 📱 5. الصفحات الرئيسية

### 5.3 نقطة البيع (POS) - التفاصيل الكاملة

**Architecture:**
```
POSPage
├── Header (Stats: Total, Items Count)
├── Main Content (Grid Layout)
│   ├── Left Panel (70%)
│   │   ├── Search Bar
│   │   ├── Products Grid
│   │   ├── Cart Table
│   │   └── Keyboard Shortcuts
│   └── Right Panel (30%)
│       ├── Cart Summary
│       ├── Payment Method Toggle
│       └── Action Buttons
└── Modals
    ├── Receipt Dialog
    └── Credit Customer Selection
```

**Key Features:**
- Barcode Scanner Support
- Keyboard Shortcuts (F2, F4, F9, F12)
- Real-time Cart Updates
- Multi-warehouse Stock Check
- Discount Application
- Credit Payment with Customer Selection

---

## 🏗️ 6. المعمارية التقنية المتقدمة

### 6.1 معمارية ربط الفروع (Multi-Branch)

**System Architecture:**
```
┌─────────────────────────────────────────────────────────┐
│                    CLOUD SERVER                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  PostgreSQL  │  │    Redis     │  │  Supabase    │  │
│  │   (Main DB)  │  │   (Cache)    │  │  (Realtime)  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │           API Gateway (Node.js)                │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
    │  Branch A   │ │  Branch B   │ │  Branch C   │
    │  (Cairo)    │ │  (Alex)     │ │  (Aswan)    │
    │ + Local DB  │ │ + Local DB  │ │ + Local DB  │
    └─────────────┘ └─────────────┘ └─────────────┘
```

**Sync Strategies:**
1. **Real-time Sync (Supabase)** - للأحداث المهمة (مبيعات، مخزون)
2. **Periodic Sync (5 min)** - للبيانات الأقل أهمية
3. **Offline-First (PWA)** - يعمل بدون إنترنت ثم يتزامن

### 6.2 تحويل لـ Desktop Application

**Using Tauri (Recommended):**
```bash
# Setup
npm install --save-dev @tauri-apps/cli
npx tauri init

# Config (tauri.conf.json)
{
  "tauri": {
    "windows": [{
      "title": "Smart POS",
      "width": 1400,
      "height": 900,
      "fullscreen": false
    }],
    "allowlist": {
      "fs": { "all": true },
      "http": { "all": true }
    }
  }
}
```

**Benefits:**
- ✅ Binary size < 5MB (vs 100MB+ Electron)
- ✅ Native performance
- ✅ Local SQLite database
- ✅ Auto-updater
- ✅ System tray integration

---

## 📊 7. المقارنات التنافسية

### 7.1 مقارنة سريعة

| الميزة | Smart POS | Odoo | Square | Loyverse |
|--------|-----------|------|--------|----------|
| السعر | مجاني/رخيص | $$$ | 2.6%+10¢ | مجاني/محدود |
| RTL | ✅ أصلي | ⚠️ محدود | ❌ لا | ✅ نعم |
| دعم محلي | ✅ Fawry/Vodafone | ❌ لا | ❌ لا | ❌ لا |
| Multi-Branch | ✅ نعم | ✅ نعم | ⚠️ محدود | ✅ نعم |
| Offline | ✅ نعم | ❌ لا | ❌ لا | ⚠️ محدود |
| كود مفتوح | ✅ نعم | ✅ نعم | ❌ لا | ❌ لا |

**نقاط قوتنا الفريدة:**
1. كود مفتوح + تخصيص سهل
2. تقنية حديثة (React 18 + Vite + TypeScript)
3. أداء عالي حتى على الأجهزة الضعيفة
4. دعم كامل للعربية والـ RTL
5. تكامل مع بوابات الدفع المصرية

---

## 🗺️ 8. خارطة الطريق (Roadmap)

### 8.1 المرحلة القادمة (Q2 2026) - 3 أشهر

**Priority: HIGH** ⚡
```
✅ Supabase Integration (Backend + Auth)
✅ Real-time Sync between branches
✅ PWA Support (Offline-first)
✅ Desktop App (Tauri)
✅ Fawry Payment Integration
✅ Advanced Permissions (RBAC)
```

**Technical Tasks:**
- [ ] Set up Supabase project
- [ ] Migrate from mockData to PostgreSQL
- [ ] Implement JWT authentication
- [ ] Add Row Level Security (RLS)
- [ ] Create Sync engine
- [ ] Build PWA service worker

### 8.2 الرؤية المستقبلية (2026-2027)

**Q3 2026:** Mobile Apps + CRM
**Q4 2026:** AI Analytics + Voice Commands
**Q1 2027:** ERP Integration + E-commerce
**Q2 2027:** Franchise Management + White-label

---

## 🔧 9. إعدادات التطوير

### 9.1 VS Code Extensions (موصى بها)

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",        // Formatting
    "dbaeumer.vscode-eslint",        // Linting
    "bradlc.vscode-tailwindcss",    // Tailwind IntelliSense
    "formulahendry.auto-rename-tag", // Auto rename HTML tags
    "ms-vscode.vscode-typescript-next" // TypeScript
  ]
}
```

### 9.2 Git Workflow

```bash
# Branch Naming
feature/pos-page-refactor
bugfix/cart-calculation-error
hotfix/critical-payment-bug

# Commit Messages
feat: add barcode scanner support
fix: resolve cart total calculation
docs: update API documentation
refactor: optimize product search
```

### 9.3 shortcuts لوحة المفاتيح

| Shortcut | Action | Page |
|----------|--------|------|
| F2 | فتح البحث | POS |
| F4 | تعليق الفاتورة | POS |
| F9 | استرجاع فاتورة | POS |
| F12 | إتمام البيع | POS |
| Ctrl + P | طباعة آخر فاتورة | Global |
| Ctrl + Shift + D | فتح لوحة التحكم | Global |

---

## ⚠️ 10. استكشاف الأخطاء

### 10.1 المشاكل المعروفة

| المشكلة | الحل | الأولوية |
|---------|------|----------|
| POS page requires scroll | تصغير UI components | Medium |
| Mock data only | نقل لـ Supabase | High |
| No offline support | إضافة PWA | Medium |

### 10.2 Debugging Tips

```typescript
// Enable React DevTools
// 1. Install React Developer Tools (Chrome Extension)
// 2. Open DevTools > Components tab

// Debug Supabase
supabase.from('products').select('*').then(
  data => console.log('Success:', data),
  error => console.error('Error:', error)
);

// Network debugging
// DevTools > Network tab > Filter by "Fetch/XHR"
```

---

## 📝 11. قرارات التصميم (Architecture Decision Records)

### ADR-001: اختيار React + Vite
**التاريخ:** 21 مارس 2026  
**القرار:** استخدام React 18 مع Vite بدلاً من Create React App

**الأسباب:**
- ⚡ سرعة البناء (10x أسرع)
- 📦 حجم bundle أصغر
- 🔥 HMR فوري
- 🛠️ دعم TypeScript أصلي

**العواقب:**
- إيجابي: تجربة تطوير أفضل
- سلبي: بعض الـ plugins قد تحتاج تحديث

### ADR-002: Tailwind CSS بدلاً من MUI
**التاريخ:** 21 مارس 2026  
**القرار:** استخدام Tailwind + Radix بدلاً من Material-UI

**الأسباب:**
- ✅ تخصيص أسهل
- ✅ أداء أفضل (no runtime CSS)
- ✅ حجم أصغر
- ✅ RTL support أصلي

---

## 🔗 12. روابط مهمة

- 📖 [React Docs](https://react.dev)
- 🎨 [Tailwind Docs](https://tailwindcss.com)
- 🔥 [Supabase Docs](https://supabase.com/docs)
- 🚀 [Vite Docs](https://vitejs.dev)
- 📦 [Tauri Docs](https://tauri.app)

---

## 📎 ملحق تقني - التفاصيل الكاملة للمعمارية

> **ملاحظة:** هذا الملحق يحتوي على التفاصيل التقنية العميقة للمعمارية والتكاملات. مخصص للمطورين المتقدمين والمهندسين المعماريين.

### 23. 🔗 ربط أكثر من فرع في أماكن مختلفة
```typescript
interface Product {
  id: string;                    // معرف فريد
  name: string;                  // اسم المنتج
  barcode: string;               // رقم الباركود
  stockAlert: number;           // حد التنبيه للمخزون المنخفض
  price: number;                // سعر البيع
  cost: number;                 // سعر الشراء (التكلفة)
  unit: string;                 // وحدة القياس (قطعة، كيلو، لتر)
  category: string;             // الفئة
  productionDate?: string;       // تاريخ الإنتاج (جديد)
  expiryDate?: string;          // تاريخ الانتهاء
  // مخزون لكل مخزن: warehouseId -> quantity
  warehouseStock: Record<string, number>;
  // إجمالي المخزون في كل المخازن
  totalStock: number;
}
```

### 2.2 الفرع (Branch)
```typescript
interface Branch {
  id: string;                    // معرف فريد
  name: string;                  // اسم الفرع
  address: string;               // العنوان
  phone: string;                 // رقم التليفون
  manager: string;               // اسم المدير
  status: 'نشط' | 'متوقف';      // الحالة
}
```

### 2.3 المخزن (Warehouse)
```typescript
interface Warehouse {
  id: string;                    // معرف فريد
  name: string;                  // اسم المخزن
  branchId: string;             // معرف الفرع التابع له
  location: string;              // الموقع
  status: 'نشط' | 'متوقف';      // الحالة
}
```

### 2.4 حركة المخزون (StockMovement)
```typescript
interface StockMovement {
  id: string;                    // معرف فريد
  productId: string;             // معرف المنتج
  productName: string;            // اسم المنتج
  type: 'in' | 'out' | 'transfer'; // نوع الحركة
  quantity: number;               // الكمية
  sourceType: 'purchase' | 'sale' | 'return' | 'transfer' | 'adjustment';
  sourceId: string;              // معرف الفاتورة أو التحويل
  fromWarehouseId?: string;       // من مخزن (للتحويل)
  toWarehouseId?: string;          // إلى مخزن (للتحويل)
  warehouseId?: string;           // المخزن (للبيع/الشراء)
  branchId: string;              // الفرع
  date: string;                  // التاريخ
  time: string;                  // الوقت
  notes?: string;                 // ملاحظات
  userId: string;                // معرف المستخدم
  userName: string;              // اسم المستخدم
}
```

### 2.5 العميل (Customer)
```typescript
interface Customer {
  id: string;                    // معرف فريد
  name: string;                  // اسم العميل
  phone: string;                 // رقم التليفون
  debt: number;                  // مبلغ الدين
  creditLimit: number;           // حد الائتمان
  lastTransaction: string;      // تاريخ آخر عملية
  address?: string;              // العنوان
  branchId?: string;             // الفرع التابع له
}
```

### 2.6 عنصر الفاتورة (InvoiceItem) - محدث
```typescript
interface InvoiceItem {
  productId: string;             // معرف المنتج
  productName: string;           // اسم المنتج
  quantity: number;              // الكمية
  price: number;                 // السعر
  total: number;                 // الإجمالي
  warehouseId: string;         // معرف المخزن المصدر
  warehouseName: string;         // اسم المخزن المصدر
}
```

### 2.7 الفاتورة (Invoice) - محدثة
```typescript
interface Invoice {
  id: string;                    // معرف فريد
  invoiceNumber: string;          // رقم الفاتورة
  date: string;                  // التاريخ
  time: string;                  // الوقت
  customer?: string;            // اسم العميل
  customerId?: string;           // معرف العميل
  items: InvoiceItem[];         // عناصر الفاتورة
  subtotal: number;             // المجموع الفرعي
  discount: number;              // الخصم
  total: number;                // الإجمالي
  paid: number;                 // المبلغ المدفوع
  change: number;               // الباقي
  creditAmount?: number;        // مبلغ الآجل
  paymentMethod: 'نقدي' | 'آجل'; // طريقة الدفع
  status: 'مكتمل' | 'معلق' | 'ملغي'; // الحالة
  warehouseId: string;          // معرف المخزن
  warehouseName: string;        // اسم المخزن
  branchId: string;             // معرف الفرع
  branchName: string;           // اسم الفرع
  userId: string;               // معرف المستخدم
  userName: string;             // اسم المستخدم
  notes?: string;               // ملاحظات
}
```

### 2.8 عنصر فاتورة الشراء (PurchaseItem)
```typescript
interface PurchaseItem {
  productId: string;             // معرف المنتج
  productName: string;           // اسم المنتج
  quantity: number;              // الكمية
  price: number;                 // سعر الشراء للوحدة
  total: number;                 // الإجمالي
}
```

### 2.9 فاتورة الشراء (Purchase) - محدثة
```typescript
interface Purchase {
  id: string;                    // معرف فريد
  invoiceNumber: string;         // رقم الفاتورة
  supplier: string;              // اسم المورد
  supplierId: string;            // معرف المورد
  date: string;                  // التاريخ
  time: string;                  // الوقت
  items: PurchaseItem[];        // عناصر الفاتورة
  subtotal: number;             // المجموع الفرعي
  discount: number;              // الخصم
  total: number;                // الإجمالي
  paid: number;                 // المبلغ المدفوع
  remaining: number;             // المتبقي
  warehouseId: string;          // معرف المخزن المستلم
  warehouseName: string;        // اسم المخزن المستلم
  branchId: string;             // معرف الفرع
  branchName: string;           // اسم الفرع
  userId: string;               // معرف المستخدم
  userName: string;             // اسم المستخدم
  notes?: string;               // ملاحظات
  status: 'مدفوعة' | 'معلقة' | 'ملغية';
}
```

### 2.10 المورد (Supplier) - محدث
```typescript
interface Supplier {
  id: string;                    // معرف فريد
  name: string;                  // اسم المورد
  phone: string;                 // رقم التليفون
  email?: string;                // البريد الإلكتروني
  address?: string;              // العنوان
  totalPurchases: number;        // إجمالي المشتريات
  balance: number;               // الرصيد (الدين للمورد)
  lastTransaction: string;       // آخر عملية
  status: 'نشط' | 'متوقف';      // الحالة
  branchId?: string;             // الفرع التابع له
}
```

### 2.11 المستخدم (User) - محدث
```typescript
interface User {
  id: string;                    // معرف فريد
  username: string;              // اسم المستخدم
  fullName: string;              // الاسم الكامل
  role: 'Admin' | 'Manager' | 'Cashier'; // الدور
  status: 'نشط' | 'متوقف';     // الحالة
  lastLogin: string;             // آخر تسجيل دخول
  permissions: string[];          // الصلاحيات
  branchId?: string;            // الفرع الافتراضي
  warehouseId?: string;         // المخزن الافتراضي
}
```

### 2.12 جلسة العمل الحالية (CurrentSession)
```typescript
interface CurrentSession {
  userId: string;                // معرف المستخدم
  userName: string;              // اسم المستخدم
  role: 'Admin' | 'Manager' | 'Cashier';
  branchId: string;              // الفرع الحالي
  branchName: string;            // اسم الفرع
  warehouseId: string;           // المخزن الحالي
  warehouseName: string;         // اسم المخزن
  loginTime: string;             // وقت تسجيل الدخول
}
```

---

## 3. البيانات الوهمية (Mock Data)

### 3.1 الفروع (2 فرع)
```typescript
[
  { id: 'branch-1', name: 'الفرع الرئيسي', address: 'القاهرة - شارع التحرير', phone: '01234567890', manager: 'محمد أحمد', status: 'نشط' },
  { id: 'branch-2', name: 'فرع العجمي', address: 'الإسكندرية - العجمي', phone: '01234567891', manager: 'أحمد علي', status: 'نشط' }
]
```

### 3.2 المخازن (3 مخازن)
```typescript
[
  { id: 'wh-1', name: 'المخزن الرئيسي', branchId: 'branch-1', location: 'الطابق الأرضي', status: 'نشط' },
  { id: 'wh-2', name: 'مخزن العجمي', branchId: 'branch-2', location: 'خلف المحل', status: 'نشط' },
  { id: 'wh-3', name: 'المخزن الاحتياطي', branchId: 'branch-1', location: 'الطابق العلوي', status: 'نشط' }
]
```

### 3.3 المنتجات (مع مخزون لكل مخزن)
```typescript
// كل منتج له مخزون في كل مخزن (warehouseStock)
// وإجمالي مخزون في كل المخازن (totalStock)
{
  id: '1',
  name: 'أرز مصري - كيس 5 كجم',
  barcode: '6221234567890',
  price: 85,
  cost: 75,
  unit: 'كيس',
  category: 'حبوب',
  stockAlert: 20,
  productionDate: '2026-01-15',
  expiryDate: '2027-01-15',
  warehouseStock: { 'wh-1': 100, 'wh-2': 50 },
  totalStock: 150
}
```

---

## 4. المسارات والتوجيه (Routes)

### 4.1 تعريف المسارات
```typescript
// الملف: src/app/routes.tsx
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "dashboard", element: <DashboardPage /> },
      { path: "pos", element: <POSPage /> },
      { path: "inventory", element: <InventoryPage /> },
      { path: "customers", element: <CustomersPage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "purchases", element: <PurchasesPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
```

### 4.2 قائمة التنقل (Sidebar Menu Items)
| المسار | الأيقونة | التسمية |
|--------|----------|---------|
| /dashboard | LayoutDashboard | لوحة التحكم |
| /pos | ShoppingCart | نقطة البيع |
| /inventory | Package | المخزون |
| /customers | Users | العملاء |
| /reports | FileText | التقارير |
| /purchases | ShoppingBag | المشتريات |
| /users | UserCog | المستخدمين |
| /settings | Settings | الإعدادات |

---

## 5. الصفحات الرئيسية

### 5.1 صفحة تسجيل الدخول (LoginPage)
**الملف:** `src/app/pages/LoginPage.tsx`

**المميزات:**
- تقسيم الشاشة: 42% علامة تجارية، 58% نموذج تسجيل الدخول
- بيانات تجريبية: username: `admin`, password: `admin`
- قائمة مميزات النظام
- إظهار/إخفاء كلمة المرور

**الحالة:**
```typescript
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');
const [showPassword, setShowPassword] = useState(false);
const [error, setError] = useState('');
```

### 5.2 لوحة التحكم (DashboardPage)
**الملف:** `src/app/pages/DashboardPage.tsx`

**المكونات:**
1. **Quick Actions:** أزرار الوصول السريع (بيع جديد، إضافة منتج، إضافة عميل)
2. **KPI Cards:** 6 بطاقات مؤشرات
   - مبيعات اليوم
   - عدد الفواتير
   - إجمالي المخزون
   - إجمالي العملاء
   - ديون العملاء
   - أرباح الشهر

3. **Charts:**
   - مخطط خطي لمبيعات آخر 7 أيام (Recharts LineChart)
   - أكثر المنتجات مبيعاً

4. **Bottom Row:**
   - آخر الفواتير
   - تنبيهات المخزون (نفد / منخفض)

### 5.3 نقطة البيع (POSPage) - محدثة
**الملف:** `src/app/pages/POSPage.tsx`

**المميزات الرئيسية:**
- **اختيار المخزن:** dropdown لاختيار المخزن المصدر للبضاعة
- **عرض المخزون:** يعرض المخزون الخاص بالمخزن المختار فقط
- **البحث:** F2 للتركيز، بحث بالاسم أو الباركود
- **السلة:** إضافة، تعديل كمية، حذف (مع تتبع المخزن لكل صنف)
- **الحسابات:** المجموع الفرعي، الخصم، الإجمالي
- **طرق الدفع:** نقدي / آجل (مع التحقق من مبلغ الآجل)
- **الفاتورة:** تحتوي على معلومات الفرع والمخزن والمستخدم

**الحالة:**
```typescript
interface CartItem {
  product: Product;
  quantity: number;
  warehouseId: string;        // المخزن المصدر
  warehouseName: string;      // اسم المخزن
}

const [cart, setCart] = useState<CartItem[]>([]);
const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse>(...);
const [selectedCustomer, setSelectedCustomer] = useState('');
const [discount, setDiscount] = useState(0);
const [paymentMethod, setPaymentMethod] = useState<'نقدي' | 'آجل'>('نقدي');
const [paidAmount, setPaidAmount] = useState(0);
const [creditAmount, setCreditAmount] = useState(0);
const [showReceipt, setShowReceipt] = useState(false);
```

**اختصارات لوحة المفاتيح:**
| الاختصار | الوظيفة |
|----------|---------|
| F2 | تركيز حقل البحث |
| F4 | تعليق الفاتورة |
| F9 | استرجاع فاتورة |
| F12 | إتمام البيع |

### 5.4 إدارة المخزون (InventoryPage) - محدثة
**الملف:** `src/app/pages/InventoryPage.tsx`

**المميزات:**
- بحث بالاسم أو الباركود
- فلترة بالفئة
- تنبيهات المخزون (نفد / منخفض / كافي)
- إضافة/تعديل منتج (Dialog)
- **تاريخ الإنتاج:** حقل جديد بجانب تاريخ الانتهاء

**حالات المخزون:**
```typescript
const getStockStatus = (product: Product) => {
  if (product.totalStock === 0) return { text: 'نفد', color: 'text-[#E74C3C] bg-[#E74C3C]/10' };
  if (product.totalStock <= product.stockAlert) return { text: 'منخفض', color: 'text-[#F1C40F] bg-[#F1C40F]/10' };
  return { text: 'كافي', color: 'text-[#2ECC71] bg-[#2ECC71]/10' };
};
```

**حقول المنتج:**
- اسم المنتج (إلزامي)
- الباركود (يتم إنشاؤه تلقائياً)
- سعر البيع (إلزامي)
- سعر الشراء
- المخزون الحالي (إجمالي)
- حد التنبيه
- الوحدة
- الفئة
- **تاريخ الإنتاج (جديد)**
- تاريخ الانتهاء

### 5.5 إدارة العملاء (CustomersPage)
**الملف:** `src/app/pages/CustomersPage.tsx`

**المميزات:**
- بحث بالاسم أو التليفون
- فلترة العملاء المديونين
- إحصائيات: إجمالي العملاء، إجمالي الديون، متوسط الدين
- إضافة/تعديل عميل

**حقول العميل:**
- اسم العميل (إلزامي)
- رقم التليفون (إلزامي)
- العنوان (اختياري)
- حد الائتمان
- الفرع (اختياري)

### 5.6 التقارير (ReportsPage) - محدثة
**الملف:** `src/app/pages/ReportsPage.tsx`

**المميزات:**
- **تبويبات التقارير:**
  - تقارير المبيعات
  - تقارير المخزون
  - تقارير المشتريات
- **فلاتر متقدمة:**
  - نطاق التاريخ (من/إلى)
  - اختيار الفرع (كل الفروع / فرع محدد)
  - اختيار المخزن (كل المخازن / مخزن محدد)
  - نوع التقرير (يومي، أسبوعي، شهري، مخصص)
- **تقرير المبيعات:**
  - بطاقات إحصائية (عدد الفواتير، الإيرادات، الخصومات، الربح)
  - مخطط بياني للمبيعات بالساعة
  - أكثر المنتجات مبيعاً
  - جدول الفواتير مع الفرع والمخزن
  - ملخص طرق الدفع
- **تقرير المخزون:**
  - جدول يعرض المخزون لكل منتج في كل مخزن
  - إجمالي المخزون لكل منتج
  - إمكانية الطباعة
- **تصدير وطباعة:** أزرار طباعة لكل تقرير

### 5.7 المشتريات والموردين (PurchasesPage) - محدثة
**الملف:** `src/app/pages/PurchasesPage.tsx`

**المميزات:**
- **تبويبات:**
  - فواتير الشراء (سجل المشتريات)
  - الموردين
  - فاتورة مشتريات جديدة
- **إنشاء فاتورة شراء:**
  - اختيار المورد
  - اختيار المخزن المستلم
  - البحث عن المنتجات وإضافتها
  - تعديل الكمية والسعر لكل صنف
  - إدخال الخصم
  - إدخال المبلغ المدفوع
  - حساب المتبقي تلقائياً
  - إدخال ملاحظات
- **بطاقات الموردين:** مع إجمالي المشتريات والرصيد

### 5.8 إدارة المستخدمين (UsersPage)
**الملف:** `src/app/pages/UsersPage.tsx`

**المميزات:**
- إضافة/تعديل مستخدم
- الأدوار: Admin, Manager, Cashier
- الحالات: نشط / متوقف
- تبديل الحالة مباشرة
- **الصلاحيات:** مصفوفة permissions لكل مستخدم
- **الفرع والمخزن الافتراضي:** لكل مستخدم

**الألوان حسب الدور:**
- Admin: أحمر
- Manager: أزرق
- Cashier: أخضر

### 5.9 الإعدادات (SettingsPage)
**الملف:** `src/app/pages/SettingsPage.tsx`

**أقسام الإعدادات:**
1. **بيانات المحل:** الاسم، العنوان، التليفون، اللوجو
2. **إعدادات الطابعة:** اختيار الطابعة، طباعة تلقائية
3. **النسخ الاحتياطي:** مجلد الحفظ، الجدولة
4. **المظهر:** الوضع (داكن/فاتح)، حجم الخط، اللغة
5. **الضرائب:** تفعيل/تعطيل، نسبة الضريبة
6. **معلومات النظام:** الإصدار، آخر تحديث، حالة قاعدة البيانات

---

## 6. مكونات واجهة المستخدم (UI Components)

### 6.1 الزر (Button)
**الموقع:** `src/app/components/ui/Button.tsx`

**الخصائص:**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost';
  size?: 'default' | 'large';
  children: ReactNode;
  fullWidth?: boolean;
}
```

**أنماط الألوان:**
- `primary/success`: خلفية خضراء (#2ECC71)
- `danger`: خلفية حمراء (#E74C3C)
- `warning`: خلفية صفراء (#F1C40F) - نص داكن
- `info`: خلفية زرقاء (#3498DB)
- `ghost`: شفاف مع حدود

### 6.2 حقل الإدخال (Input)
**الموقع:** `src/app/components/ui/Input.tsx`

**الخصائص:**
```typescript
interface InputProps {
  label?: string;       // التسمية
  error?: string;       // رسالة الخطأ
  size?: 'default' | 'large';
}
```

**المميزات:**
- دعم التسميات العائمة
- عرض رسائل الخطأ
- حجمين: default (42px) و large (48px)
- تأثير التركيز باللون الأخضر

### 6.3 بطاقة المؤشرات (KPICard)
**الموقع:** `src/app/components/ui/KPICard.tsx`

**الخصائص:**
```typescript
interface KPICardProps {
  title: string;        // العنوان
  value: string | number; // القيمة
  change?: number;      // نسبة التغيير
  icon: LucideIcon;     // الأيقونة
  iconColor: string;    // لون الأيقونة
  iconBg: string;       // لون خلفية الأيقونة
}
```

---

## 7. المكونات المشتركة

### 7.1 الرأس (Header)
**الملف:** `src/app/components/Header.tsx`

**المحتويات:**
- عنوان الصفحة
- الساعة والتاريخ (مباشر)
- معلومات المستخدم (الاسم، الفرع، المخزن)
- زر تسجيل الخروج

### 7.2 التخطيط (Layout)
**الملف:** `src/app/components/Layout.tsx`

**الهيكل:**
```tsx
<div className="min-h-screen bg-[#161B2E]">
  <Sidebar />
  <main className="mr-[220px]">  {/* مساحة للقائمة الجانبية */}
    <Outlet />  {/* محتوى الصفحة */}
  </main>
</div>
```

### 7.3 القائمة الجانبية (Sidebar)
**الملف:** `src/app/components/Sidebar.tsx`

**المميزات:**
- عرض ثابت: 220px
- لون الخلفية: #12131A
- عنصر نشط: خلفية خضراء داكنة (#1A3A2A) + نص أخضر (#2ECC71)
- عنصر غير نشط: نص رمادي (#C0CDE0)

---

## 8. الألوان والتصميم

### 8.1 نظام الألوان
| اللون | الكود | الاستخدام |
|-------|-------|-----------|
| خلفية رئيسية | #161B2E | خلفية التطبيق |
| خلفية ثانوية | #1E2640 | البطاقات والجداول |
| خلفية القائمة | #12131A | Sidebar |
| أخضر رئيسي | #2ECC71 | الأزرار، المؤشرات الإيجابية |
| أزرق | #3498DB | معلومات، روابط |
| أحمر | #E74C3C | أخطاء، تحذيرات، ديون |
| أصفر | #F1C40F | تنبيهات، دفع آجل |
| نص رئيسي | #FFFFFF | العناوين |
| نص ثانوي | #C0CDE0 | النصوص العادية |
| نص تلميح | #7A8CA0 | التواريخ، التلميحات |
| حدود | #1E2640 | فواصل الجداول |

### 8.2 الخطوط والأحجام
| العنصر | الحجم | الوزن |
|--------|-------|-------|
| عنوان الصفحة | 26px | bold |
| عنوان البطاقة | 21px | semibold |
| قيمة كبيرة | 26px | bold |
| نص عادي | 14px | medium |
| نص صغير | 12px | regular |
| زر كبير | 18px | bold |

---

## 9. اختصارات لوحة المفاتيح

| الاختصار | الصفحة | الوظيفة |
|----------|--------|---------|
| F2 | POS | تركيز حقل البحث |
| F4 | POS | تعليق الفاتورة |
| F9 | POS | استرجاع فاتورة |
| F12 | POS | إتمام البيع |

---

## 10. كيفية التشغيل والتطوير

### 10.1 تثبيت الاعتماديات
```bash
npm install
```

### 10.2 تشغيل سيرفر التطوير
```bash
npm run dev
```

### 10.3 بناء للإنتاج
```bash
npm run build
```

### 10.4 بيانات تسجيل الدخول الافتراضية
- **اسم المستخدم:** admin
- **كلمة المرور:** admin

**جلسة العمل الافتراضية:**
```typescript
{
  userId: 'user-1',
  userName: 'محمد أحمد',
  role: 'Admin',
  branchId: 'branch-1',
  branchName: 'الفرع الرئيسي',
  warehouseId: 'wh-1',
  warehouseName: 'المخزن الرئيسي',
  loginTime: new Date().toISOString()
}
```

---

## 11. ملاحظات هامة للمطورين

### 11.1 القيود الحالية
1. **لا يوجد Backend:** النظام يستخدم بيانات وهمية فقط
2. **لا يوجد تخزين دائم:** البيانات تُفقد عند تحديث الصفحة
3. **تسجيل الدخول وهمي:** التحقق بسيط (username === 'admin' && password === 'admin')

### 11.2 الميزات المطلوبة للتطوير المستقبلي
1. ربط Backend حقيقي (REST API)
2. قاعدة بيانات (PostgreSQL/MongoDB)
3. نظام مصادقة كامل (JWT)
4. طباعة فعلية (Thermal Printer)
5. تخزين محلي (LocalStorage/IndexedDB)
6. دعم الباركود Scanner
7. مزامنة السحابة
8. تطبيق موبايل
9. نظام تحويلات بين المخازن
10. نظام مرتجعات المبيعات والمشتريات

### 11.3 أفضل الممارسات المتبعة
1. استخدام TypeScript لجميع الملفات
2. Component-based architecture
3. فصل المنطق عن العرض
4. استخدام Tailwind للتصميم
5. دعم RTL (الاتجاه من اليمين لليسار)
6. استخدام interfaces للبيانات في `mockData.ts`
7. تجنب استخدام `any` في TypeScript

### 11.4 هيكل استيراد الملفات
```typescript
// React imports
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

// Icons
import { IconName } from 'lucide-react';

// Charts
import { LineChart, Line, XAxis, YAxis } from 'recharts';

// Components
import Header from '../components/Header';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

// Data
import { mockProducts, mockBranches, mockWarehouses, Product, Branch, Warehouse } from '../data/mockData';
```

---

## 12. المشاكل المعروفة والحلول

| المشكلة | الحل المؤقت | الحل الدائم |
|---------|------------|------------|
| فقدان البيانات عند التحديث | لا يوجد | إضافة LocalStorage أو Backend |
| لا يمكن الطباعة | استخدام window.print() | ربط طابعة حرارية |
| لا يوجد مصادقة حقيقية | Validation بسيط | JWT + Backend |
| بيانات وهمية فقط | - | بناء API كامل |
| تحديث المخزون يدوي | - | ربط تلقائي مع المبيعات والمشتريات |

---

## 13. آخر التحديثات

### 21 مارس 2026 - التحديثات الكبيرة
1. ✅ إضافة نظام الفروع والمخازن
2. ✅ تتبع المخزون لكل مخزن على حدة (warehouseStock)
3. ✅ إضافة حركة المخزون (StockMovement)
4. ✅ تحديث فاتورة البيع لدعم اختيار المخزن
5. ✅ إنشاء نظام المشتريات الكامل مع الموردين
6. ✅ إنشاء واجهة التقارير مع فلترة حسب الفرع والمخزن
7. ✅ إضافة تاريخ الإنتاج للمنتجات
8. ✅ إضافة خاصية الطباعة للتقارير

---

## 14. تواصل ودعم

**اسم المشروع:** الكاشير الذكي (Smart POS)
**الإصدار:** 2.0
**تاريخ آخر تحديث:** 21 مارس 2026

---

## 15. 🏆 المميزات التنافسية المتقدمة (Competitive Features)

### 15.1 🧠 الذكاء الاصطناعي والتحليلات المتقدمة

#### A. نظام التنبؤ بالمبيعات (Sales Forecasting AI)
```
✅ تحليل تاريخ المبيعات (3-12 شهر)
✅ التنبؤ بالطلب المستقبلي لكل منتج
✅ تنبيهات تلقائية: "سيتم نفاد المخزون خلال 5 أيام"
✅ اقتراحات طلبات الشراء الذكية
✅ التعرف على المنتجات الموسمية والاتجاهات
```

#### B. تحليل سلوك العملاء (Customer Behavior Analytics)
```
✅ RFM Analysis (Recency, Frequency, Monetary)
✅ تصنيف العملاء: VIP, Regular, At Risk, Lost
✅ توقع قيمة العميل مدى الحياة (CLV)
✅ اقتراحات منتجات بناءً على سجل الشراء
✅ تحليل ساعات الذروة والأيام المفضلة
```

#### C. تحليل الربحية المتقدم
```
✅ ABC Analysis للمنتجات (80/20 rule)
✅ حساب الربحية الحقيقية (بعد المصاريف المخفية)
✅ تحليل هامش الربح حسب: منتج، فئة، عميل، مورد
✅ تتبع تكلفة الفرصة البديلة
✅ ROI لكل حملة تسويقية
```

### 15.2 🔄 الأتمتة والذكاء (Automation & Intelligence)

#### A. قواعد الأتمتة الذكية (Smart Automation Rules)
```
✅ "إذا انخفض المخزون لـ X، أرسل طلب تلقائي للمورد Y"
✅ "إذا تجاوز العميل حد الائتمان، أوقف البيع الآجل"
✅ "إذا كانت الفاتورة > 1000 جنيه، أرسل SMS للمدير"
✅ "إذا لم يشتري العميل منذ 30 يوم، أرسل عرض خاص"
✅ "إذا كانت الكمية أقل من الحد الأدنى × 2، ضع في قائمة الشراء"
```

#### B. معالجة المهام المتكررة
```
✅ فواتير دورية (اشتراكات، إيجارات)
✅ إرسال تذكيرات الديون آلياً (SMS/Email/WhatsApp)
✅ جرد مخزون تلقائي (周期性盘点)
✅ مطابقة الخزينة التلقائية (End of Day Reconciliation)
✅ تقارير يومية/أسبوعية/شهرية تُرسل آلياً
```

### 15.3 💳 نظام الدفع المتكامل (Payment Integration)

#### A. بوابات دفع إلكترونية مصرية
```
✅ Fawry (فوري) - QR Code
✅ Vodafone Cash - Wallet Integration
✅ InstaPay - Bank Transfer
✅ Etisalat Cash - USSD Integration
✅ We Pay - We Telecom
✅ Contactless Cards (Visa/Mastercard Tap)
```

#### B. خيارات دفع متقدمة
```
✅ تقسيط فواتير (Installments) - 3/6/12 شهر
✅ دفع جزئي + آجل (Partial Payment)
✅ دفع متعدد الطرق (نقدي + فيزا + آجل)
✅ بطاقات هدايا (Gift Cards) + رصيد
✅ عملات متعددة (جنيه، دولار، يورو) مع تحويل تلقائي
```

### 15.4 📱 نظام الطلبات والتسليم (Ordering & Delivery)

```
✅ تطبيق طلبات للعملاء (Customer App)
✅ نظام توصيل داخلي مع تتبع السائقين
✅ ربط مع دليفري: Talabat, UberEats, Mrsool
✅ طلبات اونلاين من Facebook/Instagram
✅ نظام الحجز والطاولة للمطاعم
✅ نظام Drive-Thru / Pickup
```

### 15.5 🏪 إدارة الفروع المتقدمة (Multi-Branch Enterprise)

#### A. المزامنة في الوقت الفعلي (Real-time Sync)
```
✅ Sync فوري بين كل الفروع
✅ Offline Mode - يعمل بدون انترنت ثم يتزامن
✅ Conflict Resolution (حل التعارضات تلقائياً)
✅ Sync Selective (اختيار ما يُتزامن)
✅ Bandwidth Optimization للمناطق الضعيفة
```

#### B. التحكم المركزي (Centralized Control)
```
✅ Dashboard رئيسي لكل الفروع
✅ مقارنة أداء الفروع (مبيعات، أرباح، كفاءة)
✅ نقل مخزون بين الفروع (Inter-branch Transfer)
✅ تسعير مركزي أو محلي لكل فرع
✅ Promotions مركزية أو محلية
```

### 15.6 📊 نظام التقارير المؤسسي (Enterprise Reporting)

#### A. التقارير المالية المتقدمة
```
✅ Cash Flow Statement (تدفقات نقدية)
✅ Balance Sheet (الميزانية العمومية)
✅ Income Statement (قائمة الدخل)
✅ Trial Balance (ميزان المراجعة)
✅ Cost of Goods Sold (COGS) التفصيلي
✅ Break-even Analysis (تحليل نقطة التعادل)
```

#### B. تقارير الامتثال والضرائب
```
✅ تقرير ضريبة القيمة المضافة (VAT)
✅ تقرير الاستقطاعات الضريبية
✅ تقرير الرواتب والتأمينات
✅ Audit Trail كامل (من غير تعديل)
✅ Electronic Invoicing (فاتورة إلكترونية مصلحة الضرائب)
```

### 15.7 🔒 الأمان والامتثال (Security & Compliance)

```
✅ تشفير البيانات (AES-256)
✅ Two-Factor Authentication (2FA)
✅ Role-Based Access Control (RBAC) متقدم
✅ Session Management (إنهاء الجلسات النشطة)
✅ IP Whitelisting للفروع
✅ PCI DSS Compliance للمدفوعات
✅ GDPR Compliance لحماية البيانات
```

### 15.8 🌐 التكاملات الخارجية (Integrations)

#### A. تكاملات المحاسبة
```
✅ QuickBooks
✅ Sage
✅ Xero
✅ Microsoft Dynamics
✅ SAP (Enterprise)
```

#### B. تكاملات التجارة الإلكترونية
```
✅ Shopify
✅ WooCommerce
✅ Magento
✅ Facebook Shop
✅ Instagram Shopping
```

#### C. تكاملات أخرى
```
✅ Slack/Teams للإشعارات
✅ Google Calendar للمواعيد
✅ Mailchimp للتسويق
✅ Twilio للـ SMS
✅ WhatsApp Business API
```

---

## 16. 📊 تحليل مقارن مع برامج POS الكبيرة

### 16.1 مقارنة مع Odoo POS

| الميزة | Smart POS | Odoo POS | التفوق |
|--------|-----------|----------|---------|
| السعر | مجاني/رخيص | غالي ($$$) | ✅ أفضل |
| التخصيص | سهل جداً | معقد | ✅ أفضل |
| الأداء | سريع (Vite) | ثقيل | ✅ أفضل |
| دعم RTL | أصلي | محدود | ✅ أفضل |
| التكامل المحلي | Fawry, Vodafone | محدود | ✅ أفضل |
| الوحدات الأخرى | يحتاج تطوير | جاهزة ERP | ⚠️ أقل |
| المجتمع | صغير | كبير | ⚠️ أقل |
| التوثيق | عربي/إنجليزي | إنجليزي فقط | ✅ أفضل |

**استراتيجية التنافس:** التركيز على السوق العربية + التخصيص السهل + الأداء العالي

### 16.2 مقارنة مع Square POS

| الميزة | Smart POS | Square POS | التفوق |
|--------|-----------|------------|---------|
| الاشتراك | مجاني | 2.6% + 10¢ | ✅ أفضل |
| الدعم المحلي | كامل | لا يوجد | ✅ أفضل |
| العملات | متعدد | USD فقط | ✅ أفضل |
| التقارير | متقدم | أساسي | ✅ أفضل |
| الهاردوير | عام | مخصص | ⚠️ أقل |
| التسويق | محدود | متكامل | ⚠️ أقل |

**استراتيجية التنافس:** التركيز على المخزون المتقدم + الدعم المحلي

### 16.3 مقارنة مع Loyverse POS

| الميزة | Smart POS | Loyverse | التفوق |
|--------|-----------|----------|---------|
| المخزون المتعدد | ✅ نعم | ✅ نعم | 🟰 متساوي |
| العملات المتعددة | ✅ نعم | ❌ لا | ✅ أفضل |
| الضرائب المركبة | ✅ نعم | ❌ لا | ✅ أفضل |
| التقارير المتقدمة | ✅ نعم | ⚠️ محدود | ✅ أفضل |
| التكاملات | كثيرة | قليلة | ✅ أفضل |

### 16.4 مقارنة مع برامج POS المحلية المصرية

| البرنامج | السعر | المخزون | الفروع | التكامل | مميزاتنا |
|----------|-------|---------|--------|---------|----------|
| Fatura | 500-2000/شهر | جيد | جيد | محدود | أرخص + أحدث تقنية |
| Qoyod | 300-1500/شهر | متوسط | لا | جيد | أفضل واجهة + أسرع |
| Edara | 400-1800/شهر | جيد | جيد | جيد | كود مفتوح + قابلية تخصيص |
| Dexef | 600-2500/شهر | ممتاز | ممتاز | جيد | أسهل استخدام |

**نقاط القوة الفريدة:**
1. كود مفتوح المصدر (يمكن التعديل)
2. تقنية حديثة (React + Vite + TypeScript)
3. تخصيص سريع
4. أداء عالي حتى على الأجهزة الضعيفة
5. دعم كامل للعربية والـ RTL

---

## 17. 🗺️ خارطة طريق التطوير (Roadmap)

### المرحلة 3: التأسيس (Q2 2026) - 3 أشهر
```
✅ نقل البيانات من mockData لـ Supabase
✅ نظام Auth كامل (JWT + RBAC)
✅ إضافة 5 مستويات صلاحيات
✅ نظام Audit Log
✅ Backup/Restore تلقائي
✅ PWA (يعمل Offline)
✅ تطبيق Desktop (Tauri)
✅ دمج Fawry Payment
```

### المرحلة 4: التوسع (Q3 2026) - 3 أشهر
```
✅ نظام الفروع المتعددة (Multi-branch Sync)
✅ نظام العملاء المتقدم (CRM)
✅ برنامج الولاء (Loyalty Points)
✅ نظام التقسيط والأقساط
✅ تطبيق موبايل للكاشير
✅ تطبيق موبايل للعملاء
✅ نظام الطلبات أونلاين
✅ نظام توصيل مع تتبع
```

### المرحلة 5: الذكاء (Q4 2026) - 3 أشهر
```
✅ AI Sales Forecasting
✅ Customer Behavior Analytics
✅ Automatic Reordering
✅ Smart Pricing Suggestions
✅ Chatbot للدعم الفني
✅ Voice Commands (أوامر صوتية)
✅ Advanced Reporting with AI Insights
```

### المرحلة 6: المؤسسات (Q1-Q2 2027) - 6 أشهر
```
✅ API للتكاملات الخارجية
✅ ERP Module (HR, Accounting, Procurement)
✅ Manufacturing Module (BOM, Production)
✅ E-commerce Integration Suite
✅ Franchise Management
✅ White-label Solution
✅ Cloud & On-premise Hybrid
```

---

## 18. 🎯 استراتيجية التسويق والمبيعات

### 18.1 الفئة المستهدفة (Target Market)
```
🏪 المتاجر الصغيرة والمتوسطة (10-50 موظف)
🍽️ المطاعم والكافيهات
🛒 السوبرماركت والهايبرماركت
💊 الصيدليات
📱 محلات الموبايل والإلكترونيات
👗 محلات الملابس والأزياء
```

### 18.2 نموذج التسعير (Pricing Model)
```
📦 Free Tier: مجاني للمستخدم الواحد
💎 Basic: 99 جنيه/شهر (3 مستخدمين)
⭐ Pro: 249 جنيه/شهر (10 مستخدمين + API)
🏢 Enterprise: 999 جنيه/شهر (غير محدود + دعم مخصص)
🎯 Custom: للشركات الكبيرة (تسعير حسب الطلب)
```

### 18.3 قنوات التسويق
```
📱 Social Media: Facebook, Instagram, TikTok
🎥 YouTube: Tutorials, Reviews
🤝 Partnerships: مع جهات محاسبية
🏢 Trade Shows: معارض التجزئة
📧 Email Marketing: للعملاء المحتملين
🗣️ Referral Program: عمولة للإحالات
```

---

## 19. ⚠️ المخاطر والتحديات وحلولها

| الخطر | الاحتمالية | التأثير | الحل |
|-------|------------|---------|------|
| منافسة كبيرة | عالية | متوسط | التخصص في السوق العربية |
| مشاكل تقنية | متوسطة | عالي | فريق دعم محترف + Monitoring |
| عدم قبول السوق | متوسطة | عالي | Free Trial + Onboarding |
| مشاكل قانونية | منخفضة | عالي | استشارة قانونية + Compliance |
| نمو سريع | متوسطة | عالي | Infrastructure قابل للتوسع |

---

## 20. 📈 مؤشرات النجاح (KPIs)

### Technical KPIs
```
⚡ Uptime: 99.9%
🚀 Page Load: < 2 seconds
🐛 Bug Rate: < 0.1%
🔄 Sync Speed: < 3 seconds
```

### Business KPIs
```
👥 Active Users: 1000+ في السنة الأولى
💰 MRR: 50,000 جنيه/شهر بعد سنة
⭐ NPS Score: > 50
🔄 Churn Rate: < 5% شهرياً
📈 Growth Rate: > 20% شهرياً
```

---

## 21. 🔧 المعمارية التقنية المستقبلية (Future Architecture)

### Backend (Microservices)
```
🟢 API Gateway (Kong/AWS API Gateway)
🟢 Auth Service (Node.js/Go)
🟢 Inventory Service (Node.js)
🟢 Sales Service (Node.js)
🟢 Analytics Service (Python + Pandas)
🟢 Notification Service (Node.js + Redis)
🟢 File Service (AWS S3/MinIO)
```

### Database
```
🟢 PostgreSQL (Main Database)
🟢 Redis (Cache + Sessions)
🟢 ClickHouse (Analytics Data)
🟢 Elasticsearch (Search)
🟢 MongoDB (Logs)
```

### Infrastructure
```
🟢 Docker + Kubernetes
🟢 AWS/GCP/Azure
🟢 CDN (CloudFlare)
🟢 CI/CD (GitHub Actions)
🟢 Monitoring (Datadog/Grafana)
```

---

## 22. 📚 الموارد والمراجع

### Documentation
- [React Documentation](https://react.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Tauri Documentation](https://tauri.app)

### Best Practices
- [OWASP Security](https://owasp.org)
- [PCI DSS](https://www.pcisecuritystandards.org)
- [GDPR Guidelines](https://gdpr.eu)

### Competitor Analysis
- [Odoo Documentation](https://www.odoo.com/documentation)
- [Square POS](https://squareup.com/us/en/pos)
- [Loyverse POS](https://loyverse.com)

---

## 23. 🔗 ربط أكثر من فرع في أماكن مختلفة (Multi-Branch Architecture)

### 23.1 المعمارية المقترحة

```
┌─────────────────────────────────────────────────────────────┐
│                     CENTRAL CLOUD SERVER                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │    Redis     │  │  Supabase    │      │
│  │   (Main DB)  │  │   (Cache)    │  │   (Realtime) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              API Gateway (Node.js/NestJS)             │   │
│  │         REST API + WebSocket + GraphQL                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
     ┌────────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
     │   Branch A    │ │   Branch B  │ │   Branch C  │
     │   (Cairo)     │ │  (Alex)     │ │  (Aswan)    │
     │               │ │             │ │             │
     │ ┌───────────┐ │ │ ┌───────────┐│ │ ┌───────────┐│
     │ │Local App  │ │ │ │Local App  ││ │ │Local App  ││
     │ │(Desktop)  │ │ │ │(Desktop)  ││ │ │(Desktop)  ││
     │ └───────────┘ │ │ └───────────┘│ │ └───────────┘│
     │               │ │             │ │             │
     │ ┌───────────┐ │ │ ┌───────────┐│ │ ┌───────────┐│
     │ │Local Cache│ │ │ │Local Cache││ │ │Local Cache││
     │ │ (SQLite)  │ │ │ │ (SQLite)  ││ │ │ (SQLite)  ││
     │ └───────────┘ │ │ └───────────┘│ │ └───────────┘│
     └───────────────┘ └─────────────┘ └─────────────┘
```

### 23.2 تقنيات الـ Sync

#### A. Real-time Sync (Supabase Realtime)
```typescript
// supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key',
  {
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// الاشتراك في تغييرات المخزون
const subscribeToInventory = (branchId: string, callback: Function) => {
  return supabase
    .channel(`inventory:${branchId}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'products' },
      (payload) => callback(payload)
    )
    .subscribe();
};

// الاشتراك في المبيعات
const subscribeToSales = (branchId: string, callback: Function) => {
  return supabase
    .channel(`sales:${branchId}`)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'invoices' },
      (payload) => callback(payload)
    )
    .subscribe();
};
```

#### B. Offline-First Sync (PocketBase)
```typescript
// pocketbaseSync.ts
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8090');

// تفعيل Offline Mode
const enableOfflineSync = async () => {
  // تخزين محلي
  const localDb = await openDB('smart-pos-db', 1, {
    upgrade(db) {
      db.createObjectStore('products', { keyPath: 'id' });
      db.createObjectStore('invoices', { keyPath: 'id' });
      db.createObjectStore('sync-queue', { keyPath: 'id', autoIncrement: true });
    }
  });

  // Sync عند عودة الإنترنت
  window.addEventListener('online', async () => {
    const queue = await localDb.getAll('sync-queue');
    for (const item of queue) {
      await syncToServer(item);
      await localDb.delete('sync-queue', item.id);
    }
  });
};
```

#### C. Conflict Resolution
```typescript
// conflictResolver.ts
interface ConflictResolution {
  strategy: 'last-write-wins' | 'first-write-wins' | 'merge' | 'manual';
  resolve: (local: any, remote: any) => any;
}

const resolveConflict = (
  localData: any, 
  remoteData: any, 
  strategy: ConflictResolution['strategy']
): any => {
  switch (strategy) {
    case 'last-write-wins':
      return new Date(localData.updatedAt) > new Date(remoteData.updatedAt) 
        ? localData 
        : remoteData;
    
    case 'first-write-wins':
      return new Date(localData.updatedAt) < new Date(remoteData.updatedAt)
        ? localData
        : remoteData;
    
    case 'merge':
      return {
        ...remoteData,
        ...localData,
        quantity: Math.max(localData.quantity, remoteData.quantity)
      };
    
    case 'manual':
      // إرسال للمدير للمراجعة
      notifyManagerOfConflict(localData, remoteData);
      return null;
  }
};
```

### 23.3 نقل المخزون بين الفروع

```typescript
// interBranchTransfer.ts
interface TransferRequest {
  id: string;
  fromBranchId: string;
  toBranchId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  status: 'pending' | 'in-transit' | 'received' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// إنشاء طلب نقل
const createTransfer = async (transfer: TransferRequest) => {
  // خصم من المخزن المصدر
  for (const item of transfer.items) {
    await deductFromWarehouse(transfer.fromBranchId, item.productId, item.quantity);
  }
  
  // إنشاء سجل النقل
  await supabase.from('transfers').insert(transfer);
  
  // إشعار الفرع المستلم
  await notifyBranch(transfer.toBranchId, {
    type: 'transfer-incoming',
    transferId: transfer.id
  });
};

// تأكيد الاستلام
const confirmTransfer = async (transferId: string) => {
  const { data: transfer } = await supabase
    .from('transfers')
    .select('*')
    .eq('id', transferId)
    .single();

  // إضافة للمخزن المستلم
  for (const item of transfer.items) {
    await addToWarehouse(transfer.toBranchId, item.productId, item.quantity);
  }
  
  // تحديث الحالة
  await supabase
    .from('transfers')
    .update({ status: 'received', updatedAt: new Date().toISOString() })
    .eq('id', transferId);
};
```

### 23.4 إعدادات الشبكة والـ Bandwidth

```typescript
// bandwidthOptimizer.ts
const syncConfig = {
  // أولويات الـ Sync
  priorities: {
    sales: 'high',      // فوري
    inventory: 'high',  // فوري
    customers: 'medium', // كل 5 دقائق
    reports: 'low',     // كل ساعة
  },
  
  // ضغط البيانات
  compression: true,
  
  // Batch Size
  batchSize: 100,
  
  // Retry Strategy
  retry: {
    attempts: 3,
    delay: 1000, // 1 second
    backoff: 'exponential'
  }
};

// Data Compression
const compressData = (data: any): string => {
  return LZString.compressToUTF16(JSON.stringify(data));
};

const decompressData = (compressed: string): any => {
  return JSON.parse(LZString.decompressFromUTF16(compressed));
};
```

---

## 24. 🔄 نقل البيانات من برامج المنافسة (Data Migration)

### 24.1 تحليل مصادر البيانات

| البرنامج | صيغة التصدير | الطريقة | التعقيد |
|----------|-------------|---------|---------|
| Excel/CSV | `.csv`, `.xlsx` | مباشر | سهل |
| Access | `.mdb`, `.accdb` | ODBC | متوسط |
| SQL Server | `.bak`, `.mdf` | Restore + Migration | صعب |
| Oracle | `.dmp` | Data Pump | صعب |
| MySQL | `.sql` | Import | متوسط |
| QuickBooks | `.qbb`, `.qbw` | API / SDK | صعب |
| Sage | `.001`, `.sdm` | Import Tool | متوسط |
| برامج محلية | قاعدة بيانات مخصصة | Reverse Engineering | صعب جداً |

### 24.2 ETL Pipeline (Extract-Transform-Load)

```typescript
// migrationPipeline.ts

// Step 1: Extract
interface DataExtractor {
  source: 'csv' | 'excel' | 'sql' | 'api';
  extract: (config: any) => Promise<any[]>;
}

const extractFromCSV = async (filePath: string): Promise<any[]> => {
  const Papa = await import('papaparse');
  return new Promise((resolve) => {
    Papa.parse(filePath, {
      header: true,
      complete: (results) => resolve(results.data)
    });
  });
};

const extractFromExcel = async (filePath: string): Promise<any[]> => {
  const XLSX = await import('xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet);
};

const extractFromSQL = async (connectionString: string, query: string): Promise<any[]> => {
  // using node-mssql or pg
  const sql = require('mssql');
  const pool = await sql.connect(connectionString);
  const result = await pool.request().query(query);
  return result.recordset;
};

// Step 2: Transform
interface DataTransformer {
  transform: (rawData: any[]) => Promise<TransformedData[]>;
  validate: (data: any) => ValidationResult;
}

interface TransformedData {
  products?: Product[];
  customers?: Customer[];
  invoices?: Invoice[];
  stockMovements?: StockMovement[];
}

const transformLegacyData = (rawData: any[]): TransformedData => {
  return {
    products: rawData.map(item => ({
      id: generateUUID(),
      name: item.product_name || item.ItemName,
      barcode: item.barcode || item.Barcode || generateBarcode(),
      price: parseFloat(item.price || item.SalePrice || 0),
      cost: parseFloat(item.cost || item.PurchasePrice || 0),
      stock: parseInt(item.stock || item.Qty || 0),
      // ... mapping آخر
    })),
    
    customers: rawData.map(item => ({
      id: generateUUID(),
      name: item.customer_name || item.CustName,
      phone: item.phone || item.Tel || '',
      balance: parseFloat(item.balance || item.Credit || 0),
    }))
  };
};

// Step 3: Validate
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

const validateData = (data: TransformedData): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // التحقق من المنتجات
  data.products?.forEach((product, index) => {
    if (!product.name) {
      errors.push({ row: index, field: 'name', message: 'اسم المنتج مطلوب' });
    }
    if (product.price < 0) {
      errors.push({ row: index, field: 'price', message: 'السعر لا يمكن أن يكون سالب' });
    }
    if (product.price < product.cost) {
      warnings.push({ row: index, field: 'price', message: 'سعر البيع أقل من سعر التكلفة' });
    }
  });
  
  return { isValid: errors.length === 0, errors, warnings };
};

// Step 4: Load
const loadToSupabase = async (data: TransformedData): Promise<MigrationResult> => {
  const results: MigrationResult = {
    products: { inserted: 0, failed: 0 },
    customers: { inserted: 0, failed: 0 },
    invoices: { inserted: 0, failed: 0 }
  };
  
  // إدخال المنتجات
  if (data.products) {
    const { error } = await supabase.from('products').insert(data.products);
    if (error) {
      results.products.failed += data.products.length;
    } else {
      results.products.inserted += data.products.length;
    }
  }
  
  // إدخال العملاء
  if (data.customers) {
    const { error } = await supabase.from('customers').insert(data.customers);
    if (error) {
      results.customers.failed += data.customers.length;
    } else {
      results.customers.inserted += data.customers.length;
    }
  }
  
  return results;
};
```

### 24.3 Mapping Tool (واجهة ربط الحقول)

```typescript
// fieldMapping.ts
interface FieldMapping {
  sourceField: string;
  targetField: string;
  transform?: (value: any) => any;
  required: boolean;
  defaultValue?: any;
}

const defaultMappings: Record<string, FieldMapping[]> = {
  products: [
    { sourceField: 'ItemName', targetField: 'name', required: true },
    { sourceField: 'Barcode', targetField: 'barcode', required: false, defaultValue: '' },
    { sourceField: 'SalePrice', targetField: 'price', required: true, transform: (v) => parseFloat(v) },
    { sourceField: 'PurchasePrice', targetField: 'cost', required: false, transform: (v) => parseFloat(v) },
    { sourceField: 'Qty', targetField: 'totalStock', required: false, transform: (v) => parseInt(v) || 0 },
  ],
  customers: [
    { sourceField: 'CustName', targetField: 'name', required: true },
    { sourceField: 'Tel', targetField: 'phone', required: false },
    { sourceField: 'Credit', targetField: 'balance', required: false, transform: (v) => parseFloat(v) || 0 },
  ],
  invoices: [
    { sourceField: 'BillNo', targetField: 'invoiceNumber', required: true },
    { sourceField: 'BillDate', targetField: 'date', required: true, transform: (v) => new Date(v).toISOString() },
    { sourceField: 'Total', targetField: 'total', required: true, transform: (v) => parseFloat(v) },
  ]
};

// UI Component للـ Mapping
const FieldMapper = ({ sourceFields, targetFields, onMapping }: FieldMapperProps) => {
  return (
    <div className="field-mapper">
      <h3>ربط الحقول</h3>
      {targetFields.map((target) => (
        <div key={target.name} className="mapping-row">
          <span>{target.label} ({target.name})</span>
          <select onChange={(e) => onMapping(target.name, e.target.value)}>
            <option value="">-- اختر الحقل المصدر --</option>
            {sourceFields.map((source) => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
          {target.required && <span className="required">*</span>}
        </div>
      ))}
    </div>
  );
};
```

### 24.4 Migration Wizard (معالج الاستيراد)

```typescript
// migrationWizard.ts
enum MigrationStep {
  SELECT_SOURCE = 1,
  UPLOAD_FILE = 2,
  MAP_FIELDS = 3,
  PREVIEW_DATA = 4,
  VALIDATE = 5,
  MIGRATE = 6,
  VERIFY = 7
}

const migrationWizard = {
  // Step 1: اختيار المصدر
  selectSource: async (sourceType: string, connectionConfig: any) => {
    switch (sourceType) {
      case 'csv':
        return { type: 'file', extensions: ['.csv'] };
      case 'excel':
        return { type: 'file', extensions: ['.xlsx', '.xls'] };
      case 'sql-server':
        return { type: 'database', config: connectionConfig };
      case 'quickbooks':
        return { type: 'api', sdk: 'quickbooks-sdk' };
    }
  },
  
  // Step 2: رفع الملف
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/migration/upload', {
      method: 'POST',
      body: formData
    });
    
    return response.json();
  },
  
  // Step 3: Preview
  previewData: async (fileId: string, limit: number = 10) => {
    const response = await fetch(`/api/migration/preview?fileId=${fileId}&limit=${limit}`);
    return response.json();
  },
  
  // Step 4: تنفيذ الـ Migration
  executeMigration: async (fileId: string, mappings: FieldMapping[]) => {
    const response = await fetch('/api/migration/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId, mappings })
    });
    
    return response.json();
  },
  
  // Step 5: Verification
  verifyMigration: async (migrationId: string) => {
    const response = await fetch(`/api/migration/verify?migrationId=${migrationId}`);
    return response.json();
  }
};
```

### 24.5 خطوات الـ Migration الموصى بها

```
1. Analysis Phase (يوم 1)
   ├── فحص البيانات المصدر
   ├── تحديد الحقول المقابلة
   └── تقييم جودة البيانات

2. Preparation Phase (يوم 2)
   ├── تنظيف البيانات
   ├── إزالة التكرارات
   └── تصحيح الأخطاء

3. Test Migration (يوم 3)
   ├── Migration على بيانات تجريبية
   ├── التحقق من النتائج
   └── تعديل الـ Mapping إذا لزم

4. Production Migration (يوم 4)
   ├── نسخ احتياطي للبيانات الأصلية
   ├── تنفيذ الـ Migration
   └── التحقق النهائي

5. Post-Migration (يوم 5)
   ├── تدريب المستخدمين
   ├── دعم فني مكثف
   └── متابعة الأداء
```

### 24.6 أدوات الـ Migration

```typescript
// package.json dependencies
{
  "dependencies": {
    "papaparse": "^5.4.1",           // CSV Parsing
    "xlsx": "^0.18.5",               // Excel Reading
    "mssql": "^10.0.1",              // SQL Server
    "pg": "^8.11.3",                 // PostgreSQL
    "mysql2": "^3.6.5",              // MySQL
    "lodash": "^4.17.21",            // Data Manipulation
    "uuid": "^9.0.1",                // UUID Generation
    "date-fns": "^3.0.6",            // Date Formatting
    "validator": "^13.11.0"          // Data Validation
  }
}
```

---

## 25. 📱 تحويل لـ Desktop Application (Tauri)

### 25.1 إعداد Tauri

```bash
# تثبيت Tauri CLI
npm install --save-dev @tauri-apps/cli

# إنشاء تطبيق Tauri
npx tauri init

# بناء التطبيق
npx tauri build
```

### 25.2 تكوين Tauri (tauri.conf.json)

```json
{
  "build": {
    "beforeBuildCommand": "npm run build",
    "beforeDevCommand": "npm run dev",
    "devPath": "http://localhost:5173",
    "distDir": "../dist"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "shell": {
        "all": false,
        "open": true
      },
      "fs": {
        "all": true,
        "readFile": true,
        "writeFile": true
      },
      "http": {
        "all": true,
        "request": true
      }
    },
    "windows": [
      {
        "title": "Smart POS",
        "width": 1400,
        "height": 900,
        "minWidth": 1200,
        "minHeight": 700,
        "fullscreen": false,
        "resizable": true
      }
    ]
  }
}
```

### 25.3 Local Database (SQLite)

```typescript
// tauriSQLite.ts
import Database from 'tauri-plugin-sql-api';

const db = await Database.load('sqlite:smartpos.db');

// إنشاء الجداول
await db.execute(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER DEFAULT 0
  )
`);

// CRUD Operations
export const localDB = {
  getProducts: async () => {
    return await db.select('SELECT * FROM products');
  },
  
  addProduct: async (product: Product) => {
    await db.execute(
      'INSERT INTO products (id, name, price, stock) VALUES (?, ?, ?, ?)',
      [product.id, product.name, product.price, product.stock]
    );
  },
  
  syncWithCloud: async () => {
    const localProducts = await db.select('SELECT * FROM products WHERE synced = 0');
    
    for (const product of localProducts) {
      await supabase.from('products').upsert(product);
      await db.execute('UPDATE products SET synced = 1 WHERE id = ?', [product.id]);
    }
  }
};
```

---

**نهاية التوثيق الشامل**
**الإصدار:** 4.0 - التفاصيل التقنية الكاملة
**تاريخ التحديث:** 22 مارس 2026

---

## 26. 🔧 تفاصيل تقنية إضافية (Advanced Technical Details)

### 26.1 معمارية ربط الفروع بالتفصيل

#### A. Server-Client Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     CLOUD SERVER (AWS/GCP)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │    Redis     │  │  Load Balancer│      │
│  │   (Primary)  │  │   (Cache)    │  │   (Nginx/HAProxy)    │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              API Layer (Node.js/Express)              │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │   │
│  │  │  Auth   │ │Inventory│ │  Sales  │ │ Reports │      │   │
│  │  │ Service │ │ Service │ │ Service │ │ Service │      │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
     ┌────────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
     │   Branch A    │ │   Branch B  │ │   Branch C  │
     │   (Desktop)   │ │  (Desktop)  │ │  (Desktop)  │
     │  + SQLite     │ │  + SQLite   │ │  + SQLite   │
     └───────────────┘ └─────────────┘ └─────────────┘
```

#### B. Change Data Capture (CDC) للـ Sync
```typescript
// changeDataCapture.ts
interface ChangeEvent {
  table: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  data: any;
  timestamp: string;
  branchId: string;
  sequenceNumber: number;
}

class ChangeDataCapture {
  private sequenceNumber = 0;
  private eventQueue: ChangeEvent[] = [];

  captureChange(table: string, operation: string, data: any) {
    const event: ChangeEvent = {
      table,
      operation: operation as any,
      data,
      timestamp: new Date().toISOString(),
      branchId: getCurrentBranchId(),
      sequenceNumber: ++this.sequenceNumber
    };
    
    this.eventQueue.push(event);
    
    // Sync فوري للأحداث المهمة
    if (table === 'invoices' || table === 'inventory') {
      this.syncImmediately(event);
    }
  }

  private async syncImmediately(event: ChangeEvent) {
    await fetch('/api/sync/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
  }
}
```

#### C. Automatic Failover للـ Sync
```typescript
// syncFailover.ts
class SyncFailoverManager {
  private retryAttempts = 0;
  private maxRetries = 5;
  private offlineQueue: any[] = [];

  async syncWithRetry(data: any) {
    try {
      await this.attemptSync(data);
      this.retryAttempts = 0; // Reset on success
    } catch (error) {
      this.retryAttempts++;
      
      if (this.retryAttempts <= this.maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, this.retryAttempts) * 1000;
        await this.sleep(delay);
        await this.syncWithRetry(data);
      } else {
        // Store locally for later sync
        this.offlineQueue.push(data);
        this.notifyOfflineMode();
      }
    }
  }

  private async attemptSync(data: any) {
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Sync failed');
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 26.2 استراتيجيات Migration متقدمة

#### A. Incremental Migration
```typescript
// incrementalMigration.ts
class IncrementalMigration {
  private batchSize = 1000;
  private lastSyncTimestamp: Date;

  async migrateIncrementally(sourceConfig: any, targetConfig: any) {
    let offset = 0;
    let hasMore = true;
    
    while (hasMore) {
      const batch = await this.extractBatch(sourceConfig, offset);
      
      if (batch.length === 0) {
        hasMore = false;
        break;
      }
      
      const transformed = await this.transformBatch(batch);
      await this.loadBatch(targetConfig, transformed);
      
      offset += this.batchSize;
      
      // Update progress
      this.reportProgress(offset, batch.length);
    }
  }

  private async extractBatch(config: any, offset: number) {
    const query = `
      SELECT * FROM products 
      WHERE updated_at > $1 
      ORDER BY updated_at 
      LIMIT $2 OFFSET $3
    `;
    
    return await this.executeQuery(config, query, [
      this.lastSyncTimestamp,
      this.batchSize,
      offset
    ]);
  }
}
```

#### B. Parallel Migration للملفات الكبيرة
```typescript
// parallelMigration.ts
import { Worker } from 'worker_threads';

class ParallelMigration {
  private workerCount = 4;

  async migrateLargeFile(filePath: string) {
    const fileSize = await this.getFileSize(filePath);
    const chunkSize = Math.ceil(fileSize / this.workerCount);
    
    const workers: Promise<any>[] = [];
    
    for (let i = 0; i < this.workerCount; i++) {
      const start = i * chunkSize;
      const end = Math.min((i + 1) * chunkSize, fileSize);
      
      workers.push(this.createWorker(filePath, start, end));
    }
    
    await Promise.all(workers);
  }

  private createWorker(filePath: string, start: number, end: number) {
    return new Promise((resolve, reject) => {
      const worker = new Worker('./migrationWorker.js', {
        workerData: { filePath, start, end }
      });
      
      worker.on('message', resolve);
      worker.on('error', reject);
    });
  }
}
```

#### C. Migration Validation Suite
```typescript
// migrationValidation.ts
class MigrationValidator {
  async validateMigration(source: any, target: any) {
    const checks = [
      this.validateRecordCount(source, target),
      this.validateDataIntegrity(target),
      this.validateRelationships(target),
      this.validateCalculations(target)
    ];
    
    const results = await Promise.all(checks);
    
    return {
      isValid: results.every(r => r.passed),
      checks: results,
      summary: this.generateSummary(results)
    };
  }

  private async validateRecordCount(source: any, target: any) {
    const sourceCount = await source.count('products');
    const targetCount = await target.count('products');
    
    return {
      name: 'Record Count',
      passed: sourceCount === targetCount,
      details: `Source: ${sourceCount}, Target: ${targetCount}`
    };
  }

  private async validateDataIntegrity(target: any) {
    const orphans = await target.query(`
      SELECT * FROM invoice_items ii
      LEFT JOIN invoices i ON ii.invoice_id = i.id
      WHERE i.id IS NULL
    `);
    
    return {
      name: 'Data Integrity',
      passed: orphans.length === 0,
      details: `Orphan records: ${orphans.length}`
    };
  }
}
```

### 26.3 تحويل Desktop Application بالتفصيل

#### A. Tauri مع SQLite Local
```typescript
// desktopDatabase.ts
import Database from 'tauri-plugin-sql-api';

class DesktopDatabase {
  private db: Database;

  async initialize() {
    this.db = await Database.load('sqlite:smartpos.db');
    
    // إنشاء الجداول
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        stock INTEGER DEFAULT 0,
        synced INTEGER DEFAULT 0,
        last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS sync_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT,
        record_id TEXT,
        operation TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_products_synced ON products(synced);
    `);
  }

  async syncWithCloud() {
    const unsynced = await this.db.select(`
      SELECT * FROM products WHERE synced = 0 LIMIT 100
    `);
    
    for (const record of unsynced) {
      try {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record)
        });
        
        await this.db.execute(
          'UPDATE products SET synced = 1 WHERE id = ?',
          [record.id]
        );
      } catch (error) {
        console.error('Sync failed for record:', record.id);
      }
    }
  }
}
```

#### B. Auto-Updater للـ Desktop App
```typescript
// autoUpdater.ts
import { checkUpdate, installUpdate } from '@tauri-apps/api/updater';
import { relaunch } from '@tauri-apps/api/process';

class AutoUpdater {
  async checkForUpdates() {
    try {
      const { shouldUpdate, manifest } = await checkUpdate();
      
      if (shouldUpdate) {
        // إشعار المستخدم بالتحديث
        const userConsent = await this.showUpdateDialog(manifest);
        
        if (userConsent) {
          await installUpdate();
          await relaunch();
        }
      }
    } catch (error) {
      console.error('Update check failed:', error);
    }
  }

  private async showUpdateDialog(manifest: any) {
    // Show Tauri dialog or custom UI
    return confirm(`
      تحديث جديد متاح: v${manifest.version}
      
      التغييرات:
      ${manifest.body}
      
      هل تريد التحديث الآن؟
    `);
  }
}
```

### 26.4 أفضل الممارسات للأمان

#### A. Encryption للبيانات الحساسة
```typescript
// encryption.ts
import { encrypt, decrypt } from 'tauri-plugin-crypto-api';

class DataEncryption {
  private key: string;

  async encryptSensitiveData(data: string) {
    return await encrypt(data, this.key);
  }

  async decryptSensitiveData(encryptedData: string) {
    return await decrypt(encryptedData, this.key);
  }

  // تشفير كلمات المرور
  async hashPassword(password: string) {
    const salt = await generateSalt();
    const hash = await pbkdf2(password, salt, 100000);
    return { hash, salt };
  }
}
```

#### B. Session Management
```typescript
// sessionManager.ts
class SessionManager {
  private sessions: Map<string, Session> = new Map();

  createSession(userId: string, deviceInfo: any) {
    const session: Session = {
      id: generateUUID(),
      userId,
      deviceInfo,
      createdAt: new Date(),
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 hours
    };
    
    this.sessions.set(session.id, session);
    return session;
  }

  validateSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    
    if (!session) return { valid: false, reason: 'not_found' };
    if (new Date() > session.expiresAt) {
      this.sessions.delete(sessionId);
      return { valid: false, reason: 'expired' };
    }
    
    session.lastActivity = new Date();
    return { valid: true, session };
  }

  terminateAllUserSessions(userId: string) {
    for (const [id, session] of this.sessions) {
      if (session.userId === userId) {
        this.sessions.delete(id);
      }
    }
  }
}
```

---

**نهاية التوثيق التقني التفصيلي**
**الإصدار:** 4.1 - تفاصيل تقنية متقدمة
**تاريخ التحديث:** 22 مارس 2026
