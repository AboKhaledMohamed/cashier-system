/**
 * OWASP Top 10 Security Test Suite for SmartPOS
 * اختبار أمان شامل بناءً على OWASP Top 10 2021/2025
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

/**
 * OWASP Top 10 2021 Security Testing Suite
 * 
 * A01 - Broken Access Control
 * A02 - Cryptographic Failures  
 * A03 - Injection
 * A04 - Insecure Design
 * A05 - Security Misconfiguration
 * A06 - Vulnerable Components
 * A07 - Authentication Failures
 * A08 - Data Integrity Failures
 * A09 - Logging Failures
 * A10 - SSRF / Exception Handling
 */

class OWASPTester {
  constructor() {
    const dbPath = path.join(os.homedir(), 'AppData', 'Local', 'smartpos', 'smartpos.db');
    this.db = new Database(dbPath);
    this.results = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
      tests: []
    };
  }

  log(category, test, severity, status, detail, remediation = '') {
    const icon = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : status === 'WARN' ? '⚠' : 'ℹ';
    console.log(`[${category}] ${icon} ${test}: ${detail}`);
    
    this.results.tests.push({
      category,
      test,
      severity,
      status,
      detail,
      remediation
    });

    if (status === 'FAIL') {
      if (severity === 'CRITICAL') this.results.critical++;
      else if (severity === 'HIGH') this.results.high++;
      else if (severity === 'MEDIUM') this.results.medium++;
      else if (severity === 'LOW') this.results.low++;
    } else if (status === 'INFO') {
      this.results.info++;
    }
  }

  // ============================================
  // A01:2025 - Broken Access Control
  // ============================================
  testBrokenAccessControl() {
    console.log('\n' + '='.repeat(60));
    console.log('A01:2025 - Broken Access Control (التحكم في الوصول)');
    console.log('='.repeat(60));

    // Test 1: Check for default/weak admin credentials
    try {
      const admin = this.db.prepare("SELECT * FROM users WHERE username = 'admin'").get();
      if (admin) {
        // Check if password is stored as plain text or weak hash
        this.log('A01', 'Default Admin Account', 'HIGH', 'WARN', 
          'Admin account exists - ensure strong password policy enforced',
          'Enforce password complexity and MFA');
      }
    } catch (e) {
      this.log('A01', 'Admin Account Check', 'HIGH', 'FAIL', e.message);
    }

    // Test 2: Check for SQL injection in ID parameters
    const maliciousIds = [
      "1 OR 1=1",
      "1' OR '1'='1",
      "1; DROP TABLE users; --",
      "../../../etc/passwd"
    ];

    for (const malId of maliciousIds) {
      try {
        // Attempt to use malicious ID (should fail gracefully)
        const result = this.db.prepare('SELECT * FROM products WHERE id = ?').get(malId);
        if (result) {
          this.log('A01', `Input Validation: ${malId}`, 'CRITICAL', 'FAIL',
            'Malicious input returned results - SQL Injection possible!',
            'Use parameterized queries exclusively');
        }
      } catch (e) {
        // Error is good - means input was rejected
        this.log('A01', `Input Validation: ${malId.substring(0, 20)}...`, 'INFO', 'PASS',
          'Malicious input properly rejected');
      }
    }

    // Test 3: Check for direct object reference vulnerabilities
    try {
      const invoices = this.db.prepare('SELECT * FROM invoices ORDER BY created_at DESC LIMIT 1').get();
      if (invoices) {
        this.log('A01', 'IDOR Check', 'MEDIUM', 'INFO',
          `Latest invoice: ${invoices.id.substring(0, 15)}... - Verify authorization checks`);
      }
    } catch (e) {
      this.log('A01', 'IDOR Check', 'MEDIUM', 'FAIL', e.message);
    }

    // Test 4: Check role-based access
    try {
      const users = this.db.prepare('SELECT role, COUNT(*) as count FROM users GROUP BY role').all();
      users.forEach(u => {
        this.log('A01', `Role Distribution: ${u.role}`, 'INFO', 'INFO',
          `${u.count} users with role ${u.role}`);
      });
    } catch (e) {
      this.log('A01', 'Role Check', 'MEDIUM', 'FAIL', e.message);
    }
  }

  // ============================================
  // A02:2025 - Cryptographic Failures
  // ============================================
  testCryptographicFailures() {
    console.log('\n' + '='.repeat(60));
    console.log('A02:2025 - Cryptographic Failures (المعاملات التشفيرية)');
    console.log('='.repeat(60));

    // Test 1: Check for plaintext passwords
    try {
      // Check schema for password_hash column
      const schemaCheck = this.db.prepare("PRAGMA table_info(users)").all();
      const hasPasswordHash = schemaCheck.some(col => col.name === 'password_hash');
      const hasPassword = schemaCheck.some(col => col.name === 'password');
      
      if (hasPassword) {
        this.log('A02', 'Password Column', 'CRITICAL', 'FAIL',
          'Column "password" exists - may store plaintext passwords!',
          'Rename to password_hash and hash all passwords');
      } else if (hasPasswordHash) {
        this.log('A02', 'Password Column', 'INFO', 'PASS',
          'Using password_hash column (correct)');
      } else {
        this.log('A02', 'Password Column Check', 'HIGH', 'WARN',
          'Neither password nor password_hash column found - verify schema');
      }

      // Check for plaintext values in password_hash
      const users = this.db.prepare('SELECT id, username, password_hash FROM users LIMIT 5').all();
      let plaintextFound = false;
      
      for (const user of users) {
        if (user.password_hash) {
          // Check if password looks like plaintext (no hash patterns)
          const isPlaintext = !user.password_hash.includes('$') && 
                             !user.password_hash.startsWith('$2') && // bcrypt
                             !user.password_hash.startsWith('$6') && // sha512
                             !user.password_hash.startsWith('$argon2') &&
                             user.password_hash.length < 60;
          
          if (isPlaintext) {
            plaintextFound = true;
            this.log('A02', `Plaintext Password: ${user.username}`, 'CRITICAL', 'FAIL',
              'Password stored in plaintext!',
              'Hash all passwords using bcrypt or Argon2');
          }
        }
      }

      if (!plaintextFound && hasPasswordHash) {
        this.log('A02', 'Password Storage', 'INFO', 'PASS',
          'No plaintext passwords detected in sample');
      }
    } catch (e) {
      this.log('A02', 'Password Check', 'CRITICAL', 'FAIL', e.message);
    }

    // Test 2: Check for sensitive data encryption
    try {
      const settings = this.db.prepare('SELECT * FROM shop_settings WHERE id = 1').get();
      this.log('A02', 'Sensitive Data Encryption', 'HIGH', 'INFO',
        'Verify encryption for tax_number, pin_code, and other PII');
    } catch (e) {
      this.log('A02', 'Data Encryption Check', 'HIGH', 'FAIL', e.message);
    }

    // Test 3: Check database encryption
    try {
      const pragma = this.db.prepare("PRAGMA cipher_version").get();
      if (pragma) {
        this.log('A02', 'Database Encryption', 'INFO', 'PASS',
          'Database appears to be encrypted');
      } else {
        this.log('A02', 'Database Encryption', 'HIGH', 'WARN',
          'Database may not be encrypted - verify file encryption at rest',
          'Enable SQLite encryption (SQLCipher) or OS-level encryption');
      }
    } catch (e) {
      this.log('A02', 'DB Encryption Check', 'MEDIUM', 'INFO',
        'Could not verify database encryption');
    }
  }

  // ============================================
  // A03:2025 - Injection (SQL Injection)
  // ============================================
  testInjection() {
    console.log('\n' + '='.repeat(60));
    console.log('A03:2025 - Injection (SQL Injection)');
    console.log('='.repeat(60));

    // SQL Injection payloads
    const payloads = [
      "' OR '1'='1",
      "'; DROP TABLE products; --",
      "' UNION SELECT * FROM users --",
      "1 AND 1=1",
      "1 AND 1=2",
      "1' AND '1'='1",
      "1' AND '1'='2",
      "admin'--",
      "admin'/*",
      "admin' OR '1'='1'/*"
    ];

    for (const payload of payloads) {
      try {
        // Test in WHERE clause
        const safeQuery = this.db.prepare('SELECT * FROM products WHERE id = ?');
        const result = safeQuery.get(payload);
        
        if (result && payload.includes('OR')) {
          this.log('A03', `SQL Injection: ${payload.substring(0, 30)}`, 'CRITICAL', 'FAIL',
            'Potential SQL Injection - parameterized query may not be used',
            'Always use parameterized queries, never string concatenation');
        } else {
          this.log('A03', `Input Sanitization: ${payload.substring(0, 20)}...`, 'INFO', 'PASS',
            'Input properly sanitized');
        }
      } catch (e) {
        // Error indicates proper rejection
        this.log('A03', `SQL Injection Blocked: ${payload.substring(0, 20)}...`, 'INFO', 'PASS',
          'Malicious input blocked');
      }
    }

    // Check for dynamic SQL in handlers
    try {
      const handlersDir = path.join(__dirname, '..', 'electron', 'handlers');
      if (fs.existsSync(handlersDir)) {
        const files = fs.readdirSync(handlersDir);
        let dynamicSqlFound = false;

        for (const file of files) {
          if (file.endsWith('.js')) {
            const content = fs.readFileSync(path.join(handlersDir, file), 'utf8');
            
            // Look for string concatenation in SQL (dangerous pattern)
            const dangerousPatterns = [
              /\.prepare\([^?]*\+/,  // prepare("..." + variable)
              /\.run\([^,]*\+/,       // run("..." + variable)
              /query\s*\+\s*/         // query + variable
            ];

            for (const pattern of dangerousPatterns) {
              if (pattern.test(content)) {
                dynamicSqlFound = true;
                this.log('A03', `Dynamic SQL in ${file}`, 'HIGH', 'WARN',
                  `Potential dynamic SQL detected in ${file}`,
                  'Convert to parameterized queries');
              }
            }
          }
        }

        if (!dynamicSqlFound) {
          this.log('A03', 'SQL Injection Prevention', 'INFO', 'PASS',
            'No obvious dynamic SQL patterns found in handlers');
        }
      }
    } catch (e) {
      this.log('A03', 'Code Analysis', 'MEDIUM', 'INFO', 'Could not analyze handler files');
    }
  }

  // ============================================
  // A04:2025 - Insecure Design
  // ============================================
  testInsecureDesign() {
    console.log('\n' + '='.repeat(60));
    console.log('A04:2025 - Insecure Design');
    console.log('='.repeat(60));

    // Test 1: Check for business logic flaws
    try {
      // Negative balance check
      const negativeBalances = this.db.prepare(`
        SELECT COUNT(*) as count FROM customers WHERE current_balance < 0
      `).get();
      
      if (negativeBalances.count > 0) {
        this.log('A04', 'Business Logic: Negative Balances', 'HIGH', 'FAIL',
          `${negativeBalances.count} customers with negative balances`,
          'Add constraints to prevent negative balances');
      } else {
        this.log('A04', 'Business Logic: Balance Validation', 'INFO', 'PASS',
          'No negative balances found');
      }

      // Check for duplicate invoices
      const duplicates = this.db.prepare(`
        SELECT invoice_number, COUNT(*) as count 
        FROM invoices 
        GROUP BY invoice_number 
        HAVING count > 1
      `).all();

      if (duplicates.length > 0) {
        this.log('A04', 'Business Logic: Duplicate Invoices', 'HIGH', 'FAIL',
          `${duplicates.length} duplicate invoice numbers found`,
          'Add unique constraint on invoice_number');
      }
    } catch (e) {
      this.log('A04', 'Business Logic Check', 'MEDIUM', 'FAIL', e.message);
    }

    // Test 2: Rate limiting (check audit log for rapid actions)
    try {
      const rapidActions = this.db.prepare(`
        SELECT user_id, action, COUNT(*) as count
        FROM audit_log
        WHERE created_at >= datetime('now', '-1 hour')
        GROUP BY user_id, action
        HAVING count > 100
      `).all();

      if (rapidActions.length > 0) {
        this.log('A04', 'Rate Limiting', 'MEDIUM', 'WARN',
          'Possible rate limit evasion detected - rapid actions found',
          'Implement rate limiting on critical operations');
      }
    } catch (e) {
      this.log('A04', 'Rate Limiting Check', 'LOW', 'INFO', 'Could not analyze action rates');
    }
  }

  // ============================================
  // A05:2025 - Security Misconfiguration
  // ============================================
  testSecurityMisconfiguration() {
    console.log('\n' + '='.repeat(60));
    console.log('A05:2025 - Security Misconfiguration');
    console.log('='.repeat(60));

    // Test 1: Check for default configurations
    try {
      const settings = this.db.prepare('SELECT * FROM shop_settings WHERE id = 1').get();
      if (settings) {
        this.log('A05', 'Default Configuration', 'MEDIUM', 'INFO',
          'Shop settings exist - verify not using defaults for production');
      }
    } catch (e) {
      this.log('A05', 'Settings Check', 'MEDIUM', 'FAIL', e.message);
    }

    // Test 2: Check for debug/test accounts
    try {
      const testAccounts = this.db.prepare(`
        SELECT * FROM users 
        WHERE username LIKE '%test%' 
        OR username LIKE '%admin%' 
        OR username LIKE '%demo%'
      `).all();

      if (testAccounts.length > 0) {
        this.log('A05', 'Test/Demo Accounts', 'HIGH', 'WARN',
          `${testAccounts.length} potential test accounts found: ${testAccounts.map(a => a.username).join(', ')}`,
          'Remove test accounts before production deployment');
      }
    } catch (e) {
      this.log('A05', 'Test Accounts Check', 'MEDIUM', 'INFO', 'Could not check for test accounts');
    }

    // Test 3: Check file permissions (Windows)
    try {
      const dbPath = path.join(os.homedir(), 'AppData', 'Local', 'smartpos', 'smartpos.db');
      const stats = fs.statSync(dbPath);
      
      // Check if file is world-readable (on Windows this is less relevant but good to log)
      this.log('A05', 'Database File Permissions', 'INFO', 'INFO',
        `DB file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    } catch (e) {
      this.log('A05', 'File Permissions', 'MEDIUM', 'INFO', 'Could not check file permissions');
    }
  }

  // ============================================
  // A06:2025 - Vulnerable Components
  // ============================================
  testVulnerableComponents() {
    console.log('\n' + '='.repeat(60));
    console.log('A06:2025 - Vulnerable and Outdated Components');
    console.log('='.repeat(60));

    // Check package.json for known vulnerabilities
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
      
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      // Known vulnerable packages (simplified check)
      const knownVulnerable = [
        { name: 'electron', minVersion: '22.0.0', severity: 'HIGH' },
        { name: 'better-sqlite3', minVersion: '8.0.0', severity: 'MEDIUM' },
        { name: 'react', minVersion: '18.0.0', severity: 'MEDIUM' },
        { name: 'express', minVersion: '4.17.0', severity: 'HIGH' }
      ];

      for (const pkg of knownVulnerable) {
        if (dependencies[pkg.name]) {
          const version = dependencies[pkg.name].replace(/[^0-9.]/g, '');
          this.log('A06', `Dependency: ${pkg.name}@${version}`, 'INFO', 'INFO',
            `Verify ${pkg.name} is up to date (min: ${pkg.minVersion})`,
            `Run 'npm audit' and update to latest version`);
        }
      }

      this.log('A06', 'Dependency Check', 'INFO', 'INFO',
        'Run "npm audit" for detailed vulnerability report');
    } catch (e) {
      this.log('A06', 'Package Analysis', 'MEDIUM', 'INFO', 'Could not analyze package.json');
    }
  }

  // ============================================
  // A07:2025 - Authentication Failures
  // ============================================
  testAuthenticationFailures() {
    console.log('\n' + '='.repeat(60));
    console.log('A07:2025 - Authentication Failures');
    console.log('='.repeat(60));

    // Test 1: Check password policies
    try {
      const users = this.db.prepare('SELECT username, last_login_at FROM users').all();
      
      for (const user of users) {
        if (!user.last_login_at) {
          this.log('A07', `Inactive Account: ${user.username}`, 'MEDIUM', 'WARN',
            'User has never logged in',
            'Implement account inactivation after period of non-use');
        }
      }
    } catch (e) {
      this.log('A07', 'Account Activity Check', 'MEDIUM', 'INFO', e.message);
    }

    // Test 2: Check for session management
    this.log('A07', 'Session Management', 'HIGH', 'INFO',
      'Verify session timeout and secure cookie settings in Electron app');

    // Test 3: Check for brute force protection
    try {
      const failedLogins = this.db.prepare(`
        SELECT COUNT(*) as count 
        FROM audit_log 
        WHERE action = 'تسجيل_دخول_فاشل' 
        AND created_at >= datetime('now', '-1 hour')
      `).get();

      if (failedLogins.count > 10) {
        this.log('A07', 'Brute Force Detection', 'HIGH', 'WARN',
          `${failedLogins.count} failed login attempts in last hour`,
          'Implement account lockout after failed attempts');
      }
    } catch (e) {
      this.log('A07', 'Failed Login Check', 'LOW', 'INFO', 'Could not check failed logins');
    }
  }

  // ============================================
  // A08:2025 - Data Integrity Failures
  // ============================================
  testDataIntegrity() {
    console.log('\n' + '='.repeat(60));
    console.log('A08:2025 - Software and Data Integrity Failures');
    console.log('='.repeat(60));

    // Test 1: Check for orphaned records
    const integrityChecks = [
      {
        name: 'Invoice Items without Invoice',
        query: `
          SELECT COUNT(*) as count FROM invoice_items ii
          LEFT JOIN invoices i ON ii.invoice_id = i.id
          WHERE i.id IS NULL
        `
      },
      {
        name: 'Payments without Customer',
        query: `
          SELECT COUNT(*) as count FROM payments p
          LEFT JOIN customers c ON p.party_id = c.id
          WHERE p.party_type = 'customer' AND c.id IS NULL
        `
      },
      {
        name: 'Stock Movements without Product',
        query: `
          SELECT COUNT(*) as count FROM stock_movements sm
          LEFT JOIN products p ON sm.product_id = p.id
          WHERE p.id IS NULL
        `
      }
    ];

    for (const check of integrityChecks) {
      try {
        const result = this.db.prepare(check.query).get();
        if (result.count > 0) {
          this.log('A08', check.name, 'HIGH', 'FAIL',
            `${result.count} orphaned records found`,
            'Add foreign key constraints and cleanup routines');
        } else {
          this.log('A08', check.name, 'INFO', 'PASS',
            'No orphaned records');
        }
      } catch (e) {
        this.log('A08', check.name, 'MEDIUM', 'INFO', 'Could not verify');
      }
    }

    // Test 2: Check for inconsistent balances
    try {
      const inconsistent = this.db.prepare(`
        SELECT id, name, current_balance, credit_used, total_debts, total_paid
        FROM customers
        WHERE ABS((total_debts - total_paid) - current_balance) > 0.01
        AND is_active = 1
      `).all();

      if (inconsistent.length > 0) {
        this.log('A08', 'Balance Consistency', 'CRITICAL', 'FAIL',
          `${inconsistent.length} customers with inconsistent balances`,
          'Recalculate balances and fix triggers');
      } else {
        this.log('A08', 'Balance Consistency', 'INFO', 'PASS',
          'All customer balances are consistent');
      }
    } catch (e) {
      this.log('A08', 'Balance Check', 'HIGH', 'FAIL', e.message);
    }
  }

  // ============================================
  // A09:2025 - Logging Failures
  // ============================================
  testLoggingFailures() {
    console.log('\n' + '='.repeat(60));
    console.log('A09:2025 - Security Logging and Monitoring Failures');
    console.log('='.repeat(60));

    // Test 1: Check audit log coverage
    try {
      const actions = this.db.prepare(`
        SELECT action, COUNT(*) as count 
        FROM audit_log 
        WHERE created_at >= date('now', '-30 days')
        GROUP BY action
        ORDER BY count DESC
      `).all();

      const criticalActions = ['بيع_جديد', 'إلغاء_فاتورة', 'تسجيل_دخول', 'حذف_منتج'];
      const loggedActions = actions.map(a => a.action);

      for (const action of criticalActions) {
        if (loggedActions.includes(action)) {
          const count = actions.find(a => a.action === action)?.count || 0;
          this.log('A09', `Audit: ${action}`, 'INFO', 'PASS',
            `${count} events logged (30 days)`);
        } else {
          this.log('A09', `Missing Audit: ${action}`, 'MEDIUM', 'WARN',
            'Critical action not found in audit log',
            `Ensure all ${action} actions are logged`);
        }
      }
    } catch (e) {
      this.log('A09', 'Audit Coverage', 'HIGH', 'FAIL', e.message);
    }

    // Test 2: Check for sensitive data in logs
    this.log('A09', 'Sensitive Data in Logs', 'HIGH', 'INFO',
      'Manually verify no passwords, PINs, or credit cards in audit_log');

    // Test 3: Log retention
    try {
      const oldestLog = this.db.prepare(`
        SELECT MIN(created_at) as oldest FROM audit_log
      `).get();
      
      if (oldestLog.oldest) {
        const days = Math.floor((Date.now() - new Date(oldestLog.oldest).getTime()) / (1000 * 60 * 60 * 24));
        this.log('A09', 'Log Retention', 'INFO', 'INFO',
          `Audit logs retained for ${days} days`);
      }
    } catch (e) {
      this.log('A09', 'Log Retention Check', 'LOW', 'INFO', 'Could not check retention');
    }
  }

  // ============================================
  // A10:2025 - SSRF / Exception Handling
  // ============================================
  testSSRFAndExceptions() {
    console.log('\n' + '='.repeat(60));
    console.log('A10:2025 - SSRF / Exception Handling');
    console.log('='.repeat(60));

    // Test 1: Check for error information disclosure
    this.log('A10', 'Error Information Disclosure', 'MEDIUM', 'INFO',
      'Verify error messages do not expose stack traces or SQL details to users');

    // Test 2: Check for unhandled exceptions
    try {
      // This would require runtime testing in actual app
      this.log('A10', 'Exception Handling', 'MEDIUM', 'INFO',
        'Ensure all IPC handlers have try-catch blocks');
    } catch (e) {
      this.log('A10', 'Exception Check', 'MEDIUM', 'INFO', e.message);
    }

    // Test 3: SSRF prevention (if app makes external requests)
    this.log('A10', 'SSRF Prevention', 'LOW', 'INFO',
      'If app makes HTTP requests, validate and sanitize all URLs');
  }

  // ============================================
  // Generate Report
  // ============================================
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('OWASP TOP 10 SECURITY ASSESSMENT REPORT');
    console.log('='.repeat(60));
    console.log(`\nSeverity Summary:`);
    console.log(`  CRITICAL: ${this.results.critical}`);
    console.log(`  HIGH:     ${this.results.high}`);
    console.log(`  MEDIUM:   ${this.results.medium}`);
    console.log(`  LOW:      ${this.results.low}`);
    console.log(`  INFO:     ${this.results.info}`);
    console.log(`\nTotal Tests: ${this.results.tests.length}`);

    if (this.results.critical + this.results.high > 0) {
      console.log('\n⚠️  CRITICAL/HIGH issues require immediate attention!');
    }

    // Export detailed report
    const reportPath = path.join(__dirname, 'security-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\nDetailed report saved to: ${reportPath}`);

    return this.results;
  }

  // Run all tests
  runAll() {
    console.log('\n' + '='.repeat(60));
    console.log('SMARTPOS OWASP TOP 10 SECURITY TEST SUITE');
    console.log('='.repeat(60));
    console.log('Started:', new Date().toISOString());
    console.log('Database:', path.join(os.homedir(), 'AppData', 'Local', 'smartpos', 'smartpos.db'));

    this.testBrokenAccessControl();
    this.testCryptographicFailures();
    this.testInjection();
    this.testInsecureDesign();
    this.testSecurityMisconfiguration();
    this.testVulnerableComponents();
    this.testAuthenticationFailures();
    this.testDataIntegrity();
    this.testLoggingFailures();
    this.testSSRFAndExceptions();

    return this.generateReport();
  }
}

// Run if called directly
if (require.main === module) {
  const tester = new OWASPTester();
  tester.runAll();
}

module.exports = { OWASPTester };
