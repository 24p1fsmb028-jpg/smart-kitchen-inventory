import app, { ensureDB } from '../server/app.js';

export default async function handler(req, res) {
  try {
    await ensureDB();
  } catch (err) {
    console.error('Database connection error in Vercel function:', err);
  }
  return app(req, res);
}
