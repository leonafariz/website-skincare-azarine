const { GoogleGenAI } = require('@google/genai');

// Initialize the GenAI client using Vertex AI configuration from environment variables.
// Falls back to the Firebase service account if no dedicated VERTEXAI_* creds are set
// (same GCP project scenario).
let genaiClient = null;

function getGenAIClient() {
    if (genaiClient) return genaiClient;

    const projectId = process.env.VERTEXAI_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
    const location = process.env.VERTEXAI_LOCATION || 'us-central1';
    const clientEmail = process.env.VERTEXAI_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
    const rawKey = process.env.VERTEXAI_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY;
    const privateKey = rawKey ? rawKey.replace(/\\n/g, '\n') : undefined;

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            'Missing Vertex AI credentials. Set VERTEXAI_PROJECT_ID, VERTEXAI_CLIENT_EMAIL, and VERTEXAI_PRIVATE_KEY in your environment (see .env.example).'
        );
    }

    genaiClient = new GoogleGenAI({
        vertexai: true,
        project: projectId,
        location,
        googleAuthOptions: {
            credentials: {
                client_email: clientEmail,
                private_key: privateKey,
            },
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        },
    });

    return genaiClient;
}

module.exports = { getGenAIClient };
