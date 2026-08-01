/**
 * Test script to verify ImageKit deletion
 * Usage: node scripts/test-imagekit-delete.js report_1785403535357_6z9r8dp6w
 */

require('dotenv').config({ path: '.env.local' });
const ImageKit = require('imagekit');

const reportId = process.argv[2];

if (!reportId) {
  console.error('Usage: node scripts/test-imagekit-delete.js <reportId>');
  process.exit(1);
}

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
});

console.log('🔧 ImageKit Configuration:');
console.log('  Public Key:', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ? '✓ Set' : '✗ Missing');
console.log('  Private Key:', process.env.IMAGEKIT_PRIVATE_KEY ? '✓ Set' : '✗ Missing');
console.log('  URL Endpoint:', process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT);
console.log('');

async function testImageKitDelete() {
  try {
    console.log(`🔍 Searching for: ${reportId}.json`);
    console.log('');

    // Method 1: Search with path
    console.log('📂 Method 1: Searching with path /vettcode-reports');
    const files1 = await imagekit.listFiles({
      path: '/vettcode-reports',
      searchQuery: `name="${reportId}.json"`,
    });
    console.log(`  Found ${files1.length} files`);
    if (files1.length > 0) {
      console.log('  Files:', files1.map(f => ({ fileId: f.fileId, name: f.name, filePath: f.filePath })));
    }
    console.log('');

    // Method 2: Search without path
    console.log('🌐 Method 2: Searching without path restriction');
    const files2 = await imagekit.listFiles({
      searchQuery: `name="${reportId}.json"`,
    });
    console.log(`  Found ${files2.length} files`);
    if (files2.length > 0) {
      console.log('  Files:', files2.map(f => ({ fileId: f.fileId, name: f.name, filePath: f.filePath })));
    }
    console.log('');

    // Method 3: List all in folder
    console.log('📋 Method 3: Listing all files in /vettcode-reports folder');
    const allFiles = await imagekit.listFiles({
      path: '/vettcode-reports',
      limit: 1000,
    });
    console.log(`  Total files in folder: ${allFiles.length}`);
    
    const matchingFile = allFiles.find(f => f.name === `${reportId}.json`);
    if (matchingFile) {
      console.log('  ✓ Found matching file:', { 
        fileId: matchingFile.fileId, 
        name: matchingFile.name, 
        filePath: matchingFile.filePath 
      });
    } else {
      console.log('  ✗ No matching file found');
      console.log('  Sample files:', allFiles.slice(0, 5).map(f => f.name));
    }
    console.log('');

    // Choose best method
    const fileToDelete = files1[0] || files2[0] || matchingFile;

    if (fileToDelete) {
      console.log('🗑️  Attempting to delete file:', fileToDelete.fileId);
      console.log('   Name:', fileToDelete.name);
      console.log('   Path:', fileToDelete.filePath);
      console.log('');
      
      // Uncomment the line below to actually delete
      // const result = await imagekit.deleteFile(fileToDelete.fileId);
      // console.log('✅ Deletion result:', result);
      
      console.log('⚠️  Deletion disabled in test mode');
      console.log('   Uncomment line in script to actually delete');
    } else {
      console.log('❌ File not found in ImageKit');
      console.log('   The report may have already been deleted or never uploaded');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('   Stack:', error.stack);
    if (error.response) {
      console.error('   Response:', error.response.data || error.response);
    }
  }
}

testImageKitDelete();
