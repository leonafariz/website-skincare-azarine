const express = require('express');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/verify - Verify Firebase ID token (used right after Google login)
// Auth is stateless: the admin frontend sends the ID token as a Bearer header
// on every admin request, so no server-side session is stored.
router.post('/verify', (req, res, next) => {
    // Accept the token from the body too, for the initial login call
    if (!req.headers.authorization && req.body && req.body.idToken) {
        req.headers.authorization = `Bearer ${req.body.idToken}`;
    }
    next();
}, requireAdmin, (req, res) => {
    res.json({ success: true, user: req.user });
});

// GET /api/auth/me - Check current token
router.get('/me', requireAdmin, (req, res) => {
    res.json({ user: req.user });
});

// POST /api/auth/logout - No server state to clear (stateless auth)
router.post('/logout', (req, res) => {
    res.json({ success: true });
});

module.exports = router;
