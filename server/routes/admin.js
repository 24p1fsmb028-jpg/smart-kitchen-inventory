import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/db.js';
import crypto from 'crypto';

const router = express.Router();
const hashPassword = (password) => crypto.createHash('sha256').update(password + 'ski_salt_2024').digest('hex');

// GET /api/admin/metrics  — Platform-wide stats
router.get('/metrics', async (req, res) => {
  try {
    const [users, requests, categories, items, alerts] = await Promise.all([
      db.getAllUsers(),
      db.getAllRequests(),
      db.getCategories(),
      db.getItems(),
      db.getAlerts(200)
    ]);

    const pendingCount = requests.filter(r => r.status === 'pending').length;
    const lowStockItems = items.filter(i => i.status === 'low').length;
    const outOfStockItems = items.filter(i => i.status === 'out_of_stock').length;

    res.json({
      success: true,
      metrics: {
        total_customers: users.filter(u => u.role === 'customer').length,
        total_users: users.length,
        pending_requests: pendingCount,
        total_categories: categories.length,
        total_items: items.length,
        low_stock_items: lowStockItems,
        out_of_stock_items: outOfStockItems,
        unread_alerts: alerts.filter(a => !a.read).length
      }
    });
  } catch (err) {
    console.error('Admin metrics error:', err);
    res.status(500).json({ success: false, error: 'Failed to load metrics.' });
  }
});

// GET /api/admin/requests  — List all registration requests
router.get('/requests', async (req, res) => {
  try {
    const { status } = req.query;
    const requests = await db.getAllRequests(status || null);
    res.json({ success: true, requests });
  } catch (err) {
    console.error('Get requests error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch requests.' });
  }
});

// POST /api/admin/requests/:id/approve  — Approve a request and create account
router.post('/requests/:id/approve', async (req, res) => {
  try {
    const request = await db.getRequestById(req.params.id);
    if (!request) return res.status(404).json({ success: false, error: 'Request not found.' });
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, error: `Request is already ${request.status}.` });
    }

    // Create the user account
    const userId = `user-${uuidv4()}`;
    const user = await db.createUser({
      id: userId,
      name: request.name,
      email: request.email,
      password_hash: request.password_hash,
      role: 'customer',
      phone: request.phone || '',
      kitchen_name: request.kitchen_name || `${request.name}'s Kitchen`,
      household_size: request.household_size || 2,
      status: 'active'
    });

    // Update request status
    await db.updateRequestStatus(req.params.id, 'approved');

    const { password_hash, ...safeUser } = user;
    res.json({
      success: true,
      message: `Account approved and created for ${request.name} (${request.email})`,
      user: safeUser
    });
  } catch (err) {
    console.error('Approve request error:', err);
    res.status(500).json({ success: false, error: 'Failed to approve request.' });
  }
});

// POST /api/admin/requests/:id/reject  — Reject/ignore a request
router.post('/requests/:id/reject', async (req, res) => {
  try {
    const request = await db.getRequestById(req.params.id);
    if (!request) return res.status(404).json({ success: false, error: 'Request not found.' });
    await db.updateRequestStatus(req.params.id, 'rejected');
    res.json({ success: true, message: `Request from ${request.email} has been rejected.` });
  } catch (err) {
    console.error('Reject request error:', err);
    res.status(500).json({ success: false, error: 'Failed to reject request.' });
  }
});

// GET /api/admin/users  — List all user accounts
router.get('/users', async (req, res) => {
  try {
    const users = await db.getAllUsers();
    // Strip password hashes
    const safeUsers = users.map(({ password_hash, ...u }) => u);
    res.json({ success: true, users: safeUsers });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch users.' });
  }
});

// POST /api/admin/users  — Manually create a user account
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role, phone, kitchen_name, household_size } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }
    const existing = await db.getUserByEmail(email.toLowerCase().trim());
    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }
    const userId = `user-${uuidv4()}`;
    const user = await db.createUser({
      id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash: hashPassword(password),
      role: role || 'customer',
      phone: phone || '',
      kitchen_name: kitchen_name || `${name.trim()}'s Kitchen`,
      household_size: parseInt(household_size) || 2,
      status: 'active'
    });
    const { password_hash, ...safeUser } = user;
    res.status(201).json({ success: true, user: safeUser });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ success: false, error: 'Failed to create user.' });
  }
});

// PATCH /api/admin/users/:id  — Update user status (active/suspended)
router.patch('/users/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be active or suspended.' });
    }
    const user = await db.updateUserStatus(req.params.id, status);
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });
    const { password_hash, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ success: false, error: 'Failed to update user.' });
  }
});

// DELETE /api/admin/users/:id  — Delete a user account
router.delete('/users/:id', async (req, res) => {
  try {
    await db.deleteUser(req.params.id);
    res.json({ success: true, message: 'User account deleted.' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete user.' });
  }
});

export default router;
