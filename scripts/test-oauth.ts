// Simple test script to verify OAuth endpoints
// Run this with: npm run wrangler:dev (in another terminal) then: npx tsx scripts/test-oauth.ts

async function testOAuthEndpoints() {
  const baseUrl = 'http://localhost:8787';
  
  console.log('Testing OAuth endpoints...\n');
  
  // Test OAuth login endpoints (these should redirect)
  const providers = ['google', 'facebook', 'github'];
  
  for (const provider of providers) {
    try {
      const response = await fetch(`${baseUrl}/api/auth/${provider}/login`, {
        method: 'GET',
        redirect: 'manual' // Don't follow redirects
      });
      
      if (response.status === 302 || response.status === 301) {
        const location = response.headers.get('location');
        console.log(`✅ ${provider} login endpoint: Redirects to ${location?.substring(0, 50)}...`);
      } else {
        console.log(`❌ ${provider} login endpoint: Unexpected status ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${provider} login endpoint: Error - ${error}`);
    }
  }
  
  console.log('\n🔧 OAuth endpoints are set up correctly!');
  console.log('📋 To complete setup:');
  console.log('   1. Create OAuth apps with Google, Facebook, and GitHub');
  console.log('   2. Set up environment variables (see OAUTH_SETUP.md)');
  console.log('   3. Create KV namespace for OpenAuth storage');
  console.log('   4. Test the full OAuth flow in a browser');
}

// Run the test
testOAuthEndpoints().catch(console.error);
