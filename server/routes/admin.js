import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/db.js';
import crypto from 'crypto';

const router = express.Router();
const hashPassword = (password) => crypto.createHash('sha256').update(password + 'ski_salt_2024').digest('hex');

// GET /api/admin/metrics — Platform-wide stats including online count
router.get('/metrics', async (req, res) => {
  try {
    const [users, requests, categories, items, alerts] = await Promise.all([
      db.getAllUsers(),
      db.getAllRequests(),
      db.getCategories(),
      db.getItems(),
      db.getAlerts(200)
    ]);

    const customers = users.filter(u => u.role === 'customer');
    const onlineCustomers = customers.filter(u => u.is_online).length;
    const pendingCount = requests.filter(r => r.status === 'pending').length;
    const lowStockItems = items.filter(i => i.status === 'low').length;
    const outOfStockItems = items.filter(i => i.status === 'out_of_stock').length;

    res.json({
      success: true,
      metrics: {
        total_customers: customers.length,
        online_customers: onlineCustomers,
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

// GET /api/admin/activity — Live login/logout and audit feed
router.get('/activity', async (req, res) => {
  try {
    const logs = await db.getActivityLogs(60);
    res.json({ success: true, logs });
  } catch (err) {
    console.error('Admin activity error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch activity logs.' });
  }
});

// GET /api/admin/requests — List all registration requests with plain password preview
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

// POST /api/admin/requests/:id/approve — Approve a request and create account
router.post('/requests/:id/approve', async (req, res) => {
  try {
    const request = await db.getRequestById(req.params.id);
    if (!request) return res.status(404).json({ success: false, error: 'Request not found.' });
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, error: `Request is already ${request.status}.` });
    }

    const emailLower = request.email.toLowerCase().trim();

    // Check if user account with this email already exists
    const existingUser = await db.getUserByEmail(emailLower);
    let user;

    if (existingUser) {
      // Update existing customer credentials and kitchen details
      await db.updateUserPassword(existingUser.id, request.password_plain || '', request.password_hash);
      user = await db.updateUserDetails(existingUser.id, {
        name: request.name,
        phone: request.phone || existingUser.phone,
        kitchen_name: request.kitchen_name || existingUser.kitchen_name,
        household_size: request.household_size || existingUser.household_size,
        status: 'active'
      });
      if (!user) user = existingUser;
    } else {
      // Create new customer account with plain password preserved
      const userId = `user-${uuidv4()}`;
      user = await db.createUser({
        id: userId,
        name: request.name,
        email: emailLower,
        password_hash: request.password_hash,
        password_plain: request.password_plain || '',
        role: 'customer',
        phone: request.phone || '',
        kitchen_name: request.kitchen_name || `${request.name}'s Kitchen`,
        household_size: request.household_size || 2,
        status: 'active'
      });
    }

    // Update request status to approved
    await db.updateRequestStatus(req.params.id, 'approved');

    // Log administrative activity
    await db.logActivity({
      userId: user.id,
      userName: request.name,
      userEmail: emailLower,
      action: 'request_approved',
      details: `Admin approved account for ${request.name} (${emailLower}).`
    });

    const { password_hash, ...safeUser } = user;
    res.json({
      success: true,
      message: `Account approved and activated for ${request.name}!`,
      user: safeUser
    });
  } catch (err) {
    console.error('Approve request error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to approve request.' });
  }
});

// POST /api/admin/requests/:id/reject — Reject/ignore a request (moves to trash)
router.post('/requests/:id/reject', async (req, res) => {
  try {
    const request = await db.getRequestById(req.params.id);
    if (!request) return res.status(404).json({ success: false, error: 'Request not found.' });
    await db.updateRequestStatus(req.params.id, 'rejected');

    await db.logActivity({
      userId: null,
      userName: request.name,
      userEmail: request.email,
      action: 'request_rejected',
      details: `Admin rejected registration request for ${request.email}.`
    });

    res.json({ success: true, message: `Request from ${request.email} has been rejected.` });
  } catch (err) {
    console.error('Reject request error:', err);
    res.status(500).json({ success: false, error: 'Failed to reject request.' });
  }
});

// DELETE /api/admin/requests/:id — Permanently delete a request (from trash)
router.delete('/requests/:id', async (req, res) => {
  try {
    const request = await db.getRequestById(req.params.id);
    if (!request) return res.status(404).json({ success: false, error: 'Request not found.' });
    await db.deleteRequest(req.params.id);
    res.json({ success: true, message: `Request from ${request.email} permanently deleted.` });
  } catch (err) {
    console.error('Delete request error:', err);
    res.status(500).json({ success: false, error: 'Failed to permanently delete request.' });
  }
});

// GET /api/admin/users — List all user accounts with passwords, online status, login/logout timestamps
router.get('/users', async (req, res) => {
  try {
    const users = await db.getAllUsers();
    // Return users including password_plain for admin eyes
    const formatted = users.map(({ password_hash, ...u }) => u);
    res.json({ success: true, users: formatted });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch users.' });
  }
});

// POST /api/admin/users — Manually create a customer account
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
      password_plain: password,
      role: role || 'customer',
      phone: phone || '',
      kitchen_name: kitchen_name || `${name.trim()}'s Kitchen`,
      household_size: parseInt(household_size) || 2,
      status: 'active'
    });

    await db.logActivity({
      userId,
      userName: name,
      userEmail: email,
      action: 'user_created',
      details: `Admin manually provisioned ${role || 'customer'} account for ${name} (${email}).`
    });

    const { password_hash, ...safeUser } = user;
    res.status(201).json({ success: true, user: safeUser });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ success: false, error: 'Failed to create user.' });
  }
});

