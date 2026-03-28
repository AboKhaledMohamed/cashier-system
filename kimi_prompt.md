
# 🎯 مهمتك الكاملة — تعديل صفحات نظام الكاشير الذكي

أنت مطور React/TypeScript متقدم. مهمتك تعديل صفحات مشروع موجود بالكامل بناءً على المتطلبات الجديدة التالية.

---

## 📌 1. نظرة عامة على المشروع

**اسم المشروع:** نظام الكاشير الذكي — نسخة المحلات الصغيرة  
**Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Radix UI  
**قاعدة البيانات:** SQLite محلية (offline كامل — بدون نت بالمرة)  
**النطاق:** فرع واحد فقط، مخزن واحد فقط، بدون أي cloud أو sync

**⚠️ قواعد صارمة لا تخالفها:**
- لا `fetch()` لأي API خارجي — كل البيانات من SQLite محلي
- لا Supabase — لا Firebase — لا أي cloud service
- لا multi-branch — لا multi-warehouse
- كل البيانات تُقرأ وتُكتب محلياً عبر IPC أو SQLite driver
- المشروع يعمل offline 100% بدون استثناء

---

## 📌 2. نوع العملاء المستهدفين

البرنامج عام لأي محل صغير بغض النظر عن نوع المنتجات:
- بقالة / سوبرماركت صغير
- محل ملابس / أحذية
- صيدلية صغيرة
- مخبز / حلواني
- محل أجهزة كهربائية
- أي محل تجاري صغير آخر

**المنتجات:** أي نوع — أكل، ملابس، أجهزة، أدوية، خامات...  
**المشترك بينهم:** فرع واحد + offline + مخزن واحد + 3 مستخدمين فقط

---

## 📌 3. الـ TypeScript Interfaces الجديدة (المرجع الوحيد للبيانات)

استخدم الـ interfaces دي كمرجع وحيد لكل البيانات في الصفحات.  
**لا تستخدم أي interface قديم يخالفها.**

```typescript
[هنا الـ interfaces الكاملة من ملف small-shop.types.ts]
```

---

## 📌 4. هيكل الصفحات المطلوب

### الصفحات الموجودة (تحتاج تعديل):

| الصفحة | الملف | التعديلات المطلوبة |
|--------|-------|-------------------|
| POS / البيع | `POSPage.tsx` | استخدام `Cart` و`CartItem` interfaces الجديدة — إزالة multi-warehouse — إضافة دعم نقاط الولاء |
| المخزون | `InventoryPage.tsx` | مخزن واحد فقط — إزالة `warehouseStock` record — استخدام `product.stock` مباشرة |
| العملاء | `CustomersPage.tsx` | إضافة `credit_used` / `credit_available` / `trust_score` / `trust_level` |
| الموردون | `SuppliersPage.tsx` | تبسيط — إزالة خصائص enterprise |
| المشتريات | `PurchasesPage.tsx` | استخدام `Purchase` interface الجديد |
| التقارير | `ReportsPage.tsx` | استخدام `DailySummary` و`ReportFilters` |
| الإعدادات | `SettingsPage.tsx` | استخدام `ShopSettings` interface — إزالة إعدادات الفروع |
| المستخدمين | `UsersPage.tsx` | 3 أدوار فقط — صلاحيات ثابتة بدون JSON |

### الصفحات الجديدة (تحتاج إنشاء):

| الصفحة | الملف | الوصف |
|--------|-------|-------|
| جلسة الكاشير | `CashSessionPage.tsx` | فتح/إغلاق الصندوق اليومي مع الإجماليات |
| المصاريف | `ExpensesPage.tsx` | تسجيل المصاريف التشغيلية |
| المرتجعات | `ReturnsPage.tsx` | استرجاع منتجات مع تحديث المخزون |
| الجرد | `InventoryAdjustmentPage.tsx` | جرد يدوي وتعديل الكميات |
| الإشعارات | `NotificationsPage.tsx` | تنبيهات نقص مخزون وانتهاء صلاحية |

---

## 📌 5. تعديلات جوهرية لكل صفحة

### POSPage.tsx
```
✅ استخدم Cart interface مع readonly computed fields
✅ دعم نقاط الولاء (points_to_redeem → points_discount)
✅ طرق دفع: نقدي | آجل | شبكة | فودافون_كاش | انستاباي
✅ البحث بالاسم أو الباركود (barcode + barcode_alt)
✅ احسب tax_amount لكل بند بناءً على tax_override أو ShopSettings.tax_rate
✅ تعليق الفاتورة (hold) والرجوع إليها
✅ اطبع الإيصال بعرض 58mm أو 80mm أو A4 حسب ShopSettings
❌ احذف أي dropdown للمخازن
❌ احذف أي dropdown للفروع
❌ لا fetch() لأي endpoint
```

### InventoryPage.tsx
```
✅ استخدم product.stock (رقم واحد مش Record)
✅ اعرض تنبيه لو stock <= stock_alert
✅ اعرض تنبيه لو expiry_date قريبة (خلال expiry_alert_days أيام)
✅ فلتر: تصنيف | حالة المخزون | قريب الانتهاء
✅ زر "تعديل المخزون" يفتح InventoryAdjustment modal
❌ احذف كل كلام عن warehouses متعددة
❌ احذف warehouseStock من أي مكان
```

