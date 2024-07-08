import { browserLocalPersistence, setPersistence, signInWithPopup, signOut, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth, db } from "./firebase-config.js";
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const provider = new GoogleAuthProvider();

async function signIn() {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Reference to the user document in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        const displayName = user.nickname;

        let nickname;
        let lastSkin;

        if (userDoc.exists()) {
            // If user document exists, use the stored nickname and skin
            const userData = userDoc.data();
            nickname = userData.nickname;
            lastSkin = userData.lastSkin;
        } else {
            // If user document does not exist, prompt for nickname and save it
            nickname = prompt('Enter your nickname:');
            await setDoc(userDocRef, { nickname: nickname, lastSkin: null });
        }

        // Update UI
        document.getElementById('whenSignedOut').hidden = true;
        document.getElementById('whenSignedIn').hidden = false;
        document.getElementById('userDetails').innerText = `Hello, ${nickname}`;

        // Apply the last selected skin if it exists
        if (lastSkin) {
            applySkin(lastSkin);
        }
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(`Error ${errorCode}: ${errorMessage}`);
    }
}

function signOutUser() {
    signOut(auth).then(() => {
        document.getElementById('whenSignedOut').hidden = false;
        document.getElementById('whenSignedIn').hidden = true;
        document.getElementById('userDetails').innerText = '';
    }).catch((error) => {
        console.error(`Sign Out error: ${error.message}`);
    });
}

// Handle DOMContentLoaded event to set up event listeners
window.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('signInBtn').addEventListener('click', signIn);
    document.getElementById('signOutBtn').addEventListener('click', signOutUser);

    // Check auth state on page load
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is signed in
            document.getElementById('whenSignedOut').hidden = true;
            document.getElementById('whenSignedIn').hidden = false;

            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const nickname = userData.nickname; // Correctly retrieve nickname
                document.getElementById('userDetails').innerText = `Hello, ${nickname}`;
                if (userData.lastSkin) {
                    applySkin(userData.lastSkin);
                }
            } else {
                // Handle case where user document doesn't exist (should not normally happen after first sign-in)
                console.error('User document does not exist.');
                document.getElementById('userDetails').innerText = `Hello, Unknown`;
            }
        } else {
            // No user is signed in
            document.getElementById('whenSignedOut').hidden = false;
            document.getElementById('whenSignedIn').hidden = true;
            document.getElementById('userDetails').innerText = '';
        }
    });
});

setPersistence(auth, browserLocalPersistence)
    .then(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in
                console.log('User is signed in:', user.uid);
                const userDocRef = doc(db, 'users', user.uid);
                getDoc(userDocRef).then((docSnap) => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        const nickname = userData.nickname;
                        console.log('User nickname:', nickname);
                        // Update your UI with the nickname
                    } else {
                        console.log('No such document!');
                    }
                }).catch((error) => {
                    console.error('Error fetching user data:', error);
                });
            } else {
                // No user is signed in
                console.log('No user is currently signed in');
            }
        });
    })
    .catch((error) => {
        console.error('Error setting persistence:', error);
    });
