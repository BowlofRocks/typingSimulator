import { auth, db } from './firebase-config.js';
import {
    onAuthStateChanged,
    setPersistence, browserLocalPersistence,
    GoogleAuthProvider,
    signInWithPopup,
    signOut
} from 'https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js';
import {
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    arrayUnion,
    serverTimestamp,
    collection
} from 'https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js';

const changeNicknameButton = document.getElementById('changeNicknameButton');
const popup = document.getElementById('popup');
const closePopup = document.getElementById('closePopup');
const nicknameForm = document.getElementById('nicknameForm');
const newNicknameInput = document.getElementById('newNickname');

// Show popup when the button is clicked
changeNicknameButton.addEventListener('click', () => {
    popup.style.display = 'block';
});

// Close popup when the close button is clicked
closePopup.addEventListener('click', () => {
    popup.style.display = 'none';
});

// Close popup when clicking outside the popup
window.addEventListener('click', (event) => {
    if (event.target === popup) {
        popup.style.display = 'none';
    }
});

// Function to update the nickname for the authenticated user in Firestore
async function updateNickname(newNickname) {
    try {
        const user = auth.currentUser; // Get the currently authenticated user
        if (user) {
            const userDocRef = doc(db, 'users', user.uid); // Reference to the user document
            await updateDoc(userDocRef, { nickname: newNickname }); // Update the user document with the new nickname
            console.log('Nickname updated successfully');
        } else {
            console.error('No user is currently authenticated');
        }
    } catch (error) {
        console.error('Error updating nickname:', error);
    }
}

// Handle form submission to update nickname
nicknameForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission
    const newNickname = newNicknameInput.value.trim(); // Get and trim the new nickname
    if (newNickname) { // Check if the new nickname is not empty
        await updateNickname(newNickname); // Update the nickname
        // Close the popup after submission
        popup.style.display = 'none';
    } else {
        console.error('Nickname cannot be empty');
    }
});