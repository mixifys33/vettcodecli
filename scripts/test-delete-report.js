/**
 * Test script to delete a report from the live deployment
 * This will test the DELETE /api/reports/[id] endpoint
 */

const reportId = "report_1785404066845_310w1mbe2";

async function testDeleteReport() {
  try {
    console.log("Testing DELETE endpoint for report:", reportId);
    console.log("Target:", `https://vettcodecli.vercel.app/api/reports/${reportId}`);
    
    // You need to provide a valid JWT token
    // Get this from your browser's localStorage after logging in to the app
    const token = process.argv[2];
    
    if (!token) {
      console.error("\n❌ ERROR: No token provided!");
      console.log("\nUsage: node test-delete-report.js YOUR_JWT_TOKEN");
      console.log("\nTo get your token:");
      console.log("1. Go to https://vettcodecli.vercel.app");
      console.log("2. Log in to your account");
      console.log("3. Open browser DevTools (F12)");
      console.log("4. Go to Console tab");
      console.log("5. Type: localStorage.getItem('token')");
      console.log("6. Copy the token (without quotes)");
      console.log("7. Run: node test-delete-report.js YOUR_TOKEN_HERE\n");
      process.exit(1);
    }
    
    console.log("\nSending DELETE request...\n");
    
    const response = await fetch(
      `https://vettcodecli.vercel.app/api/reports/${reportId}`,
      {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    const data = await response.json();
    
    console.log("Response Status:", response.status);
    console.log("Response Body:", JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log("\n✅ SUCCESS: Report deletion request completed");
      
      if (data.imagekitDeleted) {
        console.log("✅ ImageKit: File deleted successfully");
      } else {
        console.log("⚠️  ImageKit: File was NOT deleted");
        if (data.imagekitError) {
          console.log("   Error:", data.imagekitError.message);
        }
      }
      
      // Try to fetch the report to confirm it's gone
      console.log("\nVerifying deletion by fetching the report...");
      const verifyResponse = await fetch(
        `https://vettcodecli.vercel.app/api/reports/${reportId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      console.log("Verification Status:", verifyResponse.status);
      
      if (verifyResponse.status === 404) {
        console.log("✅ MongoDB: Report successfully deleted (404 Not Found)");
      } else {
        console.log("⚠️  MongoDB: Report may still exist");
      }
      
      // Try to fetch from ImageKit directly
      console.log("\nChecking ImageKit directly...");
      const imagekitUrl = `https://ik.imagekit.io/HackerX1234567/vettcode-reports/${reportId}.json`;
      const imagekitResponse = await fetch(imagekitUrl);
      
      console.log("ImageKit Status:", imagekitResponse.status);
      
      if (imagekitResponse.status === 404) {
        console.log("✅ ImageKit: File successfully deleted (404 Not Found)");
      } else if (imagekitResponse.ok) {
        console.log("❌ ImageKit: File STILL EXISTS (this is the problem!)");
        console.log("   URL:", imagekitUrl);
      }
      
    } else {
      console.log("\n❌ FAILED: Report deletion failed");
      
      if (response.status === 401) {
        console.log("   Reason: Invalid or expired token");
        console.log("   Please provide a valid JWT token");
      } else if (response.status === 404) {
        console.log("   Reason: Report not found or you don't have permission");
      } else {
        console.log("   Reason:", data.error || "Unknown error");
      }
    }
    
  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
  }
}

testDeleteReport();
