const { Firestore } = require('@google-cloud/firestore');
const path = require('path');

const db = new Firestore({
    projectId: 'azarine-b7762',
    keyFilename: path.join(__dirname, 'firebase-sa.json'),
});

module.exports = { db };
