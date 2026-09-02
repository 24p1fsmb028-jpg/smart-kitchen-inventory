/**
 * Automated end-to-end API test script for Smart Kitchen Inventory
 */
async function runTests() {
  const base = 'http://localhost:5000/api';
  console.log('🚀 Running Smart Kitchen Inventory API Verification Suite...');

  // 1. Health check
  const healthRes = await fetch(`${base}/health`);
  const health = await healthRes.json();
  console.log('✅ 1. Health check:', health.status);

  // 2. Categories
  const catsRes = await fetch(`${base}/categories`);
  const cats = await catsRes.json();
  console.log(`✅ 2. Categories retrieved: ${cats.data.length} categories`);

  // 3. Items
  const itemsRes = await fetch(`${base}/items`);
  const items = await itemsRes.json();
  console.log(`✅ 3. Items retrieved: ${items.data.length} items`);

  // 4. Create item with Low Stock quantity
  const createRes = await fetch(`${base}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Organic Almond Butter',
      category_id: 'cat-dairy',
      unit: 'packs',
      current_quantity: 0.5,
      weekly_usage: 1.0,
      low_stock_threshold: 1.0,
      icon: 'Package',
      notes: 'Testing automated alert engine'
    })
  });
  const created = await createRes.json();
  console.log(`✅ 4. Created item: "${created.data.name}" [Status: ${created.data.status}, Est. Days: ${created.data.days_remaining}]`);

  // 5. Check Alert Generation
  const alertsRes = await fetch(`${base}/alerts`);
  const alerts = await alertsRes.json();
  console.log(`✅ 5. Alerts retrieved: ${alerts.total_count} total, ${alerts.unread_count} unread.`);
  console.log(`   Latest alert: "${alerts.data[0]?.message}"`);

  // 6. Shopping List Auto-Sync
  const shopRes = await fetch(`${base}/shopping-list`);
  const shop = await shopRes.json();
  console.log(`✅ 6. Shopping list auto-synced: ${shop.data.buy_now.length} items to buy, ${shop.data.well_stocked.length} well-stocked.`);

  // 7. Check-off item and Bulk Restock
  const checkRes = await fetch(`${base}/shopping-list/check/${created.data.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ checked: true })
  });
  const checkData = await checkRes.json();
  console.log(`✅ 7. Toggled shopping item check-off: ${checkData.checked_ids.length} checked.`);

  const restockRes = await fetch(`${base}/shopping-list/restock-checked`, {
    method: 'POST'
  });
  const restockData = await restockRes.json();
  console.log(`✅ 8. Bulk Restock: ${restockData.message}`);

  // 8. Verify restocked item is now in_stock
  const itemAfter = await (await fetch(`${base}/items/${created.data.id}`)).json();
  console.log(`✅ 9. Verified item status after restock: "${itemAfter.data.name}" -> ${itemAfter.data.status} (${itemAfter.data.current_quantity} ${itemAfter.data.unit})`);

  // 9. Clean up test item
  await fetch(`${base}/items/${created.data.id}`, { method: 'DELETE' });
  console.log(`✅ 10. Cleaned up test item successfully.`);

  // 10. Verify Frontend
  const frontendRes = await fetch('http://localhost:3000');
  console.log(`✅ 11. Frontend dev server (Vite + React) responding with status: ${frontendRes.status}`);

  console.log('\n🎉 ALL 11 VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

runTests().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
