const { getGenAIClient } = require('../config/vertexai');
const { db } = require('../config/firebase');

/**
 * Analyzes a face image using Gemini AI with product catalog as knowledgebase.
 * Uses @google/genai SDK with gemini-2.5-flash model via Vertex AI.
 * @param {Buffer} imageBuffer - The image file buffer
 * @param {string} mimeType - The MIME type of the image
 * @returns {Object} Structured skin analysis result
 */
async function analyzeSkin(imageBuffer, mimeType) {
    // 1. Load all products from Firestore as knowledgebase
    const productsSnapshot = await db.collection('products').get();
    const products = [];
    productsSnapshot.forEach(doc => {
        products.push({ id: doc.id, ...doc.data() });
    });

    const productCatalog = products.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        skinTypes: p.skinTypes,
        description: p.desc,
        ingredients: p.ingredients,
        tag: p.tag,
    }));

    // 2. Build the prompt
    const systemPrompt = `Kamu adalah AI Dermatologist profesional untuk brand skincare Azarine Cosmetic Indonesia.
Analisis foto wajah yang diunggah pengguna dan berikan diagnosis kulit yang sangat detail dan bermanfaat.

KATALOG PRODUK AZARINE (gunakan sebagai knowledge base untuk rekomendasi):
${JSON.stringify(productCatalog, null, 2)}

INSTRUKSI:
- Analisis foto wajah dengan cermat
- Identifikasi jenis kulit, kondisi kulit, level hidrasi, ukuran pori, tingkat keparahan jerawat, pigmentasi, dll.
- Berikan rekomendasi perawatan yang sangat berguna
- Rekomendasikan produk HANYA dari katalog Azarine di atas yang paling cocok
- Berikan tips perawatan kulit harian yang dipersonalisasi
- Jawab dalam Bahasa Indonesia yang ramah dan profesional

WAJIB mengembalikan respons dalam format JSON berikut (TANPA markdown code block):
{
  "skinType": "string (Berminyak/Kering/Kombinasi/Normal/Sensitif)",
  "skinConditions": ["array of string kondisi kulit yang terdeteksi"],
  "hydrationLevel": "string (Sangat Kurang/Kurang/Cukup/Baik/Sangat Baik)",
  "poreSize": "string (Kecil/Sedang/Besar)",
  "acneSeverity": "string (Tidak Ada/Ringan/Sedang/Parah)",
  "pigmentation": "string (Merata/Sedikit Tidak Merata/Hiperpigmentasi Ringan/Hiperpigmentasi Signifikan)",
  "overallScore": "number 1-100 (skor kesehatan kulit)",
  "detailedAnalysis": "string (paragraf analisis detail tentang kondisi kulit)",
  "recommendations": "string (paragraf rekomendasi perawatan harian)",
  "skincareTips": ["array of string tips perawatan kulit"],
  "recommendedProducts": [
    {
      "productId": "string (ID produk dari katalog)",
      "productName": "string (nama produk)",
      "reason": "string (alasan produk ini cocok untuk kondisi kulit pengguna)"
    }
  ]
}`;

    // 3. Send to Gemini with image using @google/genai SDK
    const base64Image = imageBuffer.toString('base64');
    
    const client = await getGenAIClient();

    const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            {
                role: 'user',
                parts: [
                    { text: systemPrompt },
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Image,
                        },
                    },
                    { text: 'Analisis wajah dalam foto ini dan berikan diagnosis kulit lengkap dalam format JSON yang diminta.' },
                ],
            },
        ],
        config: {
            responseMimeType: 'application/json',
        },
    });

    // 4. Parse the response
    let analysisText = '';
    if (response && response.text) {
        analysisText = response.text;
    } else if (response && response.candidates && response.candidates[0]) {
        const parts = response.candidates[0].content.parts;
        for (const part of parts) {
            if (part.text) analysisText += part.text;
        }
    }

    // Try to parse as JSON
    try {
        let cleaned = analysisText.trim();
        // Remove markdown code fences if present
        if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
        if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
        if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
        cleaned = cleaned.trim();
        
        const analysis = JSON.parse(cleaned);
        return analysis;
    } catch (parseError) {
        console.error('Failed to parse Gemini response as JSON:', parseError.message);
        console.error('Raw response:', analysisText.substring(0, 500));
        
        return {
            skinType: 'Tidak Terdeteksi',
            skinConditions: ['Analisis gagal diproses'],
            hydrationLevel: 'Tidak Diketahui',
            poreSize: 'Tidak Diketahui',
            acneSeverity: 'Tidak Diketahui',
            pigmentation: 'Tidak Diketahui',
            overallScore: 0,
            detailedAnalysis: analysisText || 'Maaf, AI tidak dapat menganalisis foto ini. Pastikan foto wajah terlihat jelas dengan pencahayaan yang baik.',
            recommendations: 'Silakan coba unggah ulang foto wajah dengan pencahayaan yang lebih baik.',
            skincareTips: ['Gunakan pencahayaan alami saat mengambil foto wajah'],
            recommendedProducts: [],
        };
    }
}

module.exports = { analyzeSkin };
