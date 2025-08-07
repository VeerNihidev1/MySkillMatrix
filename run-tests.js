#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class TestRunner {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      coverage: {},
      duration: 0,
      status: 'PENDING'
    };
  }

  async runTests() {
    console.log('🚀 Starting Test Execution...\n');
    
    const startTime = Date.now();
    
    try {
      // Create test reports directory
      this.ensureReportsDirectory();
      
      // Run tests with coverage
      console.log('🧪 Running Unit Tests with Coverage...');
      const testOutput = this.runJestTests();
      
      // Parse results
      this.parseTestResults(testOutput);
      
      // Generate reports
      this.generateReports();
      
      this.results.duration = Date.now() - startTime;
      this.results.status = this.results.failedTests === 0 ? 'PASSED' : 'FAILED';
      
      console.log('\n✅ Test execution completed!');
      console.log(`📊 Results: ${this.results.passedTests}/${this.results.totalTests} tests passed`);
      console.log(`⏱️ Duration: ${Math.round(this.results.duration / 1000)}s`);
      
      if (this.results.failedTests > 0) {
        console.log(`❌ ${this.results.failedTests} tests failed`);
        process.exit(1);
      }
      
    } catch (error) {
      console.error('❌ Test execution failed:', error.message);
      this.results.status = 'ERROR';
      this.generateErrorReport(error);
      process.exit(1);
    }
  }

  ensureReportsDirectory() {
    const reportsDir = path.join(process.cwd(), 'test-reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
  }

  runJestTests() {
    try {
      // Run Jest with coverage and JSON output
      const output = execSync('npx jest --coverage --json --outputFile=test-reports/jest-results.json', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return output;
    } catch (error) {
      // Jest returns non-zero exit code for failed tests, but we still want the output
      return error.stdout || '';
    }
  }

  parseTestResults(output) {
    try {
      // Try to read the JSON results file
      const resultsPath = path.join(process.cwd(), 'test-reports', 'jest-results.json');
      if (fs.existsSync(resultsPath)) {
        const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
        this.results.totalTests = results.numTotalTests || 0;
        this.results.passedTests = results.numPassedTests || 0;
        this.results.failedTests = results.numFailedTests || 0;
      }

      // Try to read coverage data
      const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
      if (fs.existsSync(coveragePath)) {
        const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
        this.results.coverage = coverage.total || {};
      }
    } catch (error) {
      console.warn('⚠️ Could not parse test results:', error.message);
      // Fallback to parsing console output
      this.parseConsoleOutput(output);
    }
  }

  parseConsoleOutput(output) {
    const lines = output.split('\n');
    for (const line of lines) {
      if (line.includes('Tests:')) {
        const match = line.match(/(\d+) passed.*?(\d+) total/);
        if (match) {
          this.results.passedTests = parseInt(match[1]);
          this.results.totalTests = parseInt(match[2]);
          this.results.failedTests = this.results.totalTests - this.results.passedTests;
        }
      }
    }
  }

  generateReports() {
    console.log('📋 Generating Test Reports...');
    
    // Generate HTML report
    this.generateHTMLReport();
    
    // Generate Markdown summary
    this.generateMarkdownReport();
    
    // Generate JSON report
    this.generateJSONReport();
    
    console.log('✅ Reports generated in test-reports/ directory');
  }

  generateHTMLReport() {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Report - Skill Assessment Platform</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9fa; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px; text-align: center; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin-top: 10px; }
        .status-passed { background: #d4edda; color: #155724; }
        .status-failed { background: #f8d7da; color: #721c24; }
        .status-error { background: #fff3cd; color: #856404; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .metric-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
        .metric-value { font-size: 2.5em; font-weight: bold; margin-bottom: 5px; }
        .metric-label { color: #666; font-size: 0.9em; }
        .success { color: #28a745; }
        .danger { color: #dc3545; }
        .info { color: #007bff; }
        .warning { color: #ffc107; }
        .coverage-section { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .coverage-bar { width: 100%; height: 24px; background: #e9ecef; border-radius: 12px; overflow: hidden; margin: 10px 0; }
        .coverage-fill { height: 100%; background: linear-gradient(90deg, #28a745, #20c997); transition: width 0.3s ease; }
        .coverage-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin-top: 20px; }
        .coverage-item { text-align: center; padding: 10px; background: #f8f9fa; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Test Report</h1>
            <h2>Skill Assessment Platform</h2>
            <p>Generated: ${new Date(this.results.timestamp).toLocaleString()}</p>
            <div class="status-badge status-${this.results.status.toLowerCase()}">
                ${this.results.status}
            </div>
        </div>

        <div class="metrics">
            <div class="metric-card">
                <div class="metric-value success">${this.results.passedTests}</div>
                <div class="metric-label">Tests Passed</div>
            </div>
            <div class="metric-card">
                <div class="metric-value danger">${this.results.failedTests}</div>
                <div class="metric-label">Tests Failed</div>
            </div>
            <div class="metric-card">
                <div class="metric-value info">${this.results.totalTests}</div>
                <div class="metric-label">Total Tests</div>
            </div>
            <div class="metric-card">
                <div class="metric-value warning">${Math.round(this.results.duration / 1000)}s</div>
                <div class="metric-label">Duration</div>
            </div>
        </div>

        ${this.results.coverage.lines ? `
        <div class="coverage-section">
            <h3>📊 Code Coverage</h3>
            <div style="margin: 15px 0;">
                <strong>Overall Coverage: ${this.results.coverage.lines.pct}%</strong>
            </div>
            <div class="coverage-bar">
                <div class="coverage-fill" style="width: ${this.results.coverage.lines.pct}%"></div>
            </div>
            <div class="coverage-grid">
                <div class="coverage-item">
                    <div style="font-weight: bold; color: #007bff;">${this.results.coverage.lines.pct}%</div>
                    <div style="font-size: 0.8em; color: #666;">Lines</div>
                </div>
                <div class="coverage-item">
                    <div style="font-weight: bold; color: #28a745;">${this.results.coverage.functions.pct}%</div>
                    <div style="font-size: 0.8em; color: #666;">Functions</div>
                </div>
                <div class="coverage-item">
                    <div style="font-weight: bold; color: #ffc107;">${this.results.coverage.branches.pct}%</div>
                    <div style="font-size: 0.8em; color: #666;">Branches</div>
                </div>
                <div class="coverage-item">
                    <div style="font-weight: bold; color: #dc3545;">${this.results.coverage.statements.pct}%</div>
                    <div style="font-size: 0.8em; color: #666;">Statements</div>
                </div>
            </div>
        </div>
        ` : ''}

        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; color: #666;">
            <p>📁 Detailed coverage report available in <code>coverage/lcov-report/index.html</code></p>
            <p>📊 Raw test data available in <code>test-reports/jest-results.json</code></p>
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(path.join(process.cwd(), 'test-reports', 'test-report.html'), html);
  }

  generateMarkdownReport() {
    const successRate = this.results.totalTests > 0 
      ? Math.round((this.results.passedTests / this.results.totalTests) * 100)
      : 0;

    const markdown = `# 🧪 Test Report - Skill Assessment Platform

## 📊 Summary

- **Status**: ${this.results.status} ${this.results.status === 'PASSED' ? '✅' : '❌'}
- **Generated**: ${new Date(this.results.timestamp).toLocaleString()}
- **Duration**: ${Math.round(this.results.duration / 1000)} seconds

## 📈 Test Results

| Metric | Value |
|--------|-------|
| Total Tests | ${this.results.totalTests} |
| Passed | ${this.results.passedTests} ✅ |
| Failed | ${this.results.failedTests} ❌ |
| Success Rate | ${successRate}% |

${this.results.coverage.lines ? `
## 📊 Code Coverage

| Type | Coverage |
|------|----------|
| Lines | ${this.results.coverage.lines.pct}% |
| Functions | ${this.results.coverage.functions.pct}% |
| Branches | ${this.results.coverage.branches.pct}% |
| Statements | ${this.results.coverage.statements.pct}% |
| **Overall** | **${this.results.coverage.lines.pct}%** |
` : ''}

## 📋 Test Categories

### ✅ Implemented Tests
- Component tests (LoginPage, UserAvatar, UserProfile)
- Hook tests (useAuth, useAssessment)
- Utility tests (UserManager)

### 🔄 Pending Tests
- Integration tests
- E2E tests
- Performance tests

---

*Report generated by automated test runner*`;

    fs.writeFileSync(path.join(process.cwd(), 'test-reports', 'test-summary.md'), markdown);
  }

  generateJSONReport() {
    fs.writeFileSync(
      path.join(process.cwd(), 'test-reports', 'test-results.json'),
      JSON.stringify(this.results, null, 2)
    );
  }

  generateErrorReport(error) {
    const errorReport = {
      timestamp: new Date().toISOString(),
      status: 'ERROR',
      error: {
        message: error.message,
        stack: error.stack
      }
    };

    fs.writeFileSync(
      path.join(process.cwd(), 'test-reports', 'error-report.json'),
      JSON.stringify(errorReport, null, 2)
    );
  }
}

// Run if called directly
const runner = new TestRunner();
runner.runTests().catch(console.error);
