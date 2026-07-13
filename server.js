require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const leadsRoutes = require('./routes/leads');
const productsRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: isProduction,  // true on Vercel (HTTPS), false on localhost
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: isProduction ? 'none' : 'lax',
    },
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/products', productsRoutes);

// Serve static files - Admin panel
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Serve static files - Landing page (root)
app.use(express.static(path.join(__dirname), {
    index: 'index.html',
    extensions: ['html'],
}));

// Fallback for admin SPA routes
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});
app.get('/admin/', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
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
