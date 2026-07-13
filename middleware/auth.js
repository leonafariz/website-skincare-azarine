const { auth } = require('../config/firebase');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'leonafariz01@gmail.com';

// Stateless admin auth: verify the Firebase ID token sent on every request.
// (Session storage does not survive between serverless invocations on Vercel.)
async function requireAdmin(req, res, next) {
    const header = req.headers.authorization || '';
    const idToken = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!idToken) {
        return res.status(401).json({ error: 'Unauthorized. Please login.' });
    }

    try {
        const decoded = await auth.verifyIdToken(idToken);
        if (decoded.email !== ADMIN_EMAIL) {
            return res.status(403).json({ error: 'Forbidden. Only admin can access this resource.' });
        }
        req.user = {
            email: decoded.email,
            name: decoded.name || decoded.email,
            picture: decoded.picture || '',
        };
        next();
    } catch (err) {
        console.error('Token verification failed:', err.message);
        return res.status(401).json({ error: 'Token tidak valid. Silakan login ulang.' });
    }
}

module.exports = { requireAdmin };
