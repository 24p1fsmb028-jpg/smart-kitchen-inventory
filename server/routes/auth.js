import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/db.js';
import crypto from 'crypto';

const router = express.Router();
const hashPassword = (password) => crypto.createHash('sha256').update(password + 'ski_salt_2024').digest('hex');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const user = await db.getUserByEmail(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, error: 'Your account has been suspended. Contact the admin.' });
    }

    const hashed = hashPassword(password);
    if (user.password_hash !== hashed) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    // Record login timestamp & mark online
    await db.recordUserLogin(user.id);

    // Return user object without password_hash
    const { password_hash, ...safeUser } = user;
    safeUser.is_online = true;
    safeUser.last_login = new Date().toISOString();

    return res.json({ success: true, user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    const { userId } = req.body;
    if (userId) {
      await db.recordUserLogout(userId);
    }
    return res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ success: false, error: 'Logout failed.' });
  }
});

// POST /api/auth/register-request — Submit a new account request
router.post('/register-request', async (req, res) => {
  try {
    const { name, email, password, phone, kitchen_name, household_size, notes } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    const emailLower = email.toLowerCase().trim();

    // Check if email already exists in users
    const existingUser = await db.getUserByEmail(emailLower);
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }

    // Check if pending request already exists — update it if already pending
    const existingRequest = await db.getRequestByEmail(emailLower);
    if (existingRequest && existingRequest.status === 'pending') {
      await db.updatePendingRequest(existingRequest.id, {
        name: name.trim(),
        password_hash: hashPassword(password),
        password_plain: password,
        phone: phone || '',
        kitchen_name: kitchen_name || '',
        household_size: parseInt(household_size) || 2,
        notes: notes || ''
      });
      return res.status(200).json({
        success: true,
        message: 'Your account request details have been updated! The admin will review it shortly.',
        request_id: existingRequest.id
      });
    }

    const requestId = `req-${uuidv4()}`;
    const request = await db.createAccountRequest({
      id: requestId,
      name: name.trim(),
      email: emailLower,
      password_hash: hashPassword(password),
      password_plain: password,
      phone: phone || '',
      kitchen_name: kitchen_name || '',
      household_size: parseInt(household_size) || 2,
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      message: 'Your account request has been submitted! The admin will review it shortly.',
      request_id: requestId
    });
  } catch (err) {
    console.error('Register request error:', err);
    res.status(500).json({ success: false, error: 'Failed to submit request. Please try again.' });
  }
});

// GET /api/auth/request-status/:email — Check approval status by email
router.get('/request-status/:email', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase().trim();
    const request = await db.getRequestByEmail(email);
    if (!request) {
      return res.status(404).json({ success: false, error: 'No request found for this email.' });
    }
    res.json({ success: true, status: request.status, submitted_at: request.submitted_at });
  } catch (err) {
    console.error('Request status error:', err);
    res.status(500).json({ success: false, error: 'Failed to check status.' });
  }
});

export default router;
