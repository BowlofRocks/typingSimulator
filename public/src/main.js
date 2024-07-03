import { auth, db } from './firebase-config.js';
import { calculateWPM } from "./wpm.js";
import {incrementCount} from "./shop.js";
import { refreshHeatmap, updateKeyboardColors } from "./heatmap.js";
import { renderLeaderboard } from "./leaderboard.js";
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

const wpmElement = document.getElementById('wpm');
const accuracyElement = document.getElementById('accuracy');

let timerIntervalId;
let timerStarted = false;
let startTime;
let phraseCharacterCount = 0;
let wordCount = 0;
let incorrectCharacters = 0;
let keyErrorCounts = {}; // To track key errors

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
        const correctCharacter = characterSpan.innerText.toUpperCase();
        if (character == null) {
            characterSpan.classList.remove('correct');
            characterSpan.classList.remove('incorrect');
            correct = false;
        } else if (character.toUpperCase() === correctCharacter) {
            characterSpan.classList.add('correct');
            characterSpan.classList.remove('incorrect');
        } else {
            if (!characterSpan.classList.contains('incorrect')) {
                incorrectCharacters++;
                // Track the correct key that should have been pressed
                if (!keyErrorCounts[correctCharacter]) {
                    keyErrorCounts[correctCharacter] = 0;
                }
                keyErrorCounts[correctCharacter]++;
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
        incrementCount();
        calculateAccuracy();
        updateKeyboardColors(keyErrorCounts); // Pass the error counts to updateKeyboardColors
        setTimeout(() => {
            wpmElement.innerText = ''; // Clear wpm
            accuracyElement.innerText = ''; // Clear accuracy
            renderNewQuote();
        }, 2500); // Amount of t
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
    keyErrorCounts = {}; // Reset key error counts when rendering a new quote
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

//Shuffle
replayButton.addEventListener('click', renderNewQuote);

renderNewQuote();

export { getTimerTime, renderElapsedTime, wordCount, renderNewQuote };