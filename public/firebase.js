// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase-admin/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDZYg4kgA1T8fGOiZSe1e_imONw--3XHec",
    authDomain: "lil-gloomy.firebaseapp.com",
    databaseURL: "https://lil-gloomy-default-rtdb.firebaseio.com",
    projectId: "lil-gloomy",
    storageBucket: "lil-gloomy.appspot.com",
    messagingSenderId: "348560822643",
    appId: "1:348560822643:web:ed70422cf06ac79aa33506",
    measurementId: "G-YDZ860PXK4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);