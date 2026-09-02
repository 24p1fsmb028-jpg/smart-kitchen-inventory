import { initDB, db } from './db.js';

async function runSeed() {
  console.log('🌱 Starting database seeding for Smart Kitchen Inventory...');
  await initDB();
  const res = await db.resetToSeed();
  console.log('✅ Seeding completed:', res.message);
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
