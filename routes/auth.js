const express = require('express');
const { admin } = require('../config/firebase');

const router = express.Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'leonafariz01@gmail.com';

// POST /api/auth/verify - Verify Firebase ID token from frontend
router.post('/verify', async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({ error: 'Missing ID token.' });
    }

    try {
        // Verify the Firebase ID token server-side
        const decoded = await admin.auth().verifyIdToken(idToken);

        if (decoded.email !== ADMIN_EMAIL) {
            return res.status(403).json({
                error: `Akses ditolak. Hanya akun ${ADMIN_EMAIL} yang diizinkan.`
            });
        }

        // Store user in session
        req.session.user = {
            email: decoded.email,
            name: decoded.name || decoded.email,
            picture: decoded.picture || '',
        };

        res.json({ success: true, user: req.session.user });
    } catch (err) {
        console.error('Token verification failed:', err.message);
        res.status(401).json({ error: 'Token tidak valid. Silakan login ulang.' });
    }
});

// GET /api/auth/me - Check current session
router.get('/me', (req, res) => {
    if (req.session && req.session.user) {
        return res.json({ user: req.session.user });
    }
    res.status(401).json({ error: 'Not authenticated' });
});

// POST /api/auth/logout - Clear session
router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});

module.exports = router;
