const express = require('express');
const { db } = require('../config/firebase');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/products - Public: List all products
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('products')
            .orderBy('createdAt', 'desc')
            .get();

        const products = [];
        snapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });

        res.json(products);
    } catch (error) {
        console.error('Fetch products error:', error);
        res.status(500).json({ error: 'Failed to fetch products.' });
    }
});

// GET /api/products/:id - Public: Get single product
router.get('/:id', async (req, res) => {
    try {
        const doc = await db.collection('products').doc(req.params.id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Product not found.' });
        }
        res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error('Fetch product error:', error);
        res.status(500).json({ error: 'Failed to fetch product.' });
    }
});

// POST /api/products - Admin: Create product
router.post('/', requireAdmin, async (req, res) => {
    try {
        const { name, category, price, tag, rating, reviewsCount, skinTypes, imageUrl, desc, usage, ingredients } = req.body;

        if (!name || !category || !price) {
            return res.status(400).json({ error: 'Name, category, and price are required.' });
        }

        const productData = {
            name,
            category,
            price,
            tag: tag || '',
            rating: parseFloat(rating) || 0,
            reviewsCount: parseInt(reviewsCount) || 0,
            skinTypes: skinTypes || [],
            imageUrl: imageUrl || '',
            desc: desc || '',
            usage: usage || '',
            ingredients: ingredients || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const docRef = await db.collection('products').add(productData);

        res.json({ success: true, id: docRef.id, ...productData });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Failed to create product.' });
    }
});

// PUT /api/products/:id - Admin: Update product
router.put('/:id', requireAdmin, async (req, res) => {
    try {
        const { name, category, price, tag, rating, reviewsCount, skinTypes, imageUrl, desc, usage, ingredients } = req.body;

        const updateData = {
            updatedAt: new Date().toISOString(),
        };

        if (name !== undefined) updateData.name = name;
        if (category !== undefined) updateData.category = category;
        if (price !== undefined) updateData.price = price;
        if (tag !== undefined) updateData.tag = tag;
        if (rating !== undefined) updateData.rating = parseFloat(rating);
        if (reviewsCount !== undefined) updateData.reviewsCount = parseInt(reviewsCount);
        if (skinTypes !== undefined) updateData.skinTypes = skinTypes;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
        if (desc !== undefined) updateData.desc = desc;
        if (usage !== undefined) updateData.usage = usage;
        if (ingredients !== undefined) updateData.ingredients = ingredients;

        await db.collection('products').doc(req.params.id).update(updateData);

        res.json({ success: true, id: req.params.id });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Failed to update product.' });
    }
});

// DELETE /api/products/:id - Admin: Delete product
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        await db.collection('products').doc(req.params.id).delete();
        res.json({ success: true });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Failed to delete product.' });
    }
});

module.exports = router;
