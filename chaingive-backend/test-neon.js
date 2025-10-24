const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function testNeonConnection() {
  console.log('🧪 Testing Neon Database Connection...\n');

  try {
    // Create Neon connection
    const sql = neon(process.env.DATABASE_URL);

    console.log('📡 Connecting to Neon database...');

    // Test basic connection
    const versionResult = await sql`SELECT version()`;
    console.log('✅ Connection successful!');
    console.log('📊 PostgreSQL Version:', versionResult[0].version);

    // Test database schema
    console.log('\n🔍 Checking database schema...');

    // Check if tables exist
    const tablesResult = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log(`📋 Found ${tablesResult.length} tables in database:`);
    tablesResult.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });

    // Test a simple query on User table if it exists
    if (tablesResult.some(row => row.table_name === 'User')) {
      console.log('\n👤 Testing User table...');
      const userCount = await sql`SELECT COUNT(*) as count FROM "User"`;
      console.log(`   Users in database: ${userCount[0].count}`);
    }

    console.log('\n🎉 All tests passed! Neon database is ready.');

  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);

    if (error.message.includes('authentication failed')) {
      console.log('\n💡 Possible issues:');
      console.log('   - Check DATABASE_URL in .env file');
      console.log('   - Verify Neon database credentials');
      console.log('   - Ensure database is not paused');
    } else if (error.message.includes('connect')) {
      console.log('\n💡 Possible issues:');
      console.log('   - Check network connectivity');
      console.log('   - Verify Neon database is running');
      console.log('   - Check firewall settings');
    }

    process.exit(1);
  }
}

// Run the test
testNeonConnection();