import { getAuth, onAuthStateChanged } from "firebase/auth";

const auth = getAuth();

// Set up the observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        const uid = user.uid;
        console.log("User signed in:", user.email);
        // Handle further logic (e.g., fetch user data from Firestore)
    } else {
        // User is signed out
        console.log("User signed out");
    }
});
