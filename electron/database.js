const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

let db = null;

/**
 * Initialize the SQLite database
 */
function initDatabase(dbPath) {
  // Ensure directory exists
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(dbPath, { verbose: console.log });

  // Set pragmas for performance and safety
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('encoding = "UTF-8"');
  db.pragma('busy_timeout = 5000');

  // Run schema and seed
  createSchema();
  runMigrations();
  seedData();

  console.log('Database initialized successfully at:', dbPath);
  return db;
}

/**
 * Get database instance
 */
function getDb() {
  if (!db) throw new Error('Database not initialized');
  return db;
}

/**
 * Create all tables
 */
function createSchema() {
  db.exec(`
    -- ============================================================
    -- SHOP_SETTINGS
    -- ============================================================
    CREATE TABLE IF NOT EXISTS shop_settings (
      id                      INTEGER PRIMARY KEY CHECK (id = 1),
      shop_name               TEXT    NOT NULL DEFAULT 'محلي',
      shop_name_en            TEXT,
      owner_name              TEXT,
      phone                   TEXT    NOT NULL DEFAULT '',
      phone_alt               TEXT,
      address                 TEXT,
      city                    TEXT,
      logo_url                TEXT,
      currency                TEXT    NOT NULL DEFAULT 'EGP',
      currency_symbol         TEXT    NOT NULL DEFAULT 'ج.م',
      receipt_header          TEXT,
      receipt_footer          TEXT,
      receipt_show_logo       INTEGER NOT NULL DEFAULT 1,
      receipt_printer_width   TEXT    NOT NULL DEFAULT '80mm'
                                      CHECK (receipt_printer_width IN ('58mm','80mm','A4')),
      low_stock_alert         INTEGER NOT NULL DEFAULT 1,
      expiry_alert_days       INTEGER NOT NULL DEFAULT 30,
      tax_enabled             INTEGER NOT NULL DEFAULT 0,
      tax_name                TEXT    DEFAULT 'ضريبة القيمة المضافة',
      tax_rate                REAL    NOT NULL DEFAULT 0,
      tax_inclusive           INTEGER NOT NULL DEFAULT 0,
      loyalty_enabled         INTEGER NOT NULL DEFAULT 0,
      points_per_pound        REAL    NOT NULL DEFAULT 1,
      pound_per_point         REAL    NOT NULL DEFAULT 0.1,
      min_redeem_points       INTEGER NOT NULL DEFAULT 100,
      backup_auto             INTEGER NOT NULL DEFAULT 1,
      backup_path             TEXT,
      backup_keep_days        INTEGER NOT NULL DEFAULT 30,
      dark_mode               INTEGER NOT NULL DEFAULT 1,
      updated_at              TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    INSERT OR IGNORE INTO shop_settings (id) VALUES (1);

    -- ============================================================
    -- USERS
    -- ============================================================
    CREATE TABLE IF NOT EXISTS users (
      id                      TEXT    PRIMARY KEY,
      username                TEXT    NOT NULL UNIQUE,
      password_hash           TEXT    NOT NULL,
      full_name               TEXT    NOT NULL,
      role                    TEXT    NOT NULL DEFAULT 'cashier'
                                      CHECK (role IN ('admin','manager','cashier')),
      phone                   TEXT,
      avatar_url              TEXT,
      can_view_costs          INTEGER NOT NULL DEFAULT 0,
      can_apply_discount      INTEGER NOT NULL DEFAULT 1,
      max_discount_pct        REAL    NOT NULL DEFAULT 0,
      can_void_invoice        INTEGER NOT NULL DEFAULT 0,
      can_manage_products     INTEGER NOT NULL DEFAULT 0,
      can_view_reports        INTEGER NOT NULL DEFAULT 0,
      pin_code                TEXT,
      is_active               INTEGER NOT NULL DEFAULT 1,
      must_change_password    INTEGER NOT NULL DEFAULT 0,
      last_login_at           TEXT,
      created_at              TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_role     ON users(role);

    -- ============================================================
    -- CATEGORIES
    -- ============================================================
    CREATE TABLE IF NOT EXISTS categories (
      id                      TEXT    PRIMARY KEY,
      name                    TEXT    NOT NULL,
      parent_id               TEXT    REFERENCES categories(id) ON DELETE SET NULL,
      color                   TEXT,
      icon                    TEXT,
      pos_order               INTEGER NOT NULL DEFAULT 0,
      is_active               INTEGER NOT NULL DEFAULT 1
    );

    CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

    -- ============================================================
    -- SUPPLIERS
    -- ============================================================
    CREATE TABLE IF NOT EXISTS suppliers (
      id                      TEXT    PRIMARY KEY,
      name                    TEXT    NOT NULL,
      phone                   TEXT    NOT NULL,
      phone_alt               TEXT,
      email                   TEXT,
      address                 TEXT,
      contact_person          TEXT,
      current_balance         REAL    NOT NULL DEFAULT 0,
      total_purchases         REAL    NOT NULL DEFAULT 0,
      last_purchase_date      TEXT,
      is_active               INTEGER NOT NULL DEFAULT 1,
      notes                   TEXT,
      created_at              TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- ============================================================
    -- CUSTOMERS
    -- ============================================================
    CREATE TABLE IF NOT EXISTS customers (
      id                      TEXT    PRIMARY KEY,
      name                    TEXT    NOT NULL,
      phone                   TEXT    NOT NULL,
      phone_alt               TEXT,
      address                 TEXT,
      national_id             TEXT,
      credit_limit            REAL    NOT NULL DEFAULT 0,
      current_balance         REAL    NOT NULL DEFAULT 0,
      credit_used             REAL    NOT NULL DEFAULT 0,
      neighborhood            TEXT,
      building                TEXT,
      floor                   TEXT,
      landmark                TEXT,
      loyalty_points          INTEGER NOT NULL DEFAULT 0,
      total_purchases         REAL    NOT NULL DEFAULT 0,
      last_purchase_date      TEXT,
      trust_score             INTEGER NOT NULL DEFAULT 100 CHECK (trust_score BETWEEN 0 AND 100),
      trust_level             TEXT    NOT NULL DEFAULT 'جيد'
                                      CHECK (trust_level IN ('ممتاز','جيد','متوسط','ضعيف')),
      allowed_discount_pct    REAL    NOT NULL DEFAULT 0,
      debt_reminder_enabled   INTEGER NOT NULL DEFAULT 0,
      reminder_frequency      TEXT    DEFAULT 'اسبوعي'
                                      CHECK (reminder_frequency IN ('يومي','3_ايام','اسبوعي')),
      total_debts             REAL    NOT NULL DEFAULT 0,
      total_paid              REAL    NOT NULL DEFAULT 0,
      last_debt_date          TEXT,
      last_payment_date       TEXT,
      avg_payment_days        INTEGER NOT NULL DEFAULT 0,
      is_blacklisted          INTEGER NOT NULL DEFAULT 0,
      birthdate               TEXT,
      notes                   TEXT,
      is_active               INTEGER NOT NULL DEFAULT 1,
      created_at              TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_customers_phone     ON customers(phone);
    CREATE INDEX IF NOT EXISTS idx_customers_balance   ON customers(current_balance);

    -- ============================================================
    -- PRODUCTS
    -- ============================================================
    CREATE TABLE IF NOT EXISTS products (
      id                      TEXT    PRIMARY KEY,
      name                    TEXT    NOT NULL,
      barcode                 TEXT    UNIQUE,
      barcode_alt             TEXT,
      price                   REAL    NOT NULL DEFAULT 0,
      price_wholesale         REAL,
      price_min               REAL,
      cost                    REAL    NOT NULL DEFAULT 0,
      unit                    TEXT    NOT NULL DEFAULT 'قطعة',
      unit_secondary          TEXT,
      unit_conversion         REAL,
      category_id             TEXT    REFERENCES categories(id) ON DELETE SET NULL,
      supplier_id             TEXT    REFERENCES suppliers(id)  ON DELETE SET NULL,
      product_type            TEXT    NOT NULL DEFAULT 'قطعة'
                                      CHECK (product_type IN ('قطعة','وزن','علبة','كرتونة','متر','لتر','مجموعة')),
      storage_type            TEXT    NOT NULL DEFAULT 'عادي'
                                      CHECK (storage_type IN ('عادي','ثلاجة','فريزر','جاف')),
      storage_location        TEXT,
      stock                   REAL    NOT NULL DEFAULT 0,
      stock_alert             REAL    NOT NULL DEFAULT 5,
      stock_max               REAL,
      reorder_qty             REAL,
      expiry_date             TEXT,
      production_date         TEXT,
      shelf_life_days         INTEGER,
      best_before_date        TEXT,
      expiry_alert_days       INTEGER NOT NULL DEFAULT 30,
      expiry_alert_type       TEXT    NOT NULL DEFAULT 'اسبوع'
                                      CHECK (expiry_alert_type IN ('يومي','3_ايام','اسبوع')),
      is_daily_production     INTEGER NOT NULL DEFAULT 0,
      production_time         TEXT,
      weight_options          TEXT,
      pieces_per_bundle       INTEGER,
      tax_override            REAL,
      tax_inclusive_override  INTEGER,
      image_url               TEXT,
      description             TEXT,
      pos_order               INTEGER NOT NULL DEFAULT 0,
      pos_color               TEXT,
      is_active               INTEGER NOT NULL DEFAULT 1,
      is_service              INTEGER NOT NULL DEFAULT 0,
      notes                   TEXT,
      created_at              TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at              TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_products_barcode    ON products(barcode);
    CREATE INDEX IF NOT EXISTS idx_products_category   ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_stock      ON products(stock);
    CREATE INDEX IF NOT EXISTS idx_products_expiry     ON products(expiry_date);
    CREATE INDEX IF NOT EXISTS idx_products_active     ON products(is_active);

    -- ============================================================
    -- CASH_SESSIONS
    -- ============================================================
    CREATE TABLE IF NOT EXISTS cash_sessions (
      id                      TEXT    PRIMARY KEY,
      user_id                 TEXT    NOT NULL REFERENCES users(id),
      user_name               TEXT    NOT NULL,
      opening_balance         REAL    NOT NULL DEFAULT 0,
      closing_balance         REAL,
      expected_balance        REAL    NOT NULL DEFAULT 0,
      difference              REAL    NOT NULL DEFAULT 0,
      total_sales_cash        REAL    NOT NULL DEFAULT 0,
      total_sales_credit      REAL    NOT NULL DEFAULT 0,
      total_sales_deferred    REAL    NOT NULL DEFAULT 0,
      total_returns           REAL    NOT NULL DEFAULT 0,
      total_expenses          REAL    NOT NULL DEFAULT 0,
      total_collections       REAL    NOT NULL DEFAULT 0,
      invoices_count          INTEGER NOT NULL DEFAULT 0,
      opened_at               TEXT    NOT NULL DEFAULT (datetime('now')),
      closed_at               TEXT,
      status                  TEXT    NOT NULL DEFAULT 'open'
                                      CHECK (status IN ('open','closed')),
      notes                   TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user   ON cash_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_status ON cash_sessions(status);

    -- ============================================================
    -- INVOICES
    -- ============================================================
    CREATE TABLE IF NOT EXISTS invoices (
      id                      TEXT    PRIMARY KEY,
      invoice_number          TEXT    NOT NULL UNIQUE,
      invoice_type            TEXT    NOT NULL DEFAULT 'بيع'
                                      CHECK (invoice_type IN ('بيع','مرتجع')),
      ref_invoice_id          TEXT    REFERENCES invoices(id),
      date                    TEXT    NOT NULL,
      time                    TEXT    NOT NULL,
      customer_id             TEXT    REFERENCES customers(id) ON DELETE SET NULL,
      customer_name           TEXT,
      user_id                 TEXT    NOT NULL REFERENCES users(id),
      user_name               TEXT    NOT NULL,
      cash_session_id         TEXT    REFERENCES cash_sessions(id),
      subtotal                REAL    NOT NULL DEFAULT 0,
      tax_amount              REAL    NOT NULL DEFAULT 0,
      discount_amount         REAL    NOT NULL DEFAULT 0,
      discount_type           TEXT    NOT NULL DEFAULT 'مبلغ'
                                      CHECK (discount_type IN ('نسبة','مبلغ')),
      discount_pct            REAL    NOT NULL DEFAULT 0,
      total                   REAL    NOT NULL DEFAULT 0,
      payment_method          TEXT    NOT NULL DEFAULT 'نقدي'
                                      CHECK (payment_method IN ('نقدي','آجل')),
      paid                    REAL    NOT NULL DEFAULT 0,
      change_amount           REAL    NOT NULL DEFAULT 0,
      credit_amount           REAL    NOT NULL DEFAULT 0,
      due_date                TEXT,
      points_earned           INTEGER NOT NULL DEFAULT 0,
      points_redeemed         INTEGER NOT NULL DEFAULT 0,
      points_discount         REAL    NOT NULL DEFAULT 0,
      status                  TEXT    NOT NULL DEFAULT 'مكتمل'
                                      CHECK (status IN ('مكتمل','معلق','ملغي','مرتجع')),
      void_reason             TEXT,
      printed_count           INTEGER NOT NULL DEFAULT 0,
      notes                   TEXT,
      created_at              TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_invoices_number   ON invoices(invoice_number);
    CREATE INDEX IF NOT EXISTS idx_invoices_date     ON invoices(date);
    CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
    CREATE INDEX IF NOT EXISTS idx_invoices_session  ON invoices(cash_session_id);
    CREATE INDEX IF NOT EXISTS idx_invoices_status   ON invoices(status);

    -- ============================================================
    -- INVOICE_ITEMS
    -- ============================================================
    CREATE TABLE IF NOT EXISTS invoice_items (
      id                      TEXT    PRIMARY KEY,
      invoice_id              TEXT    NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
      product_id              TEXT    NOT NULL REFERENCES products(id),
      product_name            TEXT    NOT NULL,
      product_barcode         TEXT,
      qty                     REAL    NOT NULL DEFAULT 1,
      unit                    TEXT    NOT NULL,
      unit_price              REAL    NOT NULL DEFAULT 0,
      cost_price              REAL    NOT NULL DEFAULT 0,
      discount_amount         REAL    NOT NULL DEFAULT 0,
      tax_amount              REAL    NOT NULL DEFAULT 0,
      total                   REAL    NOT NULL DEFAULT 0,
      notes                   TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_inv_items_invoice ON invoice_items(invoice_id);
    CREATE INDEX IF NOT EXISTS idx_inv_items_product ON invoice_items(product_id);

    -- ============================================================
    -- RETURNS
    -- ============================================================
    CREATE TABLE IF NOT EXISTS returns (
      id                      TEXT    PRIMARY KEY,
      return_number           TEXT    NOT NULL UNIQUE,
      original_invoice_id     TEXT    NOT NULL REFERENCES invoices(id),
      customer_id             TEXT    REFERENCES customers(id) ON DELETE SET NULL,
      user_id                 TEXT    NOT NULL REFERENCES users(id),
      return_date             TEXT    NOT NULL DEFAULT (datetime('now')),
      reason                  TEXT    NOT NULL DEFAULT 'غير_ذلك'
                                      CHECK (reason IN ('عيب_مصنعي','تالف','خطأ_في_الطلب','انتهاء_صلاحية','غير_ذلك')),
      reason_notes            TEXT,
      return_type             TEXT    NOT NULL DEFAULT 'استرداد_نقدي'
                                      CHECK (return_type IN ('استبدال','استرداد_نقدي','رصيد_للعميل')),
      refund_amount           REAL    NOT NULL DEFAULT 0,
      refund_method           TEXT    NOT NULL DEFAULT 'نقدي',
      cash_session_id         TEXT    REFERENCES cash_sessions(id),
      notes                   TEXT,
      created_at              TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_returns_invoice  ON returns(original_invoice_id);
    CREATE INDEX IF NOT EXISTS idx_returns_customer ON returns(customer_id);

    -- ============================================================
    -- RETURN_ITEMS
    -- ============================================================
    CREATE TABLE IF NOT EXISTS return_items (
      id                      TEXT    PRIMARY KEY,
      return_id               TEXT    NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
      product_id              TEXT    NOT NULL REFERENCES products(id),
      product_name            TEXT    NOT NULL,
      invoice_item_id         TEXT    REFERENCES invoice_items(id),
      qty_returned            REAL    NOT NULL DEFAULT 1,
      unit_price              REAL    NOT NULL DEFAULT 0,
      refund_amount           REAL    NOT NULL DEFAULT 0,
      restock                 INTEGER NOT NULL DEFAULT 1,
      condition               TEXT    NOT NULL DEFAULT 'سليم'
                                      CHECK (condition IN ('سليم','تالف','منتهي_الصلاحية'))
    );

    CREATE INDEX IF NOT EXISTS idx_ret_items_return ON return_items(return_id);

    -- ============================================================
    -- PURCHASES
    -- ============================================================
    CREATE TABLE IF NOT EXISTS purchases (
      id                      TEXT    PRIMARY KEY,
      purchase_number         TEXT    NOT NULL UNIQUE,
      purchase_type           TEXT    NOT NULL DEFAULT 'فاتورة_شراء'
                                      CHECK (purchase_type IN ('فاتورة_شراء','مرتجع_للمورد')),
      supplier_id             TEXT    NOT NULL REFERENCES suppliers(id),
      supplier_name           TEXT    NOT NULL,
      date                    TEXT    NOT NULL,
      time                    TEXT    NOT NULL,
      subtotal                REAL    NOT NULL DEFAULT 0,
      tax_amount              REAL    NOT NULL DEFAULT 0,
      discount_amount         REAL    NOT NULL DEFAULT 0,
      shipping_cost           REAL    NOT NULL DEFAULT 0,
      total                   REAL    NOT NULL DEFAULT 0,
      paid                    REAL    NOT NULL DEFAULT 0,
      remaining               REAL    NOT NULL DEFAULT 0,
      payment_method          TEXT,
      payment_status          TEXT    NOT NULL DEFAULT 'غير_مدفوع'
                                      CHECK (payment_status IN ('غير_مدفوع','جزئي','مدفوع')),
      supplier_invoice_ref    TEXT,
      user_id                 TEXT    NOT NULL REFERENCES users(id),
      status                  TEXT    NOT NULL DEFAULT 'مستلم'
                                      CHECK (status IN ('مسودة','مستلم','ملغي')),
      notes                   TEXT,
      created_at              TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_purchases_supplier ON purchases(supplier_id);
    CREATE INDEX IF NOT EXISTS idx_purchases_date     ON purchases(date);
    CREATE INDEX IF NOT EXISTS idx_purchases_status   ON purchases(payment_status);

    -- ============================================================
    -- PURCHASE_ITEMS
    -- ============================================================
    CREATE TABLE IF NOT EXISTS purchase_items (
      id                      TEXT    PRIMARY KEY,
      purchase_id             TEXT    NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
      product_id              TEXT    NOT NULL REFERENCES products(id),
      product_name            TEXT    NOT NULL,
      qty                     REAL    NOT NULL DEFAULT 1,
      unit                    TEXT    NOT NULL,
      unit_price              REAL    NOT NULL DEFAULT 0,
      tax_amount              REAL    NOT NULL DEFAULT 0,
      discount_amount         REAL    NOT NULL DEFAULT 0,
      total                   REAL    NOT NULL DEFAULT 0,
      expiry_date             TEXT,
      notes                   TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_pur_items_purchase ON purchase_items(purchase_id);
    CREATE INDEX IF NOT EXISTS idx_pur_items_product  ON purchase_items(product_id);

    -- ============================================================
    -- STOCK_MOVEMENTS
    -- ============================================================
    CREATE TABLE IF NOT EXISTS stock_movements (
      id                      TEXT    PRIMARY KEY,
      product_id              TEXT    NOT NULL REFERENCES products(id),
      product_name            TEXT    NOT NULL,
      movement_type           TEXT    NOT NULL
                                      CHECK (movement_type IN (
                                          'شراء','بيع','مرتجع_بيع','مرتجع_شراء',
                                          'جرد','هالك','رصيد_افتتاحي'
                                      )),
      qty_before              REAL    NOT NULL DEFAULT 0,
      qty_change              REAL    NOT NULL DEFAULT 0,
      qty_after               REAL    NOT NULL DEFAULT 0,
      unit_cost               REAL    NOT NULL DEFAULT 0,
      ref_type                TEXT,
      ref_id                  TEXT,
      user_id                 TEXT    NOT NULL REFERENCES users(id),
      notes                   TEXT,
      created_at              TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_stock_mov_product ON stock_movements(product_id);
    CREATE INDEX IF NOT EXISTS idx_stock_mov_type    ON stock_movements(movement_type);
    CREATE INDEX IF NOT EXISTS idx_stock_mov_date    ON stock_movements(created_at);
    CREATE INDEX IF NOT EXISTS idx_stock_mov_ref     ON stock_movements(ref_type, ref_id);

    -- ============================================================
    -- INVENTORY_ADJUSTMENTS
    -- ============================================================
    CREATE TABLE IF NOT EXISTS inventory_adjustments (
      id                      TEXT    PRIMARY KEY,
      adj_number              TEXT    NOT NULL UNIQUE,
      adj_type                TEXT    NOT NULL DEFAULT 'تعديل_يدوي'
                                      CHECK (adj_type IN ('جرد_كامل','تعديل_يدوي')),
      status                  TEXT    NOT NULL DEFAULT 'جاري'
                                      CHECK (status IN ('جاري','مكتمل')),
      user_id                 TEXT    NOT NULL REFERENCES users(id),
      date                    TEXT    NOT NULL DEFAULT (datetime('now')),
      notes                   TEXT
    );

    -- ============================================================
    -- ADJUSTMENT_ITEMS
    -- ============================================================
    CREATE TABLE IF NOT EXISTS adjustment_items (
      id                      TEXT    PRIMARY KEY,
      adjustment_id           TEXT    NOT NULL REFERENCES inventory_adjustments(id) ON DELETE CASCADE,
      product_id              TEXT    NOT NULL REFERENCES products(id),
      product_name            TEXT    NOT NULL,
      qty_system              REAL    NOT NULL DEFAULT 0,
      qty_actual              REAL    NOT NULL DEFAULT 0,
      unit_cost               REAL    NOT NULL DEFAULT 0,
      reason                  TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_adj_items_adj     ON adjustment_items(adjustment_id);
    CREATE INDEX IF NOT EXISTS idx_adj_items_product ON adjustment_items(product_id);

    -- ============================================================
    -- PAYMENTS
    -- ============================================================
    CREATE TABLE IF NOT EXISTS payments (
      id                      TEXT    PRIMARY KEY,
      payment_direction       TEXT    NOT NULL CHECK (payment_direction IN ('تحصيل','سداد')),
      party_type              TEXT    NOT NULL CHECK (party_type IN ('customer','supplier')),
      party_id                TEXT    NOT NULL,
      party_name              TEXT    NOT NULL,
      amount                  REAL    NOT NULL DEFAULT 0,
      method                  TEXT    NOT NULL DEFAULT 'نقدي'
                                      CHECK (method IN ('نقدي','آجل')),
      reference_number        TEXT,
      invoice_id              TEXT    REFERENCES invoices(id) ON DELETE SET NULL,
      purchase_id             TEXT    REFERENCES purchases(id) ON DELETE SET NULL,
      cash_session_id         TEXT    REFERENCES cash_sessions(id),
      date                    TEXT    NOT NULL DEFAULT (datetime('now')),
      user_id                 TEXT    NOT NULL REFERENCES users(id),
      notes                   TEXT,
      created_at              TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_payments_party   ON payments(party_type, party_id);
    CREATE INDEX IF NOT EXISTS idx_payments_date    ON payments(date);
    CREATE INDEX IF NOT EXISTS idx_payments_session ON payments(cash_session_id);

    -- ============================================================
    -- EXPENSE_CATEGORIES
    -- ============================================================
    CREATE TABLE IF NOT EXISTS expense_categories (
      id                      TEXT    PRIMARY KEY,
      name                    TEXT    NOT NULL UNIQUE,
      is_active               INTEGER NOT NULL DEFAULT 1
    );

    -- ============================================================
    -- EXPENSES
    -- ============================================================
    CREATE TABLE IF NOT EXISTS expenses (
      id                      TEXT    PRIMARY KEY,
      category_id             TEXT    NOT NULL REFERENCES expense_categories(id),
      category_name           TEXT,
      amount                  REAL    NOT NULL DEFAULT 0,
      description             TEXT    NOT NULL,
      method                  TEXT    NOT NULL DEFAULT 'نقدي'
                                      CHECK (method IN ('نقدي','آجل')),
      receipt_image           TEXT,
      date                    TEXT    NOT NULL,
      cash_session_id         TEXT    REFERENCES cash_sessions(id),
      user_id                 TEXT    NOT NULL REFERENCES users(id),
      notes                   TEXT,
      created_at              TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_expenses_date     ON expenses(date);
    CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
    CREATE INDEX IF NOT EXISTS idx_expenses_session  ON expenses(cash_session_id);

    -- ============================================================
    -- LOYALTY_TRANSACTIONS
    -- ============================================================
    CREATE TABLE IF NOT EXISTS loyalty_transactions (
      id                      TEXT    PRIMARY KEY,
      customer_id             TEXT    NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      transaction_type        TEXT    NOT NULL
                                      CHECK (transaction_type IN ('اكتساب','استخدام','تعديل_يدوي')),
      points                  INTEGER NOT NULL DEFAULT 0,
      balance_before          INTEGER NOT NULL DEFAULT 0,
      balance_after           INTEGER NOT NULL DEFAULT 0,
      source_type             TEXT    NOT NULL CHECK (source_type IN ('فاتورة','مرتجع','يدوي')),
      source_id               TEXT,
      user_id                 TEXT    NOT NULL REFERENCES users(id),
      notes                   TEXT,
      created_at              TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_loyalty_customer ON loyalty_transactions(customer_id);
    CREATE INDEX IF NOT EXISTS idx_loyalty_date     ON loyalty_transactions(created_at);

    -- ============================================================
    -- NOTIFICATIONS
    -- ============================================================
    CREATE TABLE IF NOT EXISTS notifications (
      id                      TEXT    PRIMARY KEY,
      type                    TEXT    NOT NULL
                                      CHECK (type IN (
                                          'نقص_مخزون','انتهاء_صلاحية','دين_متأخر',
                                          'إغلاق_صندوق','نسخة_احتياطية','نظام'
                                      )),
      title                   TEXT    NOT NULL,
      message                 TEXT    NOT NULL,
      ref_type                TEXT,
      ref_id                  TEXT,
      is_read                 INTEGER NOT NULL DEFAULT 0,
      created_at              TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_notif_read ON notifications(is_read);
    CREATE INDEX IF NOT EXISTS idx_notif_type ON notifications(type);

    -- ============================================================
    -- AUDIT_LOG
    -- ============================================================
    CREATE TABLE IF NOT EXISTS audit_log (
      id                      INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id                 TEXT    NOT NULL,
      user_name               TEXT    NOT NULL,
      action                  TEXT    NOT NULL,
      entity_type             TEXT,
      entity_id               TEXT,
      description             TEXT    NOT NULL,
      old_value               TEXT,
      new_value               TEXT,
      created_at              TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_audit_user   ON audit_log(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
    CREATE INDEX IF NOT EXISTS idx_audit_date   ON audit_log(created_at);

    -- ============================================================
    -- BACKUP_LOG
    -- ============================================================
    CREATE TABLE IF NOT EXISTS backup_log (
      id                      TEXT    PRIMARY KEY,
      backup_type             TEXT    NOT NULL CHECK (backup_type IN ('تلقائي','يدوي')),
      file_path               TEXT    NOT NULL,
      file_name               TEXT    NOT NULL,
      file_size_kb            INTEGER NOT NULL DEFAULT 0,
      status                  TEXT    NOT NULL CHECK (status IN ('نجح','فشل')),
      error_message           TEXT,
      started_at              TEXT    NOT NULL DEFAULT (datetime('now')),
      completed_at            TEXT
    );

    -- ============================================================
    -- SCHEMA_VERSION (for migrations)
    -- ============================================================
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now')),
      description TEXT
    );

    -- Insert initial version if empty
    INSERT OR IGNORE INTO schema_version (version, description) VALUES (1, 'Initial schema');

    -- ============================================================
    -- VIEWS
    -- ============================================================
    CREATE VIEW IF NOT EXISTS v_daily_summary AS
    SELECT
      date(i.date) AS day,
      COUNT(CASE WHEN i.invoice_type='بيع' AND i.status='مكتمل' THEN 1 END) AS invoices_count,
      COALESCE(SUM(CASE WHEN i.invoice_type='بيع' AND i.status='مكتمل' THEN i.total ELSE 0 END), 0) AS total_sales,
      COALESCE(SUM(CASE WHEN i.invoice_type='مرتجع' THEN i.total ELSE 0 END), 0) AS total_returns,
      COALESCE(SUM(CASE WHEN i.invoice_type='بيع' AND i.status='مكتمل' THEN i.total ELSE 0 END), 0)
      - COALESCE(SUM(CASE WHEN i.invoice_type='مرتجع' THEN i.total ELSE 0 END), 0) AS net_sales
    FROM invoices i
    GROUP BY date(i.date);

    CREATE VIEW IF NOT EXISTS v_low_stock AS
    SELECT
      p.id, p.name, p.barcode, p.stock, p.stock_alert,
      c.name AS category_name,
      CASE
        WHEN p.stock = 0 THEN 'نفذ'
        WHEN p.stock <= p.stock_alert THEN 'منخفض'
        ELSE 'طبيعي'
      END AS stock_status
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = 1 AND p.is_service = 0 AND p.stock <= p.stock_alert;

    CREATE VIEW IF NOT EXISTS v_expiring_soon AS
    SELECT
      p.id, p.name, p.barcode, p.stock,
      p.expiry_date,
      CAST(julianday(p.expiry_date) - julianday('now') AS INTEGER) AS days_until_expiry,
      c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = 1
      AND p.expiry_date IS NOT NULL
      AND julianday(p.expiry_date) - julianday('now') <= p.expiry_alert_days
    ORDER BY p.expiry_date ASC;

    -- ============================================================
    -- TRIGGERS
    -- ============================================================
    CREATE TRIGGER IF NOT EXISTS trg_products_updated
    AFTER UPDATE ON products
    WHEN OLD.updated_at = NEW.updated_at
    BEGIN
      UPDATE products SET updated_at = datetime('now') WHERE id = NEW.id;
    END;
  `);
}

