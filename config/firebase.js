const { Firestore } = require('@google-cloud/firestore');

// Initialize Firestore using values from environment variables
const db = new Firestore({
    projectId: process.env.FIREBASE_PROJECT_ID || 'azarine-b7762',
    credentials: {
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
    }
});

module.exports = { db };
