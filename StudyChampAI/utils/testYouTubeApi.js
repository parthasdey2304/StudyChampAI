// Simple test script to verify YouTube API functionality
const API_KEY = 'AIzaSyAeVVobmTRA1aQpQbm_9_1PGils2PqXDmI';

async function testYouTubeAPI() {
  console.log('🚀 Testing YouTube API...');
  
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=physics%20tutorial&maxResults=3&key=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.log('❌ YouTube API Error:');
      console.log('  Code:', data.error.code);
      console.log('  Message:', data.error.message);
      console.log('  Reason:', data.error.errors?.[0]?.reason || 'Unknown');
      
      if (data.error.code === 403) {
        console.log('\n💡 Possible solutions:');
        console.log('  1. Check if YouTube Data API v3 is enabled in Google Cloud Console');
        console.log('  2. Verify API key has proper permissions');
        console.log('  3. Check quota limits');
        console.log('  4. Ensure billing is enabled if required');
      }
      return false;
    }
    
    if (data.items && data.items.length > 0) {
      console.log('✅ YouTube API Working!');
      console.log(`  Found ${data.items.length} videos`);
      console.log(`  First video: "${data.items[0].snippet.title}"`);
      console.log(`  Channel: ${data.items[0].snippet.channelTitle}`);
      return true;
    } else {
      console.log('⚠️ API working but no results found');
      return false;
    }
  } catch (error) {
    console.log('❌ Network/Connection Error:');
    console.log('  ', error.message);
    return false;
  }
}

// Run the test
testYouTubeAPI().then(success => {
  if (success) {
    console.log('\n🎉 YouTube integration should work properly in your app!');
  } else {
    console.log('\n⚠️ App will use mock/demo data instead of real YouTube videos');
  }
});
