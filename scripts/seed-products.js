/**
 * Seed script to populate Firestore with initial Azarine products.
 * Run with: npm run seed
 */
require('dotenv').config();
const { db } = require('../config/firebase');

const products = [
    {
        name: "Hydrasoothe Sunscreen Gel SPF 45 PA++++",
        category: "sunscreen",
        price: "Rp 65.000",
        tag: "Best Seller",
        rating: 4.9,
        reviewsCount: 1542,
        skinTypes: ["oily", "acne", "sensitive"],
        imageUrl: "https://images.unsplash.com/photo-1556229174-5e42a09e45af?auto=format&fit=crop&w=400&q=80",
        desc: "Sunscreen wajah dalam bentuk gel (water base) yang sangat ringan, dingin dan mudah meresap untuk seluruh jenis kulit termasuk kulit berminyak dan acne prone skin.",
        usage: "Oleskan secara merata pada bagian wajah, leher sebelum melakukan aktivitas luar ruangan.",
        ingredients: "Aloe Vera, Propolis, Green Tea, Pomegranate.",
    },
    {
        name: "C-White Lightening Serum",
        category: "serum",
        price: "Rp 52.500",
        tag: "Brightening",
        rating: 4.8,
        reviewsCount: 934,
        skinTypes: ["dry", "oily"],
        imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80",
        desc: "Serum wajah dengan Kakadu Plum (Vitamin C terbesar di dunia) untuk mencerahkan kulit kusam dan menyamarkan noda hitam.",
        usage: "Teteskan 2-3 tetes serum pada wajah, usapkan merata, gunakan pagi dan malam.",
        ingredients: "Kakadu Plum Extract, Lemon Extract, Papaya Extract, Hyaluronic Acid.",
    },
    {
        name: "Intense Luminous Barrier Moisturizer",
        category: "moisturizer",
        price: "Rp 69.000",
        tag: "Skin Barrier",
        rating: 4.9,
        reviewsCount: 812,
        skinTypes: ["dry", "sensitive"],
        imageUrl: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=400&q=80",
        desc: "Pelembap untuk memperbaiki skin barrier rusak, meredakan kemerahan, dan mengunci kelembapan 24 jam.",
        usage: "Oleskan merata pada wajah dan leher setelah serum. Pijat lembut.",
        ingredients: "Ceramide 3 & 4, Panthenol / Pro Vit B5, Hyaluronic Acid.",
    },
    {
        name: "Acne Spot Gel",
        category: "acne",
        price: "Rp 35.000",
        tag: "Acne Care",
        rating: 4.7,
        reviewsCount: 1102,
        skinTypes: ["acne", "sensitive"],
        imageUrl: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=400&q=80",
        desc: "Gel totol jerawat cepat meresap untuk meredakan peradangan, membunuh bakteri, dan mencegah bekas jerawat.",
        usage: "Totolkan pada area berjerawat setelah skincare. Gunakan 2-3 kali sehari.",
        ingredients: "Salicylic Acid / BHA, Centella Asiatica, Sulfur, Allantoin.",
    },
    {
        name: "Invisipore Ultra Matte Sunscreen SPF 50",
        category: "sunscreen",
        price: "Rp 72.000",
        tag: "Award Winner",
        rating: 4.9,
        reviewsCount: 689,
        skinTypes: ["oily", "acne"],
        imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=400&q=80",
        desc: "Pemenang C&T Allē Awards 2026. Sunscreen matte bebas kilap seharian, mengecilkan pori, menahan sebum.",
        usage: "Oleskan pada wajah dan leher sebelum beraktivitas. Cocok sebagai base make-up.",
        ingredients: "Canadian Willowherb, Centella Asiatica, Ectoin, SPF 50 PA++++.",
    },
    {
        name: "Niacinamide 5% + Moisture Serum",
        category: "serum",
        price: "Rp 59.000",
        tag: "Bright & Glow",
        rating: 4.8,
        reviewsCount: 754,
        skinTypes: ["dry", "oily", "sensitive"],
        imageUrl: "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=400&q=80",
        desc: "Serum Niacinamide 5% untuk mencerahkan noda, meratakan warna kulit, meredakan kemerahan, dan melembapkan.",
        usage: "Gunakan 2-3 tetes pada seluruh wajah setelah toner, pagi dan malam.",
        ingredients: "Niacinamide 5%, Acetyl Glucosamine, Fermented Honey.",
    },
];

async function seed() {
    console.log('🌱 Seeding Firestore with Azarine products...\n');

    for (const product of products) {
        const data = {
            ...product,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const docRef = await db.collection('products').add(data);
        console.log(`  ✅ Added: ${product.name} (ID: ${docRef.id})`);
    }

    console.log(`\n🎉 Successfully seeded ${products.length} products to Firestore!`);
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
