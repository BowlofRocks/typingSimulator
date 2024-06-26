import { auth, db } from './firebase-config.js';
import { calculateWPM } from "./wpm.js";
import { refreshHeatmap, updateKeyboardColors } from "./heatmap.js";
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

// Animations commented out for now.
// import './animations.js';

const RANDOM_QUOTE_API_URL = 'https://api.quotable.io/random';
const quoteDisplayElement = document.getElementById('quoteDisplay');
const quoteInputElement = document.getElementById('quoteInput');
const timerElement = document.getElementById('timer');
const replayButton = document.getElementById('replayButton');
const wpmElement = document.getElementById('wpm');
const accuracyElement = document.getElementById('accuracy');
const keyboardContainer = document.getElementById('keyboard');

let timerIntervalId;
let timerStarted = false;
let startTime;
let phraseCharacterCount = 0;
let wordCount = 0;
let keyFrequencies = {};
let incorrectCharacters = 0;

quoteInputElement.addEventListener('input', () => {
    if (!timerStarted) {
        startTimer();
        timerStarted = true;
    }
    const arrayQuote = quoteDisplayElement.querySelectorAll('span');
    const arrayValue = quoteInputElement.value.split('');
    let correct = true;

    arrayQuote.forEach((characterSpan, index) => {
        const character = arrayValue[index];
        if (character == null) {
            characterSpan.classList.remove('correct');
            characterSpan.classList.remove('incorrect');
            correct = false;
        } else if (character === characterSpan.innerText) {
            characterSpan.classList.add('correct');
            characterSpan.classList.remove('incorrect');
        } else {
            if (!characterSpan.classList.contains('incorrect')) {
                incorrectCharacters++;
            }
            characterSpan.classList.remove('correct');
            characterSpan.classList.add('incorrect');
            correct = false;
        }
    });

    if (correct) {
        clearInterval(timerIntervalId);
        renderElapsedTime();
        calculateWPM();
        calculateAccuracy();
        updateKeyboardColors();
        setTimeout(() => {
            wpmElement.innerText = ''; // Clear wpm
            accuracyElement.innerText = ''; // Clear accuracy
            renderNewQuote();
        }, 2500); // Amount of time before refreshing prompt
    }
});

function getRandomQuote() {
    return fetch(RANDOM_QUOTE_API_URL)
        .then(response => response.json())
        .then(data => data.content);
}

async function renderNewQuote() {
    wordCount = 0;
    incorrectCharacters = 0; // Reset the incorrect character count when rendering a new quote
    const quote = await getRandomQuote();
    const words = quote.split(' ');
    wordCount = words.length;
    phraseCharacterCount = quote.length;
    quoteDisplayElement.innerHTML = '';
    quote.split('').forEach(character => {
        const characterSpan = document.createElement('span');
        characterSpan.innerText = character;
        quoteDisplayElement.appendChild(characterSpan);
    });
    quoteInputElement.value = null;
    timerStarted = false;
    clearInterval(timerIntervalId);
    timerElement.innerText = 0;
    refreshHeatmap(); // Refresh heatmap when a new quote is rendered
}

function startTimer() {
    timerElement.innerText = 0;
    startTime = new Date();
    timerIntervalId = setInterval(() => {
        timerElement.innerText = getTimerTime();
    }, 1000);
}

function getTimerTime() {
    return Math.floor((new Date() - startTime) / 1000);
}

function renderElapsedTime() {
    const elapsedTime = getTimerTime();
    timerElement.innerText = `Elapsed Time: ${elapsedTime} seconds`;
}



function calculateAccuracy() {
    const totalCharacters = phraseCharacterCount;
    const correctCharacters = totalCharacters - incorrectCharacters;
    const accuracy = ((correctCharacters / totalCharacters) * 100).toFixed(2);
    accuracyElement.innerText = `Accuracy: ${accuracy}%`;
}

function calculateAverageWPM(wpmValues) {
    const totalWPM = wpmValues.reduce((total, wpm) => total + wpm, 0);
    return totalWPM / wpmValues.length;
}

async function fetchAverageWPMData() {
    try {
        const usersCollection = collection(db, 'users');
        const snapshot = await getDocs(usersCollection);
        const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Fetched users data:', usersData);
        return usersData;
    } catch (error) {
        console.error('Error fetching data: ', error);
        throw error;
    }
}

async function getLeaderboardData() {
    try {
        const usersData = await fetchAverageWPMData();
        const leaderboardData = usersData.map(user => ({
            nickname: user.nickname,
            averageWPM: user.averageWPM || 0 // Ensure there's a default value
        }));

        leaderboardData.sort((a, b) => b.averageWPM - a.averageWPM);
        console.log('Leaderboard data:', leaderboardData);
        return leaderboardData;
    } catch (error) {
        console.error('Error getting leaderboard data: ', error);
        throw error;
    }
}

async function renderLeaderboard() {
    try {
        const leaderboardData = await getLeaderboardData();
        const leaderboardContainer = document.getElementById('leaderboard');

        if (leaderboardData.length === 0) {
            leaderboardContainer.innerHTML = '<p>No data available</p>';
            return;
        }

        leaderboardContainer.innerHTML = leaderboardData.map(user => `
            <div class="leaderboard-entry">
                <span class="user-id">${user.nickname}</span>
                <span class="wpm-bar" style="width: ${user.averageWPM * 5}px;">${user.averageWPM} WPM</span>
            </div>
        `).join('');
        console.log('Rendered leaderboard');
    } catch (error) {
        console.error('Error rendering leaderboard: ', error);
    }
}

// Ensure the user is authenticated before rendering the leaderboard
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log('User is signed in:', user);
        try {
            await renderLeaderboard();
        } catch (error) {
            console.error('Error in onAuthStateChanged:', error);
        }
    } else {
        console.log('No user is signed in');
    }
});

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

//Shuffle
replayButton.addEventListener('click', renderNewQuote);

renderNewQuote();

export {getTimerTime, renderElapsedTime, wordCount, renderNewQuote}