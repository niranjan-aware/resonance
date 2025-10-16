// backend/scripts/setupGoogleIntegration.js
import 'dotenv/config';
import GoogleIntegrationService from '../services/googleIntegration.js';
import Studio from '../models/Studio.js';
import connectDB from '../config/database.js';

/**
 * Script to initialize Google Calendar and Sheets integration
 * Run this once after setting up your Google credentials
 */

async function setupGoogleIntegration() {
  try {
    console.log('🚀 Starting Google Integration Setup...\n');

    // Connect to database
    await connectDB();
    console.log('✅ Connected to database\n');

    // Step 1: Initialize Google Sheet with headers
    console.log('📊 Setting up Google Sheet...');
    await GoogleIntegrationService.initializeSheet();
    console.log('✅ Google Sheet initialized successfully\n');

    // Step 2: Get all studios
    console.log('🎵 Fetching studios...');
    const studios = await Studio.find({ isActive: true });
    console.log(`✅ Found ${studios.length} active studios\n`);

    // Step 3: Display calendar mapping
    console.log('📅 Calendar Mapping:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    for (const studio of studios) {
      const calendarUrl = GoogleIntegrationService.getCalendarPublicUrl(studio._id);
      
      if (calendarUrl) {
        console.log(`\n🎸 ${studio.name}`);
        console.log(`   Studio ID: ${studio._id}`);
        console.log(`   Calendar: ${calendarUrl}`);
      } else {
        console.log(`\n⚠️  ${studio.name}`);
        console.log(`   Studio ID: ${studio._id}`);
        console.log(`   ❌ No calendar mapping found!`);
        console.log(`   → Please update STUDIO_CALENDAR_MAP in googleIntegration.js`);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Step 4: Display Google Sheet URL
    const sheetUrl = GoogleIntegrationService.getSheetPublicUrl();
    console.log('📄 Google Sheet URL:');
    console.log(`   ${sheetUrl}\n`);

    // Step 5: Final instructions
    console.log('✨ Setup Complete!\n');
    console.log('Next Steps:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. Verify that your Google Sheet has been created with headers');
    console.log('2. Make sure all studio calendars are properly mapped');
    console.log('3. Share calendars and sheet with your service account email');
    console.log('4. (Optional) Make calendars and sheet public for viewing');
    console.log('5. Test by creating a booking through the app\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the setup
setupGoogleIntegration();