// PATCH /api/admin/users/:id/password — Admin resets/changes a customer's password
router.patch('/users/:id/password', async (req, res) => {
  try {
    const { new_password } = req.body;
    if (!new_password || new_password.length < 4) {
      return res.status(400).json({ success: false, error: 'New password must be at least 4 characters.' });
    }
    const user = await db.getUserById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

    const newHash = hashPassword(new_password);
    const updated = await db.updateUserPassword(req.params.id, new_password, newHash);
    const { password_hash, ...safeUser } = updated;
    res.json({ success: true, message: `Password for ${user.email} updated to '${new_password}'`, user: safeUser });
  } catch (err) {
    console.error('Admin password change error:', err);
    res.status(500).json({ success: false, error: 'Failed to update password.' });
  }
});

// PATCH /api/admin/users/:id — Admin updates customer details
router.patch('/users/:id', async (req, res) => {
  try {
    const { name, email, phone, kitchen_name, household_size, status } = req.body;
    const user = await db.getUserById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

    const updates = {};
    if (name) updates.name = name.trim();
    if (email) updates.email = email.toLowerCase().trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (kitchen_name !== undefined) updates.kitchen_name = kitchen_name.trim();
    if (household_size !== undefined) updates.household_size = parseInt(household_size) || 2;
    if (status && ['active', 'suspended'].includes(status)) updates.status = status;

    const updated = await db.updateUserDetails(req.params.id, updates);
    const { password_hash, ...safeUser } = updated;
    res.json({ success: true, user: safeUser });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ success: false, error: 'Failed to update user details.' });
  }
});

// DELETE /api/admin/users/:id — Delete a user account
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await db.getUserById(req.params.id);
    await db.deleteUser(req.params.id);

    if (user) {
      await db.logActivity({
        userId: req.params.id,
        userName: user.name,
        userEmail: user.email,
        action: 'user_deleted',
        details: `Admin deleted user account ${user.email}.`
      });
    }

    res.json({ success: true, message: 'User account deleted.' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete user.' });
  }
});

export default router;
