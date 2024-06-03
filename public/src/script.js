import { auth, db } from './firebase-config.js';
import {
    onAuthStateChanged,
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

const RANDOM_QUOTE_API_URL = 'https://api.quotable.io/random'
const quoteDisplayElement = document.getElementById('quoteDisplay')
const quoteInputElement = document.getElementById('quoteInput')
const timerElement = document.getElementById('timer')
const replayButton = document.getElementById('replayButton')
const cpmElement = document.getElementById('cpm')
const wpmElement = document.getElementById('wpm');
const keyboardContainer = document.getElementById('keyboard');

let timerIntervalId;
let timerStarted = false;
let startTime;
let phraseCharacterCount = 0;
let wordCount = 0;
let keyFrequencies = {};

quoteInputElement.addEventListener('input', () => {
    if (!timerStarted) {
        startTimer();
        timerStarted = true;
    }
    const arrayQuote = quoteDisplayElement.querySelectorAll('span')
    const arrayValue = quoteInputElement.value.split('')
    let correct = true
    arrayQuote.forEach((characterSpan, index) => {
        const character = arrayValue[index]
        if (character == null) {
            characterSpan.classList.remove('correct')
            characterSpan.classList.remove('incorrect')
            correct = false
        }
        else if (character === characterSpan.innerText) {
            characterSpan.classList.add('correct')
            characterSpan.classList.remove('incorrect')
        }
        else{
            characterSpan.classList.remove('correct')
            characterSpan.classList.add('incorrect')
            correct = false
        }
    })
    if (correct) {
        clearInterval(timerIntervalId);
        renderElapsedTime();
        calculateCPM();
        calculateWPM();
        updateKeyboardColors(); // Update keyboard colors
        setTimeout(() => {
            cpmElement.innerText = '';
            wpmElement.innerText = '';
            renderNewQuote();
        }, 2500); // Amount of time before refreshing prompt
    }
})
function getRandomQuote() {
    return fetch(RANDOM_QUOTE_API_URL)
        .then(response => response.json())
        .then(data => data.content)
}

async function renderNewQuote(){
    phraseCharacterCount = 0;
    wordCount = 0;
    const quote = await getRandomQuote()
    const words = quote.split(' ')
    wordCount = words.length;
    phraseCharacterCount = quote.length;
    quoteDisplayElement.innerHTML = ''
    quote.split('').forEach(character => {
        const characterSpan = document.createElement('span')
        characterSpan.innerText = character
        quoteDisplayElement.appendChild(characterSpan)
    })
    quoteInputElement.value = null
    timerStarted = false;
    clearInterval(timerIntervalId);
    timerElement.innerText = 0;
    refreshHeatmap(); // Refresh heatmap when a new quote is rendered
}

function startTimer() {
    timerElement.innerText = 0
    startTime = new Date()
    timerIntervalId = setInterval(() => {
        timerElement.innerText = getTimerTime()
    }, 1000)
}

function getTimerTime() {
    return Math.floor((new Date() - startTime) / 1000)
}

function renderElapsedTime() {
    const elapsedTime = getTimerTime();
    timerElement.innerText = `Elapsed Time: ${elapsedTime} seconds`;
}

function calculateCPM() {
    const elapsedTime = getTimerTime();
    const cps = phraseCharacterCount / elapsedTime; // Characters per second
    const cpm = Math.floor(cps * 60); // Characters per minute
    cpmElement.innerText = `Characters Per Minute: ${cpm}`;
}

async function calculateWPM() {
    const elapsedTime = getTimerTime();
    const wps = wordCount / elapsedTime;
    const wpm = Math.floor(wps * 60);
    wpmElement.innerText = `Words Per Minute: ${wpm}`;

    // Save WPM data to Firestore and update average WPM
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const uid = user.uid;
            const userRef = doc(db, 'users', uid);

            try {
                const docSnap = await getDoc(userRef);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    const wpmData = userData.wpmData || [];

                    // Update document with new WPM entry
                    await setDoc(userRef, {
                        wpmData: [...wpmData, { wpm: wpm, timestamp: new Date().toString() }],
                        averageWPM: calculateAverageWPM([...wpmData.map(entry => entry.wpm), wpm])
                    });

                    console.log('WPM data and average WPM updated');
                } else {
                    await setDoc(userRef, {
                        wpmData: [{ wpm: wpm, timestamp: new Date().toString() }],
                        averageWPM: wpm
                    });

                    console.log('WPM data and average WPM set for new user');
                }
            } catch (error) {
                console.error('Error updating user document: ', error);
            }
        } else {
            console.log('No user is signed in');
        }
    });
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
            id: user.id,
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
                <span class="user-id">${user.id}</span>
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

// Function to update keyboard colors based on key frequencies
function updateKeyboardColors() {
    const maxFrequency = Math.max(...Object.values(keyFrequencies));
    const minFrequency = Math.min(...Object.values(keyFrequencies));

    // Iterate over keys and update colors based on frequencies
    keys.flat().forEach(key => {
        const keyElement = document.querySelector(`.key[data-key="${key}"]`);
        if (keyElement) {
            const frequency = keyFrequencies[key] || 0;
            const normalizedFrequency = (frequency - minFrequency) / (maxFrequency - minFrequency);
            // Calculate color directly and set as background color
            keyElement.style.backgroundColor = frequency > 0 ? `rgb(${Math.round(255 * (1 - normalizedFrequency))}, ${Math.round(255 * normalizedFrequency)}, 0)` : '';
        }
    });
}

// Function to refresh heatmap
function refreshHeatmap() {
    // Clear key frequencies
    keyFrequencies = {};
    // Update keyboard colors
    updateKeyboardColors();
}

// Array of keys
const keys = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Delete'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '?']
];

keys.forEach(rowKeys => {
    const rowElement = document.createElement('div');
    rowElement.classList.add('key-row');
    rowKeys.forEach(key => {
        const keyElement = document.createElement('div');
        keyElement.classList.add('key');
        keyElement.textContent = key;
        keyElement.dataset.key = key;
        rowElement.appendChild(keyElement);
    });
    keyboardContainer.appendChild(rowElement);
});

document.addEventListener('keydown', event => {
    const keyPressed = event.key.toUpperCase();
    if (!keyFrequencies[keyPressed]) {
        keyFrequencies[keyPressed] = 0;
    }
    keyFrequencies[keyPressed]++;
    const keyElement = Array.from(document.querySelectorAll('.key')).find(
        element => element.dataset.key === keyPressed ||
            (event.key === ' ' && element.dataset.key === 'Space') ||
            (event.key === 'Backspace' && element.dataset.key === 'Backspace') ||
            (event.key === 'Delete' && element.dataset.key === 'Delete')
    );
    if (keyElement) {
        keyElement.classList.add('highlight');
    }
});

document.addEventListener('keyup', event => {
    const keyPressed = event.key.toUpperCase();
    const keyElement = Array.from(document.querySelectorAll('.key')).find(
        element => element.dataset.key === keyPressed ||
            (event.key === ' ' && element.dataset.key === 'Space') ||
            (event.key === 'Backspace' && element.dataset.key === 'Backspace') ||
            (event.key === 'Delete' && element.dataset.key === 'Delete')
    );
    if (keyElement) {
        keyElement.classList.remove('highlight');
    }
});

replayButton.addEventListener('click', renderNewQuote);

renderNewQuote()


