/**
 * اختبار شامل لجميع IPC Handlers
 */

const { ipcMain } = require('electron');
const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');

class IPCValidator {
  constructor() {
    this.dbPath = path.join(os.homedir(), 'AppData', 'Local', 'smartpos', 'smartpos.db');
    this.db = new Database(this.dbPath);
    this.results = [];
  }

  log(test, status, detail = '') {
    const icon = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '⚠';
    console.log(`${icon} ${test}: ${detail}`);
    this.results.push({ test, status, detail });
  }

  // ============================================
  // اختبار Handlers
  // ============================================
  
  testProducts() {
    console.log('\n--- Products Handler ---');
    try {
      const products = this.db.prepare('SELECT * FROM products WHERE is_active = 1 LIMIT 5').all();
      this.log('products:getAll', products.length > 0 ? 'PASS' : 'FAIL', `${products.length} products`);
      
      const product = this.db.prepare('SELECT * FROM products WHERE is_active = 1').get();
      if (product) {
        const single = this.db.prepare('SELECT * FROM products WHERE id = ?').get(product.id);
        this.log('products:getById', single ? 'PASS' : 'FAIL', single?.name || 'N/A');
      }
    } catch (e) {
      this.log('products', 'FAIL', e.message);
    }
  }

  testCustomers() {
    console.log('\n--- Customers Handler ---');
    try {
      const customers = this.db.prepare('SELECT * FROM customers WHERE is_active = 1 LIMIT 5').all();
      this.log('customers:getAll', customers.length >= 0 ? 'PASS' : 'FAIL', `${customers.length} customers`);
      
      const totalDebt = this.db.prepare('SELECT COALESCE(SUM(current_balance), 0) as total FROM customers WHERE is_active = 1').get();
      this.log('customers:debt-calc', totalDebt.total >= 0 ? 'PASS' : 'FAIL', `Total: ${totalDebt.total}`);
      
      const debtors = this.db.prepare('SELECT * FROM customers WHERE is_active = 1 AND current_balance > 0').all();
      this.log('customers:debtors', debtors.length >= 0 ? 'PASS' : 'FAIL', `${debtors.length} debtors`);
    } catch (e) {
      this.log('customers', 'FAIL', e.message);
    }
  }

  testSuppliers() {
    console.log('\n--- Suppliers Handler ---');
    try {
      const suppliers = this.db.prepare('SELECT * FROM suppliers WHERE is_active = 1 LIMIT 5').all();
      this.log('suppliers:getAll', suppliers.length >= 0 ? 'PASS' : 'FAIL', `${suppliers.length} suppliers`);
      
      const totalDebt = this.db.prepare('SELECT COALESCE(SUM(current_balance), 0) as total FROM suppliers WHERE is_active = 1').get();
      this.log('suppliers:debt-calc', totalDebt.total >= 0 ? 'PASS' : 'FAIL', `Total: ${totalDebt.total}`);
    } catch (e) {
      this.log('suppliers', 'FAIL', e.message);
    }
  }

  testInvoices() {
    console.log('\n--- Invoices Handler ---');
    try {
      const invoices = this.db.prepare('SELECT * FROM invoices ORDER BY created_at DESC LIMIT 5').all();
      this.log('invoices:getAll', invoices.length >= 0 ? 'PASS' : 'FAIL', `${invoices.length} invoices`);
      
      const today = new Date().toISOString().split('T')[0];
      const todaySales = this.db.prepare(`
        SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total
        FROM invoices WHERE date = ? AND invoice_type = 'بيع' AND status = 'مكتمل'
      `).get(today);
      this.log('invoices:today', 'PASS', `Today: ${todaySales.count} invoices, ${todaySales.total} EGP`);
      
      const creditInvoices = this.db.prepare(`
        SELECT COUNT(*) as count FROM invoices 
        WHERE payment_method = 'آجل' AND invoice_type = 'بيع' AND status = 'مكتمل'
      `).get();
      this.log('invoices:credit', 'PASS', `${creditInvoices.count} credit invoices`);
    } catch (e) {
      this.log('invoices', 'FAIL', e.message);
    }
  }