### CustomersPage.tsx
```
✅ اعرض credit_used وcredit_available بوضوح
✅ اعرض trust_level كـ badge (ممتاز=أخضر | جيد=أزرق | متوسط=برتقالي | ضعيف=أحمر)
✅ اعرض neighborhood / building في كارت العميل
✅ زر "تحصيل دين" يفتح Payment modal ويسجل في payments table
✅ تحذير واضح لو current_balance > credit_limit
✅ is_blacklisted → منع البيع الآجل تلقائياً في POS
```

### CashSessionPage.tsx (جديدة)
```
✅ زر "فتح الصندوق" يسجل opening_balance
✅ أثناء الجلسة: اعرض total_sales_cash | total_sales_credit | total_expenses | total_collections
✅ زر "إغلاق الصندوق" يحسب expected_balance والـ difference
✅ لون الـ difference: أخضر لو 0، أحمر لو عجز، أصفر لو زيادة
✅ منع فتح جلستين في نفس الوقت
```

### ReportsPage.tsx
```
✅ تقرير يومي باستخدام DailySummary interface
✅ فلاتر باستخدام ReportFilters interface
✅ export PDF للإيصالات والتقارير (محلي بدون server)
✅ تقرير المخزون مع InventoryReport interface
✅ تقرير الديون: عملاء + أرصدة + آخر دفعة
❌ لا تقارير ضريبية VAT معقدة
❌ لا ميزانية عمومية
❌ لا تقارير multi-branch
```

### SettingsPage.tsx
```
✅ استخدم ShopSettings interface كاملاً
✅ قسم: بيانات المحل (الاسم، الشعار، الهاتف)
✅ قسم: إعدادات الطابعة (58mm / 80mm / A4)
✅ قسم: الضريبة (نعم/لا + النسبة + شاملة/مضافة)
✅ قسم: نقاط الولاء (تفعيل + معادلة النقاط)
✅ قسم: النسخ الاحتياطي (مسار الحفظ + جدول التلقائي)
✅ قسم: التنبيهات (حد المخزون + أيام انتهاء الصلاحية)
❌ احذف إعدادات الفروع بالكامل
❌ احذف إعدادات الـ sync والـ cloud
```

---

## 📌 6. قواعد الكود العامة

### إدارة البيانات
```typescript
// ✅ الصح — قراءة من SQLite محلي
const products = await window.db.query('SELECT * FROM products WHERE is_active = 1');

// ❌ الغلط — لا fetch
const products = await fetch('/api/products');
```

### حساب المخزون
```typescript
// ✅ الصح
const stock = product.stock;

// ❌ الغلط
const stock = product.warehouseStock[warehouseId];
```

### الصلاحيات
```typescript
// ✅ الصح — صلاحيات ثابتة
if (!currentSession.can_apply_discount) { ... }

// ❌ الغلط — JSON permissions معقدة
if (!user.custom_permissions?.discount?.apply) { ... }
```

### Mock Data للتطوير
لو محتاج mock data لحد ما تربط الـ SQLite، استخدم الشكل ده:
```typescript
// src/app/data/mockData.ts
import type { Product, Customer, ... } from '../types/small-shop.types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'منتج تجريبي',
    barcode: '1234567890',
    price: 25.50,
    cost: 18.00,
    unit: 'قطعة',
    category_id: '1',
    stock: 150,
    stock_alert: 20,
    expiry_alert_days: 30,
    product_type: 'قطعة',
    storage_type: 'عادي',
    is_daily_production: false,
    pos_order: 1,
    is_active: true,
    is_service: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];
```

---

## 📌 7. ترتيب التنفيذ المقترح

1. **أول حاجة:** حدّث `src/app/types/small-shop.types.ts` بالـ interfaces المرفقة
2. **تاني:** عدّل `mockData.ts` يتطابق مع الـ interfaces الجديدة
3. **تالت:** عدّل `POSPage.tsx` (الأهم)
4. **رابع:** عدّل `InventoryPage.tsx`
5. **خامس:** أنشئ `CashSessionPage.tsx`
6. **سادس:** أنشئ `ExpensesPage.tsx`
7. **سابع:** عدّل باقي الصفحات بنفس المنطق

---

## 📌 8. ما لا تلمسه

- لا تغيّر في `vite.config.ts` أو `tailwind.config.js` أو `tsconfig.json`
- لا تغيّر في مكونات الـ UI الأساسية (`Button.tsx`, `Input.tsx`, `KPICard.tsx`)
- لا تغيّر في `Layout.tsx` أو `Sidebar.tsx` إلا لو محتاج تضيف صفحة جديدة للـ routes
- لا تتعامل مع أي ملف خارج `src/app/`

---

## 📌 9. التسليم المطلوب

لكل صفحة بعتها ليك:
1. **الكود الكامل المعدّل** — مش diff، الملف كامل
2. **قائمة التغييرات** — bullet points بما اتغير وليه
3. **أي type جديد** محتجه وموجود في الـ interfaces

ابدأ بـ `POSPage.tsx` أول حاجة وانتظر موافقتي قبل ما تكمل.

---

*المرفقات:*
- `small-shop.types.ts` ← الـ interfaces الكاملة
- `docs.md` ← توثيق المشروع الأصلي
- كود كل صفحة على حدة
