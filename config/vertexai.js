const { GoogleGenAI } = require('@google/genai');
const { envValue } = require('./firebase');

// Initialize the GenAI client using Vertex AI configuration from environment variables.
// Falls back to the Firebase service account if no dedicated VERTEXAI_* creds are set
// (same GCP project scenario).
let genaiClient = null;

function getGenAIClient() {
    if (genaiClient) return genaiClient;

    const projectId = envValue('VERTEXAI_PROJECT_ID') || envValue('FIREBASE_PROJECT_ID');
    const location = envValue('VERTEXAI_LOCATION') || 'us-central1';
    const clientEmail = envValue('VERTEXAI_CLIENT_EMAIL') || envValue('FIREBASE_CLIENT_EMAIL');
    const privateKey = envValue('VERTEXAI_PRIVATE_KEY') || envValue('FIREBASE_PRIVATE_KEY');

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
