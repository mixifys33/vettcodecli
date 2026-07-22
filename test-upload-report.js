/**
 * Test script to upload a mock report to the web app
 * Run with: node test-upload-report.js
 */

const fs = require('fs');
const https = require('https');

// Mock report data
const mockReport = {
  projectName: "vettcode-cli-landing",
  score: 32,
  grade: "F",
  summary: "Security scan found 137 issues requiring attention. Focus on critical vulnerabilities first.",
  executiveVerdict: "This application has significant security concerns that need immediate attention. Critical issues include missing file upload limits and input validation weaknesses.",
  findings: [
    {
      id: "test-1",
      severity: "critical",
      category: "input-validation",
      title: "File Upload Without Size Limit",
      description: "File upload functionality does not enforce size limits, potentially allowing denial of service attacks through resource exhaustion.",
      file: "components/CLIOutputPreview.tsx",
      line: 39,
      evidence: "// No file size validation present",
      mitigation: "Implement file size limits using middleware or validation libraries. Limit uploads to reasonable sizes (e.g., 10MB).",
      prevention: "Add input validation for all file uploads. Use libraries like multer with size limits.",
      impact: "high",
      confidence: 95
    },
    {
      severity: "high",
      category: "authentication",
      title: "Missing Authentication Check",
      description: "Sensitive operations lack authentication verification.",
      file: "app/api/reports/[id]/route.ts",
      line: 15,
      mitigation: "Add authentication middleware to verify user identity.",
      prevention: "Implement JWT or session-based authentication."
    },
    {
      severity: "medium",
      category: "xss",
      title: "Potential XSS in User Input",
      description: "User input not properly sanitized before rendering.",
      file: "components/AIAssistant.tsx",
      line: 67,
      mitigation: "Use DOMPurify or similar library to sanitize user input.",
      prevention: "Always escape user input before rendering in HTML."
    },
    {
      severity: "low",
      category: "code-quality",
      title: "Missing Error Boundary",
      description: "React components lack error boundaries for graceful degradation.",
      mitigation: "Add React Error Boundaries to catch and display errors gracefully.",
      prevention: "Implement error boundaries at component boundaries."
    }
  ],
  metadata: {
    projectName: "vettcode-cli-landing",
    filesScanned: 247,
    linesScanned: 32458,
    staticFindings: 140,
    aiFindings: 0,
    reportConfidence: 85,
    reportConfidenceGrade: "B+",
    scannedAt: new Date().toISOString()
  },
  criticalBlockers: [
    "File Upload Without Size Limit - Can lead to DoS attacks",
    "Missing Authentication - Sensitive endpoints exposed"
  ],
  strengths: [
    "Modern Next.js architecture with TypeScript",
    "Good component structure and separation of concerns",
    "Responsive design with Tailwind CSS"
  ]
};

// Upload to local (change URL for production)
const uploadUrl = process.argv[2] || 'http://localhost:3000/api/reports/upload';

const postData = JSON.stringify({
  report: mockReport,
  projectName: mockReport.projectName,
  scanMode: "quick"
});

console.log('📤 Uploading test report...\n');

const url = new URL(uploadUrl);
const options = {
  hostname: url.hostname,
  port: url.port || (url.protocol === 'https:' ? 443 : 80),
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = (url.protocol === 'https:' ? https : require('http')).request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (response.success) {
        console.log('✅ Success! Report uploaded\n');
        console.log('📊 Report ID:', response.reportId);
        console.log('🔗 Report URL:', response.reportUrl);
        console.log('⏰ Expires:', new Date(response.expiresAt).toLocaleString());
        console.log('\n💡 Visit the URL to see the report with AI assistant!\n');
      } else {
        console.error('❌ Upload failed:', response.error);
      }
    } catch (error) {
      console.error('❌ Failed to parse response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  console.log('\n💡 Make sure the development server is running:');
  console.log('   cd C:\\Users\\USER\\Desktop\\ALLOUTGADGATS\\vettcode-cli-landing');
  console.log('   npm run dev\n');
});

req.write(postData);
req.end();
