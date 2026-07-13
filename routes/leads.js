const express = require('express');
const multer = require('multer');
const { db } = require('../config/firebase');
const { requireAdmin } = require('../middleware/auth');
const { analyzeSkin } = require('../services/skinAnalyzer');

const router = express.Router();

// Multer config for image upload (memory storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed.'), false);
        }
    },
});

// POST /api/leads/skin-analyze - Public: Upload face image for AI analysis
router.post('/skin-analyze', upload.single('image'), async (req, res) => {
    try {
        const { name, phone, email } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded.' });
        }
        if (!name || !phone) {
            return res.status(400).json({ error: 'Name and phone are required.' });
        }

        // Run AI skin analysis
        const analysis = await analyzeSkin(req.file.buffer, req.file.mimetype);

        // Save lead + analysis to Firestore
        const leadData = {
            name,
            phone,
            email: email || '',
            analysis,
            createdAt: new Date().toISOString(),
        };

        const docRef = await db.collection('leads_skin_analyze').add(leadData);

        res.json({
            success: true,
            leadId: docRef.id,
            analysis,
        });
    } catch (error) {
        console.error('Skin analysis error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat menganalisis kulit. Silakan coba lagi.' });
    }
});

// POST /api/leads/newsletter - Public: Save newsletter lead
router.post('/newsletter', async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required.' });
        }

        await db.collection('leads_newsletter').add({
            name,
            email,
            createdAt: new Date().toISOString(),
        });

        res.json({ success: true, message: 'Sukses! Gunakan Kode: AZARINEGLOW15 diskon 15%' });
    } catch (error) {
        console.error('Newsletter lead error:', error);
        res.status(500).json({ error: 'Failed to save newsletter lead.' });
    }
});

// POST /api/leads/reseller - Public: Save reseller lead
router.post('/reseller', async (req, res) => {
    try {
        const { name, phone, city, message } = req.body;
        if (!name || !phone) {
            return res.status(400).json({ error: 'Name and phone are required.' });
        }

        await db.collection('leads_reseller').add({
            name,
            phone,
            city: city || '',
            message: message || '',
            createdAt: new Date().toISOString(),
        });

        res.json({ success: true, message: 'Pendaftaran reseller terkirim!' });
    } catch (error) {
        console.error('Reseller lead error:', error);
        res.status(500).json({ error: 'Failed to save reseller lead.' });
    }
});

// GET /api/leads/skin-analyze - Admin: List skin analyzer leads
router.get('/skin-analyze', requireAdmin, async (req, res) => {
    try {
        const snapshot = await db.collection('leads_skin_analyze')
            .orderBy('createdAt', 'desc')
            .get();

        const leads = [];
        snapshot.forEach(doc => {
            leads.push({ id: doc.id, ...doc.data() });
        });

        res.json(leads);
    } catch (error) {
        console.error('Fetch skin leads error:', error);
        res.status(500).json({ error: 'Failed to fetch leads.' });
    }
});

// GET /api/leads/newsletter - Admin: List newsletter leads
router.get('/newsletter', requireAdmin, async (req, res) => {
    try {
        const snapshot = await db.collection('leads_newsletter')
            .orderBy('createdAt', 'desc')
            .get();

        const leads = [];
        snapshot.forEach(doc => {
            leads.push({ id: doc.id, ...doc.data() });
        });

        res.json(leads);
    } catch (error) {
        console.error('Fetch newsletter leads error:', error);
        res.status(500).json({ error: 'Failed to fetch leads.' });
    }
});

// GET /api/leads/reseller - Admin: List reseller leads
router.get('/reseller', requireAdmin, async (req, res) => {
    try {
        const snapshot = await db.collection('leads_reseller')
            .orderBy('createdAt', 'desc')
            .get();

        const leads = [];
        snapshot.forEach(doc => {
            leads.push({ id: doc.id, ...doc.data() });
        });

        res.json(leads);
    } catch (error) {
        console.error('Fetch reseller leads error:', error);
        res.status(500).json({ error: 'Failed to fetch leads.' });
    }
});

// DELETE /api/leads/:collection/:id - Admin: Delete a lead
router.delete('/:collection/:id', requireAdmin, async (req, res) => {
    try {
        const { collection, id } = req.params;
        const validCollections = ['skin-analyze', 'newsletter', 'reseller'];

        if (!validCollections.includes(collection)) {
            return res.status(400).json({ error: 'Invalid collection.' });
        }

        const collectionName = `leads_${collection.replace('-', '_')}`;
        await db.collection(collectionName).doc(id).delete();

        res.json({ success: true });
    } catch (error) {
        console.error('Delete lead error:', error);
        res.status(500).json({ error: 'Failed to delete lead.' });
    }
});

module.exports = router;
