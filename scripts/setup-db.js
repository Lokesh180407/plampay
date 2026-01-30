/**
 * Database Setup Script
 * Run this to initialize the database with migrations
 */

require('dotenv').config();
const { execSync } = require('child_process');

console.log('🚀 Setting up database...\n');

try {
  console.log('📦 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  console.log('\n🗄️  Running database migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });

  console.log('\n✅ Database setup complete!');
  console.log('\n📊 To view your database:');
  console.log('   npx prisma studio\n');
} catch (error) {
  console.error('\n❌ Database setup failed:', error.message);
  process.exit(1);
}
