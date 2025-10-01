#!/usr/bin/env node

/**
 * Performance Testing Script
 * 
 * This script tests various performance metrics for the recruitment system
 */

const https = require('https');
const http = require('http');

const testUrl = 'https://jawal-international-limited-pri2w.sevalla.page';

function performanceTest(url, path = '/dashboard') {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const fullUrl = url + path;
    
    console.log(`🔍 Testing: ${fullUrl}`);
    
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(fullUrl, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        
        const result = {
          url: fullUrl,
          statusCode: res.statusCode,
          responseTime: totalTime,
          contentLength: data.length,
          headers: res.headers,
          ttfb: totalTime, // Time to first byte (simplified)
        };
        
        resolve(result);
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(30000, () => {
      req.abort();
      reject(new Error('Request timeout'));
    });
  });
}

async function runPerformanceTests() {
  console.log('\n🚀 Performance Testing Suite');
  console.log('============================\n');
  
  const testPaths = [
    '/dashboard',
    '/candidates',
    '/agents',
    '/employers',
    '/login'
  ];
  
  const results = [];
  
  for (const path of testPaths) {
    try {
      const result = await performanceTest(testUrl, path);
      results.push(result);
      
      console.log(`✅ ${path}`);
      console.log(`   Response Time: ${result.responseTime}ms`);
      console.log(`   Status Code: ${result.statusCode}`);
      console.log(`   Content Size: ${(result.contentLength / 1024).toFixed(2)} KB`);
      console.log('');
      
      // Wait between requests to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`❌ ${path}: ${error.message}`);
      results.push({
        url: testUrl + path,
        error: error.message,
        responseTime: null
      });
    }
  }
  
  // Summary
  console.log('\n📊 Performance Summary');
  console.log('=====================\n');
  
  const successfulTests = results.filter(r => !r.error);
  const averageResponseTime = successfulTests.reduce((sum, r) => sum + r.responseTime, 0) / successfulTests.length;
  
  console.log(`Average Response Time: ${averageResponseTime.toFixed(2)}ms`);
  console.log(`Successful Tests: ${successfulTests.length}/${results.length}`);
  
  // Performance recommendations
  console.log('\n🎯 Performance Recommendations');
  console.log('==============================\n');
  
  if (averageResponseTime > 3000) {
    console.log('🔴 CRITICAL: Very slow response times (>3s)');
    console.log('   - Check server resources and database queries');
    console.log('   - Implement caching strategies');
    console.log('   - Optimize database indexes');
  } else if (averageResponseTime > 1000) {
    console.log('🟡 WARNING: Slow response times (>1s)');
    console.log('   - Consider implementing lazy loading');
    console.log('   - Optimize API calls and reduce payload sizes');
    console.log('   - Add client-side caching');
  } else {
    console.log('🟢 GOOD: Response times are acceptable');
  }
  
  console.log('\n🔧 Recommended Tools for Detailed Analysis:');
  console.log('==========================================\n');
  console.log('1. Google Lighthouse:');
  console.log('   lighthouse https://jawal-international-limited-pri2w.sevalla.page/dashboard');
  console.log('');
  console.log('2. WebPageTest:');
  console.log('   https://www.webpagetest.org/');
  console.log('');
  console.log('3. Chrome DevTools:');
  console.log('   - Open DevTools (F12)');
  console.log('   - Go to Performance tab');
  console.log('   - Record page load');
  console.log('');
  console.log('4. Network Analysis:');
  console.log('   - Check Network tab in DevTools');
  console.log('   - Look for large files and slow requests');
  console.log('   - Analyze waterfall chart');
}

// Additional utility functions
function generateCurlFormat() {
  const curlFormat = `
     time_namelookup:  %{time_namelookup}s\\n
        time_connect:  %{time_connect}s\\n
     time_appconnect:  %{time_appconnect}s\\n
    time_pretransfer:  %{time_pretransfer}s\\n
       time_redirect:  %{time_redirect}s\\n
  time_starttransfer:  %{time_starttransfer}s\\n
                     ----------\\n
          time_total:  %{time_total}s\\n
  `;
  
  console.log('\n📋 Curl Format for Detailed Timing:');
  console.log('===================================\n');
  console.log('Create a file called curl-format.txt with this content:');
  console.log(curlFormat);
  console.log('Then run:');
  console.log(`curl -w "@curl-format.txt" -o /dev/null -s ${testUrl}/dashboard`);
}

// Run the tests
runPerformanceTests()
  .then(() => {
    generateCurlFormat();
    console.log('\n✅ Performance testing completed!');
  })
  .catch(console.error);
