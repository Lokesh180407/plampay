/**
 * Quick Route Test Script
 * Tests routes with correct HTTP methods to verify they're working
 */

const https = require('https');
const http = require('http');

// Change this to your Render URL
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const isHttps = url.protocol === 'https:';
        const client = isHttps ? https : http;

        const options = {
            method,
            hostname: url.hostname,
            port: url.port || (isHttps ? 443 : 80),
            path: url.pathname,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (data) {
            const body = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(body);
        }

        const req = client.request(options, (res) => {
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

async function testRoutes() {
    console.log(`\n🧪 Testing routes on: ${BASE_URL}\n`);

    // Test 1: Root endpoint (GET)
    console.log('1️⃣  Testing GET / ...');
    try {
        const result = await makeRequest('GET', '/');
        console.log(`   ✅ Status: ${result.status}`);
        console.log(`   Response:`, JSON.stringify(result.data, null, 2));
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }

    // Test 2: Health check (GET)
    console.log('\n2️⃣  Testing GET /api/health ...');
    try {
        const result = await makeRequest('GET', '/api/health');
        console.log(`   ✅ Status: ${result.status}`);
        console.log(`   Response:`, JSON.stringify(result.data, null, 2));
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }

    // Test 3: Signup endpoint (POST - should return 400 for missing data)
    console.log('\n3️⃣  Testing POST /api/auth/signup (no data - expect 400) ...');
    try {
        const result = await makeRequest('POST', '/api/auth/signup');
        console.log(`   ✅ Status: ${result.status}`);
        if (result.status === 400) {
            console.log(`   ✅ Correct! Route exists and validates input`);
        } else if (result.status === 404) {
            console.log(`   ❌ ERROR: Route not found! This is the problem.`);
        }
        console.log(`   Response:`, JSON.stringify(result.data, null, 2));
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }

    // Test 4: Login endpoint (POST - should return 400 for missing data)
    console.log('\n4️⃣  Testing POST /api/auth/login (no data - expect 400) ...');
    try {
        const result = await makeRequest('POST', '/api/auth/login');
        console.log(`   ✅ Status: ${result.status}`);
        if (result.status === 400) {
            console.log(`   ✅ Correct! Route exists and validates input`);
        } else if (result.status === 404) {
            console.log(`   ❌ ERROR: Route not found! This is the problem.`);
        }
        console.log(`   Response:`, JSON.stringify(result.data, null, 2));
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }

    // Test 5: Wrong method on signup (GET instead of POST)
    console.log('\n5️⃣  Testing GET /api/auth/signup (wrong method - expect 404) ...');
    try {
        const result = await makeRequest('GET', '/api/auth/signup');
        console.log(`   Status: ${result.status}`);
        if (result.status === 404) {
            console.log(`   ✅ Correct! GET is not allowed, only POST`);
        }
        console.log(`   Response:`, JSON.stringify(result.data, null, 2));
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY:');
    console.log('='.repeat(60));
    console.log('If you see 404 for POST requests, routes are NOT working.');
    console.log('If you see 400/401 for POST requests, routes ARE working!');
    console.log('404 for GET on POST-only routes is EXPECTED and CORRECT.');
    console.log('='.repeat(60) + '\n');
}

testRoutes().catch(console.error);
