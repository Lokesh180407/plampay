/**
 * Route Verification Script
 * Tests all API endpoints to ensure they're accessible and responding correctly
 */

const http = require('http');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            method,
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path: url.pathname,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (data) {
            const body = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(body);
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    resolve({ status: res.statusCode, data: json });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);
        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function testRoute(name, method, path, expectedStatuses = [200]) {
    try {
        const result = await makeRequest(method, path);
        const isExpected = expectedStatuses.includes(result.status);

        if (isExpected) {
            log(`✓ ${name}: ${method} ${path} → ${result.status}`, 'green');
            return { name, success: true, status: result.status };
        } else {
            log(`✗ ${name}: ${method} ${path} → ${result.status} (expected ${expectedStatuses.join(' or ')})`, 'red');
            log(`  Response: ${JSON.stringify(result.data)}`, 'yellow');
            return { name, success: false, status: result.status, data: result.data };
        }
    } catch (error) {
        log(`✗ ${name}: ${method} ${path} → ERROR`, 'red');
        log(`  ${error.message}`, 'yellow');
        return { name, success: false, error: error.message };
    }
}

async function runTests() {
    log('\n=== PlamPay API Route Verification ===\n', 'cyan');
    log(`Testing against: ${BASE_URL}\n`, 'blue');

    const results = [];

    // Test public routes (should return 200)
    log('--- Public Routes ---', 'cyan');
    results.push(await testRoute('Root Endpoint', 'GET', '/'));
    results.push(await testRoute('Health Check', 'GET', '/api/health'));

    // Test auth routes (should return 400 for missing data, not 404)
    log('\n--- Auth Routes (expect 400 for validation errors) ---', 'cyan');
    results.push(await testRoute('Signup Endpoint', 'POST', '/api/auth/signup', [400]));
    results.push(await testRoute('Login Endpoint', 'POST', '/api/auth/login', [400]));

    // Test protected routes (should return 401 for missing auth, not 404)
    log('\n--- Protected Routes (expect 401 for missing auth) ---', 'cyan');
    results.push(await testRoute('KYC Upload', 'POST', '/api/kyc/upload', [401]));
    results.push(await testRoute('Palm Enroll', 'POST', '/api/palm/enroll', [401]));
    results.push(await testRoute('Wallet Set PIN', 'POST', '/api/wallet/set-pin', [401]));
    results.push(await testRoute('Wallet Verify PIN', 'POST', '/api/wallet/verify-pin', [401]));
    results.push(await testRoute('Wallet Balance', 'POST', '/api/wallet/balance', [401]));
    results.push(await testRoute('Wallet Topup', 'POST', '/api/wallet/topup', [401]));

    // Test terminal routes (should return 400 for missing data, not 404)
    log('\n--- Terminal Routes (expect 400 for validation errors) ---', 'cyan');
    results.push(await testRoute('Payment Scan-Pay', 'POST', '/api/payment/scan-pay', [400]));

    // Test admin routes (should return 401 for missing auth, not 404)
    log('\n--- Admin Routes (expect 401 for missing auth) ---', 'cyan');
    results.push(await testRoute('Admin Verify KYC', 'POST', '/api/admin/verify-kyc', [401]));
    results.push(await testRoute('Admin Create Terminal', 'POST', '/api/admin/terminals', [401]));

    // Test invalid route (should return 404)
    log('\n--- Invalid Routes (expect 404) ---', 'cyan');
    results.push(await testRoute('Invalid Route', 'GET', '/api/invalid-route', [404]));

    // Summary
    log('\n=== Summary ===\n', 'cyan');
    const passed = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    log(`Total Tests: ${results.length}`, 'blue');
    log(`Passed: ${passed}`, 'green');
    log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');

    if (failed > 0) {
        log('\n❌ Some routes are not working correctly!', 'red');
        log('Check the errors above for details.\n', 'yellow');
        process.exit(1);
    } else {
        log('\n✅ All routes are working correctly!\n', 'green');
        process.exit(0);
    }
}

// Run the tests
runTests().catch((error) => {
    log(`\n❌ Test suite failed: ${error.message}\n`, 'red');
    process.exit(1);
});