/**
 * Hash a password using crypto (no bcrypt dependency)
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify password
 */
function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const verify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === verify;
}

/**
 * Seed initial data
 */
function seedData() {
  // Check if admin already exists
  const adminExists = db.prepare("SELECT id FROM users WHERE username = 'admin'").get();
  if (adminExists) return; // Already seeded

  const adminPasswordHash = hashPassword('admin123');

  // Admin user only - no other seed data
  db.prepare(`INSERT INTO users (id, username, password_hash, full_name, role,
    can_view_costs, can_apply_discount, max_discount_pct,
    can_void_invoice, can_manage_products, can_view_reports, is_active, must_change_password)
    VALUES ('user-admin-001', 'admin', ?, 'المدير العام', 'admin',
    1, 1, 100, 1, 1, 1, 1, 1)`).run(adminPasswordHash);

  // Add default category
  db.prepare(`INSERT INTO categories (id, name, color, pos_order, is_active) 
    VALUES ('cat-1', 'مواد غذائية', '#22c55e', 0, 1)`).run();

  // Add expense categories
  const expenseCategories = [
    { id: 'ec-1', name: 'إيجار' },
    { id: 'ec-2', name: 'كهرباء' },
    { id: 'ec-3', name: 'مياه' },
    { id: 'ec-4', name: 'رواتب' },
    { id: 'ec-5', name: 'صيانة' },
    { id: 'ec-6', name: 'نقل' },
    { id: 'ec-7', name: 'مستلزمات' },
  ];
  
  for (const cat of expenseCategories) {
    db.prepare(`INSERT OR IGNORE INTO expense_categories (id, name, is_active) 
      VALUES (?, ?, 1)`).run(cat.id, cat.name);
  }

  console.log('Admin user created: admin / admin123 (must change password)');
  console.log('Default category created');
  console.log('Expense categories created');
}