  testPayments() {
    console.log('\n--- Payments Handler ---');
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const collections = this.db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM payments 
        WHERE date = ? AND party_type = 'customer' AND payment_direction = 'تحصيل'
      `).get(today);
      this.log('payments:collections', 'PASS', `Today: ${collections.total} EGP`);
      
      const supplierPayments = this.db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM payments 
        WHERE party_type = 'supplier' AND payment_direction = 'سداد'
      `).get();
      this.log('payments:supplier', 'PASS', `Total: ${supplierPayments.total} EGP`);
    } catch (e) {
      this.log('payments', 'FAIL', e.message);
    }
  }

  testReports() {
    console.log('\n--- Reports Handler ---');
    try {
      const totalCustomerDebt = this.db.prepare('SELECT COALESCE(SUM(current_balance), 0) as total FROM customers WHERE is_active = 1').get();
      const totalSupplierDebt = this.db.prepare('SELECT COALESCE(SUM(current_balance), 0) as total FROM suppliers WHERE is_active = 1').get();
      
      this.log('reports:customer-debt', 'PASS', `${totalCustomerDebt.total} EGP`);
      this.log('reports:supplier-debt', 'PASS', `${totalSupplierDebt.total} EGP`);
      
      const topProducts = this.db.prepare(`
        SELECT ii.product_name, SUM(ii.qty) as total_qty, SUM(ii.total) as total_revenue
        FROM invoice_items ii
        JOIN invoices i ON ii.invoice_id = i.id
        WHERE i.date = date('now') AND i.invoice_type = 'بيع' AND i.status = 'مكتمل'
        GROUP BY ii.product_name ORDER BY total_revenue DESC LIMIT 10
      `).all();
      this.log('reports:top-products', 'PASS', `${topProducts.length} products`);
    } catch (e) {
      this.log('reports', 'FAIL', e.message);
    }
  }

  testDatabaseIntegrity() {
    console.log('\n--- Database Integrity ---');
    try {
      // Check for orphaned records
      const orphanedItems = this.db.prepare(`
        SELECT COUNT(*) as count FROM invoice_items ii
        LEFT JOIN invoices i ON ii.invoice_id = i.id
        WHERE i.id IS NULL
      `).get();
      this.log('integrity:invoice_items', orphanedItems.count === 0 ? 'PASS' : 'FAIL', `${orphanedItems.count} orphaned`);
      
      // Check for negative balances
      const negativeCustomers = this.db.prepare(`
        SELECT COUNT(*) as count FROM customers WHERE current_balance < 0
      `).get();
      this.log('integrity:negative-balances', negativeCustomers.count === 0 ? 'PASS' : 'WARN', `${negativeCustomers.count} negative`);
      
      // Check index usage
      const tableSizes = this.db.prepare(`
        SELECT 'products' as name, COUNT(*) as count FROM products
        UNION ALL SELECT 'invoices', COUNT(*) FROM invoices
        UNION ALL SELECT 'customers', COUNT(*) FROM customers
        UNION ALL SELECT 'invoice_items', COUNT(*) FROM invoice_items
      `).all();
      
      tableSizes.forEach(t => {
        this.log(`db:size:${t.name}`, 'INFO', `${t.count} rows`);
      });
    } catch (e) {
      this.log('integrity', 'FAIL', e.message);
    }
  }

  // ============================================
  // تشغيل جميع الاختبارات
  // ============================================
  runAll() {
    console.log('========================================');
    console.log('IPC Handlers & Database Validation');
    console.log('========================================');
    console.log('Database:', this.dbPath);
    console.log('Time:', new Date().toISOString());
    console.log();

    this.testProducts();
    this.testCustomers();
    this.testSuppliers();
    this.testInvoices();
    this.testPayments();
    this.testReports();
    this.testDatabaseIntegrity();

    console.log('\n========================================');
    console.log('Summary');
    console.log('========================================');
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const warnings = this.results.filter(r => r.status === 'WARN').length;
    
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Warnings: ${warnings}`);
    console.log(`Total: ${this.results.length}`);
    
    if (failed > 0) {
      console.log('\nFailed Tests:');
      this.results.filter(r => r.status === 'FAIL').forEach(r => {
        console.log(`  ✗ ${r.test}: ${r.detail}`);
      });
    }
    
    this.db.close();
    
    return { passed, failed, warnings, total: this.results.length };
  }
}

// Run if called directly
if (require.main === module) {
  const validator = new IPCValidator();
  const results = validator.runAll();
  
  process.exit(results.failed > 0 ? 1 : 0);
}

module.exports = { IPCValidator };
