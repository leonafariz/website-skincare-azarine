const express = require('express');
const { google } = require('googleapis');
const { getOAuth2Client, getAuthUrl } = require('../config/auth');

const router = express.Router();

// GET /api/auth/google - Redirect to Google consent screen
router.get('/google', (req, res) => {
    const url = getAuthUrl();
    res.redirect(url);
});

// GET /api/auth/callback - Handle OAuth callback
router.get('/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send('Missing authorization code.');
    }

    try {
        const client = getOAuth2Client();
        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);

        // Get user info
        const oauth2 = google.oauth2({ version: 'v2', auth: client });
        const { data } = await oauth2.userinfo.get();

        const allowedEmail = process.env.ADMIN_EMAIL || 'leonafariz01@gmail.com';

        if (data.email !== allowedEmail) {
            return res.status(403).send(`
                <html><body style="font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#fdfbf7;">
                    <div style="text-align:center;max-width:400px;">
                        <h2 style="color:#e76f51;">Akses Ditolak</h2>
                        <p>Akun <strong>${data.email}</strong> tidak memiliki izin admin.</p>
                        <p>Hanya <strong>${allowedEmail}</strong> yang diizinkan.</p>
                        <a href="/" style="color:#0b3d2c;">Kembali ke Beranda</a>
                    </div>
                </body></html>
            `);
        }

        // Save session
        req.session.user = {
            email: data.email,
            name: data.name,
            picture: data.picture,
        };

        // Redirect to admin dashboard
        res.redirect('/admin/');
    } catch (error) {
        console.error('OAuth callback error:', error);
        res.status(500).send('Authentication failed. Please try again.');
    }
});

// GET /api/auth/me - Check current session
router.get('/me', (req, res) => {
    if (req.session && req.session.user) {
        return res.json({ authenticated: true, user: req.session.user });
    }
    return res.status(401).json({ authenticated: false });
});

// POST /api/auth/logout - Destroy session
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to logout.' });
        }
        res.json({ success: true });
    });
});

module.exports = router;
