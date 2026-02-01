/**
 * TestSprite Automation Runner
 * Runs all tests and generates a comprehensive report
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function runTests() {
    console.log('🚀 Starting TestSprite Automation Runner...');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('----------------------------------------');

    // Run Jest tests
    console.log('\n🧪 Running Jest Test Suite...');

    const jest = spawn('npm', ['test', '--', '--json', '--outputFile=report.json'], {
        stdio: 'inherit',
        platform: 'win32',
        shell: true
    });

    jest.on('close', (code) => {
        console.log('\n----------------------------------------');
        if (code === 0) {
            console.log('✅ All tests passed successfully!');

            // Read report
            try {
                const report = JSON.parse(fs.readFileSync('report.json', 'utf8'));
                console.log(`\n📊 Summary:`);
                console.log(`   Total Tests: ${report.numTotalTests}`);
                console.log(`   Passed:      ${report.numPassedTests}`);
                console.log(`   Failed:      ${report.numFailedTests}`);
                console.log(`   Suites:      ${report.numPassedTestSuites} passed / ${report.numTotalTestSuites} total`);
            } catch (e) {
                // ignore if report not found
            }

            console.log('\n✨ TestSprite Validation: SUCCESS');
        } else {
            console.error('❌ Some tests failed.');
            console.log('\n⚠️ TestSprite Validation: FAILED');
            process.exit(1);
        }
    });
}

runTests().catch(console.error);
