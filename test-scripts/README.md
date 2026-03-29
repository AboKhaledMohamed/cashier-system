# دليل استخدام ملفات الاختبار

## الملفات المُنشأة

| الملف | الاستخدام | طريقة التشغيل |
|-------|-----------|---------------|
| `test-debt-system.js` | اختبار نظام الديون تلقائياً | `node test-scripts/test-debt-system.js` |
| `test-queries.sql` | استعلامات SQL للتحقق | شغّل في SQLite browser أو CLI |
| `manual-test-checklist.md` | قائمة اختبار يدوي | اطبع واستخدم أثناء الاختبار |
| `validate-ipc-handlers.js` | اختبار جميع Handlers | `node test-scripts/validate-ipc-handlers.js` |
| `security-owasp-test.js` | اختبار أمان OWASP Top 10 | `node test-scripts/security-owasp-test.js` |

---

## الاختبار التلقائي (الأسرع)

```bash
# 1. اختبار نظام الديون كاملاً
node test-scripts/test-debt-system.js

# 2. اختبار جميع IPC Handlers
node test-scripts/validate-ipc-handlers.js

# 3. اختبار أمان OWASP Top 10 (Penetration Testing)
node test-scripts/security-owasp-test.js
```

**النتيجة المتوقعة:**
```
========================================
اختبار نظام الديون - Debt System Test
========================================

[TEST 1] إنشاء عميل اختبار...
✓ العميل: عميل اختبار | الرصيد: 500

[TEST 2] محاكاة بيع آجل...
✓ بعد البيع: 700 | المتوقع: 700

[TEST 3] محاكاة تحصيل دين...
✓ بعد التحصيل: 400 | المتوقع: 400

[TEST 4] التحقق من إجمالي الديون...
✓ إجمالي ديون العملاء: 1500.50

[TEST 5] التحقق من الفواتير الآجلة...
✓ عدد الفواتير الآجلة للعميل: 1

✓ جميع الاختبارات نجحت!
```

---

## الاختبار بالـ SQL

### الطريقة 1: DB Browser for SQLite (أسهل)
1. حمّل `database.db` في البرنامج
2. افتح تبويب "Execute SQL"
3. انسخ محتوى `test-queries.sql`
4. اضغط F5 (أو ▶️)

### الطريقة 2: VS Code Extension
1. ثبّت إضافة "SQLite Viewer" أو "SQLite"
2. افتح ملف `database.db`
3. شغّل الاستعلامات من `test-queries.sql`

### الطريقة 3: سطر الأوامر
```bash
# لو كان sqlite3 مثبتاً
cd test-scripts
sqlite3 ..\database.db < test-queries.sql
```

---

## اختبار الأمان (OWASP Top 10 2021/2025)

**اختبار شامل للثغرات الأمنية:**

```bash
# تثبيت better-sqlite3 لو لم يكن مثبتاً
npm install better-sqlite3

# تشغيل اختبار الأمان
node test-scripts/security-owasp-test.js
```

**ما يتم اختباره:**

| OWASP | الوصف | الاختبارات |
|-------|-------|------------|
| A01 | Broken Access Control | التحقق من صلاحيات الوصول، SQL Injection |
| A02 | Cryptographic Failures | كلمات المرور المخزنة، تشفير البيانات |
| A03 | Injection | SQL Injection payloads، Dynamic SQL |
| A04 | Insecure Design | Business logic flaws، Negative balances |
| A05 | Security Misconfiguration | Default configs، Test accounts |
| A06 | Vulnerable Components | Dependencies versions |
| A07 | Authentication Failures | Password policies، Failed logins |
| A08 | Data Integrity | Orphaned records، Balance consistency |
| A09 | Logging Failures | Audit coverage، Sensitive data in logs |
| A10 | SSRF / Exceptions | Error handling، URL validation |

**النتيجة:**
```
============================================================
SMARTPOS OWASP TOP 10 SECURITY TEST SUITE
============================================================

[A01] Broken Access Control
✓ Default Admin Account: Password policy enforced
✓ Input Validation: Malicious input rejected
⚠ IDOR Check: Verify authorization checks

[A02] Cryptographic Failures
✓ Password Storage: No plaintext passwords detected
⚠ Database Encryption: Verify file encryption at rest

... (more tests)

Severity Summary:
  CRITICAL: 0
  HIGH: 2
  MEDIUM: 5
  LOW: 3
  INFO: 12

Detailed report saved to: security-report.json
```

---

## الاختبار اليدوي (الأشمل)

1. **افتح الملف:** `manual-test-checklist.md`
2. **اطبع القائمة** أو اتركها مفتوحة
3. **نفذ كل اختبار** واحداً تلو الآخر
4. **ضع علامة ✓** أو ✗ لكل اختبار
5. **سجل الملاحظات** في العمود الأخير

---

## سيناريوهات الاختبار المقترحة

### السيناريو 1: عميل جديد
```
1. أنشئ عميل جديد
2. بيع آجل: 500
3. تحقق من Dashboard ← يجب يزيد ديون العملاء 500
4. تحقق من صفحة العملاء ← يجب يظهر 500
5. تحصيل: 200
6. تحقق ← الرصيد يصبح 300
```

### السيناريو 2: مورد
```
1. أنشئ مورد جديد
2. شراء آجل: 1000
3. تحقق من ديون الموردين ← 1000
4. سداد: 400
5. تحقق ← الرصيد يصبح 600
```

### السيناريو 3: إلغاء فاتورة
```
1. تابع عميل (الرصيد: 300)
2. بيع آجل: 200
3. تحقق ← الرصيد: 500
4. ألغِ الفاتورة
5. تحقق ← الرصيد يعود 300
```

---

## إنشاء ملف تقرير

بعد الانتهاء من الاختبار، أنشئ ملف نتائج:

```bash
cd test-scripts
node test-debt-system.js > test-results.txt 2>&1
```

أو لاختبار شامل:
```bash
node validate-ipc-handlers.js > full-validation.txt 2>&1
```

---

## استكشاف الأخطاء

### المشكلة: `better-sqlite3` غير مثبت
**الحل:**
```bash
npm install better-sqlite3 --save-dev
```

### المشكلة: لا يمكن فتح قاعدة البيانات
**الحل:**
- تأكد أن البرنامج الرئيسي مغلق (لا يمكن فتح DB مرتين)
- تحقق من المسار: `%LOCALAPPDATA%\smartpos\smartpos.db`

### المشكلة: خطأ في SQL syntax
**الحل:**
- افتح SQL في DB Browser وشغّل سطر بسطر
- تأكد من `;` في نهاية كل استعلام

---

## SQL مفيد للتصحيح

```sql
-- عرض آخر 5 عمليات
SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 5;

-- عرض ديون العملاء
SELECT name, current_balance, credit_used, total_paid 
FROM customers WHERE current_balance > 0;

-- عرض فواتير اليوم الآجلة
SELECT invoice_number, customer_name, credit_amount, total
FROM invoices 
WHERE date = date('now') AND payment_method = 'آجل';

-- عرض تحصيلات اليوم
SELECT party_name, amount, method
FROM payments 
WHERE date = date('now') AND payment_direction = 'تحصيل';
```

---

**تاريخ الإنشاء:** 2026-03-29  
**الإصدار:** 1.0
