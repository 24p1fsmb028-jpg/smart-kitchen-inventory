import app, { ensureDB } from './app.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  await ensureDB();
  app.listen(PORT, () => {
    console.log(`🚀 Smart Kitchen Inventory API server running at http://localhost:${PORT}`);
  });
}

startServer();