/**
 * Run database migrations
 */
function runMigrations() {
  const currentVersion = db.prepare('SELECT MAX(version) as v FROM schema_version').get()?.v || 0;

  // Define migrations as version => { sql, description }
  const migrations = {
    2: {
      sql: `
        -- Insert expense categories if they don't exist
        INSERT OR IGNORE INTO expense_categories (id, name, is_active) VALUES ('ec-1', 'إيجار', 1);
        INSERT OR IGNORE INTO expense_categories (id, name, is_active) VALUES ('ec-2', 'كهرباء', 1);
        INSERT OR IGNORE INTO expense_categories (id, name, is_active) VALUES ('ec-3', 'مياه', 1);
        INSERT OR IGNORE INTO expense_categories (id, name, is_active) VALUES ('ec-4', 'رواتب', 1);
        INSERT OR IGNORE INTO expense_categories (id, name, is_active) VALUES ('ec-5', 'صيانة', 1);
        INSERT OR IGNORE INTO expense_categories (id, name, is_active) VALUES ('ec-6', 'نقل', 1);
        INSERT OR IGNORE INTO expense_categories (id, name, is_active) VALUES ('ec-7', 'مستلزمات', 1);
      `,
      description: 'Add expense categories'
    },
    3: {
      sql: `ALTER TABLE expenses ADD COLUMN user_name TEXT;`,
      description: 'Add user_name column to expenses table'
    }
  };

  for (const [version, migration] of Object.entries(migrations)) {
    const v = parseInt(version);
    if (v > currentVersion) {
      console.log(`Running migration ${v}: ${migration.description}`);
      db.transaction(() => {
        db.exec(migration.sql);
        db.prepare('INSERT INTO schema_version (version, description) VALUES (?, ?)').run(v, migration.description);
      })();
    }
  }
}

/**
 * Generate a unique ID
 */
function generateId(prefix = '') {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex');
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
}

module.exports = { initDatabase, getDb, hashPassword, verifyPassword, generateId };
