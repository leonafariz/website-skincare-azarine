require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const leadsRoutes = require('./routes/leads');
const productsRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true }));

// Health/diagnostic endpoint: reports which env vars the function can see
// (booleans only, never values) and tests the Firestore connection.
app.get('/api/health', async (req, res) => {
    const envStatus = {};
    [
        'FIREBASE_PROJECT_ID',
        'FIREBASE_CLIENT_EMAIL',
        'FIREBASE_PRIVATE_KEY',
        'VERTEXAI_PROJECT_ID',
        'VERTEXAI_CLIENT_EMAIL',
        'VERTEXAI_PRIVATE_KEY',
        'ADMIN_EMAIL',
    ].forEach(name => { envStatus[name] = Boolean(process.env[name]); });

    let firestore = 'not tested';
    try {
        const { db } = require('./config/firebase');
        await db.collection('products').limit(1).get();
        firestore = 'connected';
    } catch (err) {
        firestore = `error: ${err.message}`;
    }

    res.json({
        env: envStatus,
        firestore,
        nodeEnv: process.env.NODE_ENV || '(not set)',
        vercelEnv: process.env.VERCEL_ENV || '(not on vercel)',
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/products', productsRoutes);

// 404 for unknown API routes (JSON instead of HTML)
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'API route not found.' });
});

// Serve static files - Admin panel
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Fallback for admin SPA routes
app.get(['/admin', '/admin/'], (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Block backend source & config files from being served publicly
const BLOCKED_PATHS = /^\/(config|routes|services|middleware|scripts|node_modules)(\/|$)|^\/(server\.js|package(-lock)?\.json|vercel\.json|\.env.*|.*\.md)$/i;
app.use((req, res, next) => {
    if (BLOCKED_PATHS.test(req.path)) {
        return res.status(404).send('Not found');
    }
    next();
});

// Serve static files - Landing page (root)
app.use(express.static(path.join(__dirname), {
    index: 'index.html',
    extensions: ['html'],
}));

// Error handler (multer upload errors, invalid JSON, etc.) — always respond JSON
app.use((err, req, res, next) => {
    console.error('Request error:', err.message);
    const status = err.name === 'MulterError' || err.type === 'entity.too.large' ? 400 : (err.status || 500);
    res.status(status).json({ error: err.message || 'Internal server error.' });
});

// REQUIRED for Vercel: export the app as a module
module.exports = app;

// Start server locally (only when run directly, not via Vercel)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`\n🌿 Azarine Cosmetic Server is running!`);
        console.log(`   Landing page:  http://localhost:${PORT}`);
        console.log(`   Admin panel:   http://localhost:${PORT}/admin/`);
        console.log(`   API docs:      http://localhost:${PORT}/api/products\n`);
    });
}
