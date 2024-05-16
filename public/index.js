const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

const admin = require('firebase-admin')
const serviceAccount = require('typingSimulator\\lil-gloomy-firebase-adminsdk-tmzux-ac3cb35ccf.json')

admin.initializeApp({credential: admin.credential.cert(serviceAccount)});

const db = admin.firestore();

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});