const { ipcMain } = require('electron');
const { getDb } = require('../database');

function registerReportHandlers() {
  // Dashboard stats
  ipcMain.handle('reports:getDashboardStats', async () => {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate current month range
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const todaySales = db.prepare(`
      SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total
      FROM invoices WHERE date = ? AND invoice_type = 'بيع' AND status = 'مكتمل'
    `).get(today);

    // Monthly sales
    const monthSales = db.prepare(`
      SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total
      FROM invoices WHERE date BETWEEN ? AND ? AND invoice_type = 'بيع' AND status = 'مكتمل'
    `).get(monthStart, monthEnd);

    // Monthly invoices count
    const monthInvoices = db.prepare(`
      SELECT COUNT(*) as count FROM invoices 
      WHERE date BETWEEN ? AND ? AND invoice_type = 'بيع' AND status = 'مكتمل'
    `).get(monthStart, monthEnd);

    const todayReturns = db.prepare(`
      SELECT COALESCE(SUM(refund_amount), 0) as total
      FROM returns WHERE date(return_date) = ?
    `).get(today);

    const todayExpenses = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date = ?
    `).get(today);

    // Monthly expenses
    const monthExpenses = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date BETWEEN ? AND ?
    `).get(monthStart, monthEnd);

    const todayCollections = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM payments WHERE date = ? AND party_type = 'customer' AND payment_direction = 'تحصيل'
    `).get(today);

    const totalCustomerDebt = db.prepare(`
      SELECT COALESCE(SUM(current_balance), 0) as total FROM customers WHERE is_active = 1
    `).get();

    // Monthly customer debt (credit sales this month)
    const monthCustomerDebt = db.prepare(`
      SELECT COALESCE(SUM(credit_amount), 0) as total FROM invoices 
      WHERE date BETWEEN ? AND ? AND invoice_type = 'بيع' AND status = 'مكتمل' AND payment_method = 'آجل'
    `).get(monthStart, monthEnd);

    const totalSupplierDebt = db.prepare(`
      SELECT COALESCE(SUM(current_balance), 0) as total FROM suppliers WHERE is_active = 1
    `).get();

    const lowStockCount = db.prepare(`
      SELECT COUNT(*) as count FROM products WHERE is_active = 1 AND is_service = 0 AND stock <= stock_alert
    `).get();

    const expiringCount = db.prepare(`
      SELECT COUNT(*) as count FROM products 
      WHERE is_active = 1 AND expiry_date IS NOT NULL 
        AND julianday(expiry_date) - julianday('now') <= expiry_alert_days
    `).get();

    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products WHERE is_active = 1').get();
    const totalCustomers = db.prepare('SELECT COUNT(*) as count FROM customers WHERE is_active = 1').get();

    // Last 7 days sales chart
    const last7Days = db.prepare(`
      SELECT date(date) as day, COALESCE(SUM(total), 0) as total, COUNT(*) as count
      FROM invoices WHERE date >= date('now', '-7 days') AND invoice_type = 'بيع' AND status = 'مكتمل'
      GROUP BY date(date) ORDER BY day
    `).all();

    // Top selling products today - grouped by product name to avoid duplicates
    const topProducts = db.prepare(`
      SELECT ii.product_name, SUM(ii.qty) as total_qty, SUM(ii.total) as total_revenue
      FROM invoice_items ii
      JOIN invoices i ON ii.invoice_id = i.id
      WHERE i.date = ? AND i.invoice_type = 'بيع' AND i.status = 'مكتمل'
      GROUP BY ii.product_name ORDER BY total_revenue DESC LIMIT 10
    `).all(today);

    return {
      // Monthly stats
      month_sales: monthSales.total,
      month_invoices: monthInvoices.count,
      month_customer_debt: monthCustomerDebt.total,
      month_expenses: monthExpenses.total,
      // Today stats
      today_sales: todaySales.total,
      today_invoices: todaySales.count,
      today_returns: todayReturns.total,
      today_expenses: todayExpenses.total,
      today_collections: todayCollections.total,
      today_net: todaySales.total - todayReturns.total - todayExpenses.total,
      total_customer_debt: totalCustomerDebt.total,
      total_supplier_debt: totalSupplierDebt.total,
      low_stock_count: lowStockCount.count,
      expiring_count: expiringCount.count,
      total_products: totalProducts.count,
      total_customers: totalCustomers.count,
      last_7_days: last7Days,
      top_products: topProducts,
    };
  });

  // Daily summary
  ipcMain.handle('reports:getDailySummary', async (event, date) => {
    const db = getDb();
    const d = date || new Date().toISOString().split('T')[0];
    return db.prepare('SELECT * FROM v_daily_summary WHERE day = ?').get(d);
  });

  // Sales report
  ipcMain.handle('reports:getSalesReport', async (event, dateFrom, dateTo) => {
    const db = getDb();
    const invoices = db.prepare(`
      SELECT * FROM invoices 
      WHERE date BETWEEN ? AND ? AND invoice_type = 'بيع' AND status = 'مكتمل'
      ORDER BY date DESC, time DESC
    `).all(dateFrom, dateTo);

    // Fetch items for each invoice
    for (const invoice of invoices) {
      invoice.items = db.prepare(`
        SELECT * FROM invoice_items WHERE invoice_id = ?
      `).all(invoice.id);
    }

    const summary = db.prepare(`
      SELECT 
        COUNT(*) as invoice_count,
        COALESCE(SUM(total), 0) as total_sales,
        COALESCE(SUM(discount_amount), 0) as total_discounts,
        COALESCE(SUM(tax_amount), 0) as total_tax,
        COALESCE(SUM(CASE WHEN payment_method = 'نقدي' THEN total ELSE 0 END), 0) as cash_sales,
        COALESCE(SUM(CASE WHEN payment_method = 'آجل' THEN credit_amount ELSE 0 END), 0) as credit_sales
      FROM invoices WHERE date BETWEEN ? AND ? AND invoice_type = 'بيع' AND status = 'مكتمل'
    `).get(dateFrom, dateTo);

    // Daily breakdown
    const daily = db.prepare(`
      SELECT date(date) as day, COUNT(*) as count, COALESCE(SUM(total), 0) as total
      FROM invoices WHERE date BETWEEN ? AND ? AND invoice_type = 'بيع' AND status = 'مكتمل'
      GROUP BY date(date) ORDER BY day
    `).all(dateFrom, dateTo);

    return { invoices, summary, daily };
  });

  // Products report
  ipcMain.handle('reports:getProductsReport', async (event, dateFrom, dateTo) => {
    const db = getDb();
    return db.prepare(`
      SELECT ii.product_id, ii.product_name, 
        SUM(ii.qty) as total_qty, SUM(ii.total) as total_revenue,
        SUM(ii.qty * ii.cost_price) as total_cost,
        SUM(ii.total) - SUM(ii.qty * ii.cost_price) as total_profit,
        COUNT(DISTINCT ii.invoice_id) as invoice_count
      FROM invoice_items ii
      JOIN invoices i ON ii.invoice_id = i.id
      WHERE i.date BETWEEN ? AND ? AND i.invoice_type = 'بيع' AND i.status = 'مكتمل'
      GROUP BY ii.product_id ORDER BY total_revenue DESC
    `).all(dateFrom, dateTo);
  });

  // Customers report
  ipcMain.handle('reports:getCustomersReport', async () => {
    const db = getDb();
    return db.prepare(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM invoices WHERE customer_id = c.id AND status = 'مكتمل') as invoice_count,
        (SELECT COALESCE(SUM(total), 0) FROM invoices WHERE customer_id = c.id AND status = 'مكتمل') as total_sales
      FROM customers c WHERE c.is_active = 1 ORDER BY total_sales DESC
    `).all();
  });

  // Suppliers report
  ipcMain.handle('reports:getSuppliersReport', async () => {
    const db = getDb();
    return db.prepare(`
      SELECT s.*,
        (SELECT COUNT(*) FROM purchases WHERE supplier_id = s.id AND status != 'ملغي') as purchase_count
      FROM suppliers s WHERE s.is_active = 1 ORDER BY s.total_purchases DESC
    `).all();
  });

  // Expenses report
  ipcMain.handle('reports:getExpensesReport', async (event, dateFrom, dateTo) => {
    const db = getDb();
    const expenses = db.prepare('SELECT * FROM expenses WHERE date BETWEEN ? AND ? ORDER BY date').all(dateFrom, dateTo);
    const byCategory = db.prepare(`
      SELECT category_name, COALESCE(SUM(amount), 0) as total
      FROM expenses WHERE date BETWEEN ? AND ?
      GROUP BY category_id ORDER BY total DESC
    `).all(dateFrom, dateTo);
    const total = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date BETWEEN ? AND ?').get(dateFrom, dateTo);
    return { expenses, byCategory, total: total.total };
  });

  // Profit report
  ipcMain.handle('reports:getProfitReport', async (event, dateFrom, dateTo) => {
    const db = getDb();
    const sales = db.prepare(`
      SELECT COALESCE(SUM(total), 0) as total FROM invoices 
      WHERE date BETWEEN ? AND ? AND invoice_type = 'بيع' AND status = 'مكتمل'
    `).get(dateFrom, dateTo);

    const cost = db.prepare(`
      SELECT COALESCE(SUM(ii.qty * ii.cost_price), 0) as total
      FROM invoice_items ii JOIN invoices i ON ii.invoice_id = i.id
      WHERE i.date BETWEEN ? AND ? AND i.invoice_type = 'بيع' AND i.status = 'مكتمل'
    `).get(dateFrom, dateTo);

    const returns = db.prepare(`
      SELECT COALESCE(SUM(refund_amount), 0) as total FROM returns
      WHERE date(return_date) BETWEEN ? AND ?
    `).get(dateFrom, dateTo);

    const expenses = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date BETWEEN ? AND ?
    `).get(dateFrom, dateTo);

    return {
      total_sales: sales.total,
      total_cost: cost.total,
      gross_profit: sales.total - cost.total,
      total_returns: returns.total,
      total_expenses: expenses.total,
      net_profit: sales.total - cost.total - returns.total - expenses.total,
    };
  });
}

module.exports = { registerReportHandlers };
