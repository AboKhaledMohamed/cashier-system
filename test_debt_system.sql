-- ============================================
-- SQL Test Scripts - التحقق من نظام الديون
-- ============================================

-- 1. إنشاء عميل اختبار
INSERT OR IGNORE INTO customers (id, name, phone, current_balance, credit_used, total_debts, total_paid, is_active)
VALUES ('test-customer-001', 'عميل اختبار', '01000000000', 500, 500, 500, 0, 1);

-- 2. التحقق من حالة العميل قبل الاختبار
SELECT 'قبل الاختبار' as stage, id, name, current_balance, credit_used, total_debts, total_paid 
FROM customers WHERE id = 'test-customer-001';

-- 3. محاكاة فاتورة آجلة (يمكنك تعديل القيم)
-- بعد إنشاء الفاتورة من البرنامج، نفذ هذا للتحقق:
SELECT 
  'بعد إنشاء فاتورة آجلة' as stage,
  i.invoice_number,
  i.total,
  i.credit_amount,
  i.payment_method,
  c.current_balance as new_balance,
  (c.current_balance - i.credit_amount) as expected_old_balance
FROM invoices i
JOIN customers c ON i.customer_id = c.id
WHERE c.id = 'test-customer-001' 
AND i.payment_method = 'آجل'
ORDER BY i.created_at DESC
LIMIT 1;

-- 4. التحقق من التحديث الصحيح
SELECT 
  'التحقق من الدين' as check_type,
  current_balance = 500 + (SELECT credit_amount FROM invoices WHERE customer_id = 'test-customer-001' ORDER BY created_at DESC LIMIT 1) as is_correct
FROM customers WHERE id = 'test-customer-001';

-- 5. محاكاة تحصيل دين
-- بعد تسجيل دفعة من صفحة المدفوعات:
SELECT 
  'بعد التحصيل' as stage,
  p.amount as collected_amount,
  c.current_balance as balance_after,
  (c.current_balance + p.amount) as expected_before
FROM payments p
JOIN customers c ON p.party_id = c.id
WHERE p.party_id = 'test-customer-001'
AND p.payment_direction = 'تحصيل'
ORDER BY p.created_at DESC
LIMIT 1;

-- 6. التحقق من إجمالي ديون العملاء في Dashboard
SELECT 
  'إحصائيات Dashboard' as source,
  COALESCE(SUM(current_balance), 0) as total_customer_debt,
  COUNT(*) as debtors_count
FROM customers WHERE is_active = 1 AND current_balance > 0;

-- 7. التحقق من فواتير اليوم الآجلة
SELECT 
  'فواتير اليوم الآجلة' as source,
  COUNT(*) as count,
  COALESCE(SUM(credit_amount), 0) as total_credit
FROM invoices 
WHERE date = date('now') 
AND payment_method = 'آجل' 
AND invoice_type = 'بيع' 
AND status = 'مكتمل';

-- 8. التحقق من سجل المدفوعات لليوم
SELECT 
  'تحصيلات اليوم' as source,
  COALESCE(SUM(amount), 0) as total_collections
FROM payments 
WHERE date = date('now') 
AND party_type = 'customer' 
AND payment_direction = 'تحصيل';

-- 9. التحقق من ديون الموردين
SELECT 
  'ديون الموردين' as source,
  COALESCE(SUM(current_balance), 0) as total_supplier_debt
FROM suppliers WHERE is_active = 1;

-- 10. تقرير كامل للمدينين
SELECT 
  c.name,
  c.phone,
  c.current_balance,
  c.total_purchases,
  c.last_purchase_date,
  (SELECT COUNT(*) FROM invoices WHERE customer_id = c.id AND payment_method = 'آجل') as credit_invoices,
  (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE party_id = c.id AND party_type = 'customer' AND payment_direction = 'تحصيل') as total_collected
FROM customers c
WHERE c.is_active = 1 AND c.current_balance > 0
ORDER BY c.current_balance DESC;

-- 11. التحقق من Triggers (هل تعمل؟)
-- بعد أي عملية، تأكد من أن current_balance تحدث تلقائياً:
SELECT 
  'فحص Triggers' as check_type,
  CASE 
    WHEN current_balance = credit_used THEN '✓ صحيح'
    ELSE '✗ خطأ: current_balance ≠ credit_used'
  END as trigger_status
FROM customers WHERE id = 'test-customer-001';

-- ============================================
-- تنظيف بيانات الاختبار
-- ============================================
-- احذف هذا التعليق عند الانتهاء من الاختبار:
-- DELETE FROM payments WHERE party_id = 'test-customer-001';
-- DELETE FROM invoices WHERE customer_id = 'test-customer-001';
-- DELETE FROM customers WHERE id = 'test-customer-001';
