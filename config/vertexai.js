const { GoogleGenAI } = require('@google/genai');
const { GoogleAuth } = require('google-auth-library');
const path = require('path');

const SA_KEY_PATH = path.join(__dirname, 'vertexai-sa.json');

// Use Google Auth to get an access token from the service account
async function getAccessToken() {
    const auth = new GoogleAuth({
        keyFilename: SA_KEY_PATH,
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    return tokenResponse.token;
}

// Initialize the GenAI client using Vertex AI backend
let genaiClient = null;

async function getGenAIClient() {
    if (genaiClient) return genaiClient;

    const saKey = require(SA_KEY_PATH);
    
    genaiClient = new GoogleGenAI({
        vertexai: true,
        project: saKey.project_id,
        location: 'us-central1',
        googleAuthOptions: {
            keyFilename: SA_KEY_PATH,
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        },
    });

    return genaiClient;
}

module.exports = { getGenAIClient };
