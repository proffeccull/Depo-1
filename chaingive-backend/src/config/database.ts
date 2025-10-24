import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Create Neon connection
const sql = neon(process.env.DATABASE_URL!);

// Create Drizzle ORM instance
export const db = drizzle(sql);

// Export the raw SQL connection for direct queries if needed
export { sql };

// Test connection function
export async function testConnection() {
  try {
    const result = await sql`SELECT version()`;
    console.log('✅ Database connection successful:', result[0].version);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}