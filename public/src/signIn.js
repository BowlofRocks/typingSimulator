import { browserLocalPersistence, setPersistence, signInWithPopup, signOut, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { auth, db } from "./firebase-config.js";
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js';

const provider = new GoogleAuthProvider();

async function signIn() {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Reference to the user document in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

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

// Apply the selected skin based on the skin name
function applySkin(skinName) {
    let bgColor, boxColor, borderColor;

    switch(skinName) {
        case 'skin1':
            bgColor = '--shop1-bg-color';
            boxColor = '--shop1-box-color';
            borderColor = '--shop1-border-color';
            break;
        case 'skin2':
            bgColor = '--shop2-bg-color';
            boxColor = '--shop2-box-color';
            borderColor = '--shop2-border-color';
            break;
        case 'skin3':
            bgColor = '--shop3-bg-color';
            boxColor = '--shop3-box-color';
            borderColor = '--shop3-border-color';
            break;
        case 'skin4':
            bgColor = '--shop4-bg-color';
            boxColor = '--shop4-box-color';
            borderColor = '--shop5-border-color';
            break;
        case 'skin5':
            bgColor = '--shop5-bg-color';
            boxColor = '--shop5-box-color';
            borderColor = '--shop5-border-color';
            break;
    }

    document.body.style.backgroundColor = getComputedStyle(
        document.documentElement
    ).getPropertyValue(bgColor);

    let box = document.querySelector(".container");

    box.style.backgroundColor = getComputedStyle(
        document.documentElement
    ).getPropertyValue(boxColor);

    box.style.borderColor = getComputedStyle(
        document.documentElement
    ).getPropertyValue(borderColor);
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
            document.getElementById('userDetails').innerText = `Hello, ${user.displayName}`;

            // Fetch user data
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.lastSkin) {
                    // Apply the last selected skin if it exists
                    applySkin(userData.lastSkin);
                }
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
