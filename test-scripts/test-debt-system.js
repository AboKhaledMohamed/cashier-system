/**
 * Standalone Database Test Script
 * اختبار نظام الديون - سكريبت مستقل
 * 
 * طريقة الاستخدام:
 * 1. npm install better-sqlite3
 * 2. node test-scripts/test-debt-system.js
 * 
 * يقوم بـ:
 * - إنشاء عميل اختبار
 * - محاكاة بيع آجل
 * - محاكاة تحصيل دين
 * - التحقق من حسابات الديون
 * - تنظيف البيانات
 */

const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');

// Database path (same as the app)
const dbPath = path.join(os.homedir(), 'AppData', 'Local', 'smartpos', 'smartpos.db');

console.log('========================================');
console.log('اختبار نظام الديون - Debt System Test');
console.log('========================================');
console.log('Database:', dbPath);
console.log();

try {
  const db = new Database(dbPath, { verbose: console.log });
  
  // Test 1: Create test customer
  console.log('\n[TEST 1] إنشاء عميل اختبار...');
  const testId = 'test-' + Date.now();
  const insertCustomer = db.prepare(`
    INSERT INTO customers (id, name, phone, current_balance, credit_used, total_debts, total_paid, is_active)
    VALUES (?, ?, ?, 500, 500, 500, 0, 1)
  `);
  insertCustomer.run(testId, 'عميل اختبار', '01000000000');
  
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(testId);
  console.log('✓ العميل:', customer.name, '| الرصيد:', customer.current_balance);
  
  // Test 2: Simulate credit sale
  console.log('\n[TEST 2] محاكاة بيع آجل...');
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const invoiceId = 'inv-' + Date.now();
  
  const insertInvoice = db.prepare(`
    INSERT INTO invoices (id, invoice_number, invoice_type, date, time,
      customer_id, customer_name, user_id, user_name, subtotal, total,
      payment_method, paid, credit_amount, status)
    VALUES (?, ?, 'بيع', ?, ?, ?, ?, ?, ?, ?, ?, 'آجل', ?, ?, 'مكتمل')
  `);
  insertInvoice.run(
    invoiceId, 'F-TEST-001', dateStr, now.toTimeString().slice(0, 8),
    testId, 'عميل اختبار', 'test-user', 'Test User', 300, 300, 100, 200
  );
  
  // Simulate trigger
  const updateCustomer = db.prepare(`
    UPDATE customers SET 
      current_balance = current_balance + ?,
      credit_used = credit_used + ?,
      total_debts = total_debts + ?,
      total_purchases = total_purchases + ?,
      last_purchase_date = ?,
      last_debt_date = ?
    WHERE id = ?
  `);
  updateCustomer.run(200, 200, 200, 300, dateStr, dateStr, testId);
  
  const afterSale = db.prepare('SELECT current_balance FROM customers WHERE id = ?').get(testId);
  const expectedBalance = 500 + 200;
  console.log('✓ بعد البيع:', afterSale.current_balance, '| المتوقع:', expectedBalance);
  
  if (afterSale.current_balance !== expectedBalance) {
    console.error('✗ فشل: الرصيد غير صحيح!');
    process.exit(1);
  }
  
  // Test 3: Simulate payment
  console.log('\n[TEST 3] محاكاة تحصيل دين...');
  const paymentId = 'pay-' + Date.now();
  
  const insertPayment = db.prepare(`
    INSERT INTO payments (id, payment_direction, party_type, party_id, party_name,
      amount, method, date, user_id, notes)
    VALUES (?, 'تحصيل', 'customer', ?, ?, ?, 'نقدي', ?, ?, ?)
  `);
  insertPayment.run(paymentId, testId, 'عميل اختبار', 300, dateStr, 'test-user', 'Test payment');
  
  const updateAfterPayment = db.prepare(`
    UPDATE customers SET 
      current_balance = MAX(0, current_balance - ?),
      credit_used = MAX(0, credit_used - ?),
      total_paid = total_paid + ?,
      last_payment_date = ?
    WHERE id = ?
  `);
  updateAfterPayment.run(300, 300, 300, dateStr, testId);
  
  const afterPayment = db.prepare('SELECT current_balance FROM customers WHERE id = ?').get(testId);
  const expectedAfterPayment = 700 - 300;
  console.log('✓ بعد التحصيل:', afterPayment.current_balance, '| المتوقع:', expectedAfterPayment);
  
  if (afterPayment.current_balance !== expectedAfterPayment) {
    console.error('✗ فشل: الرصيد بعد التحصيل غير صحيح!');
    process.exit(1);
  }
  
  // Test 4: Verify total debt calculation
  console.log('\n[TEST 4] التحقق من إجمالي الديون...');
  const totalDebt = db.prepare('SELECT COALESCE(SUM(current_balance), 0) as total FROM customers WHERE is_active = 1').get();
  console.log('✓ إجمالي ديون العملاء:', totalDebt.total);
  
  // Test 5: Verify invoices
  console.log('\n[TEST 5] التحقق من الفواتير الآجلة...');
  const invoices = db.prepare(`
    SELECT COUNT(*) as count FROM invoices 
    WHERE customer_id = ? AND payment_method = 'آجل'
  `).get(testId);
  console.log('✓ عدد الفواتير الآجلة للعميل:', invoices.count);
  
  // Cleanup
  console.log('\n[CLEANUP] تنظيف البيانات...');
  db.prepare('DELETE FROM payments WHERE party_id = ?').run(testId);
  db.prepare('DELETE FROM invoices WHERE id = ?').run(invoiceId);
  db.prepare('DELETE FROM customers WHERE id = ?').run(testId);
  console.log('✓ تم حذف بيانات الاختبار');
  
  console.log('\n========================================');
  console.log('✓ جميع الاختبارات نجحت!');
  console.log('========================================');
  
  db.close();
  
} catch (error) {
  console.error('✗ خطأ:', error.message);
  process.exit(1);
}
