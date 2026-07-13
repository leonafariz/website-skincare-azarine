const { GoogleGenAI } = require('@google/genai');

// Initialize the GenAI client using Vertex AI configuration from environment variables
let genaiClient = null;

async function getGenAIClient() {
    if (genaiClient) return genaiClient;

    const projectId = process.env.VERTEXAI_PROJECT_ID || 'blackstone-new';
    const clientEmail = process.env.VERTEXAI_CLIENT_EMAIL;
    const privateKey = process.env.VERTEXAI_PRIVATE_KEY ? process.env.VERTEXAI_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined;

    genaiClient = new GoogleGenAI({
        vertexai: true,
        project: projectId,
        location: 'us-central1',
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
