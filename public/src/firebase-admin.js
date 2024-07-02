const admin = require('firebase-admin');
const serviceAccount = require('/key.json'); // Replace with the path to your service account key file

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "lil-gloomy.firebaseapp.com" // Replace with your database URL
});

const db = admin.firestore();
