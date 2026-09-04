import app from '../server/app.js';

// CRITICAL for Vercel: Disable Vercel's built-in body parser.
// Without this, Vercel consumes the raw multipart/form-data stream
// before multer gets a chance to read it, causing file uploads to silently fail.
export const config = {
  api: {
    bodyParser: false,   // Let multer handle multipart/form-data
    responseLimit: false // Allow large file responses
  }
};

export default app;
