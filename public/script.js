const RANDOM_QUOTE_API_URL = 'https://api.quot' +
    'able.io/random'
const quoteDisplayElement = document.getElementById('quoteDisplay')
const quoteInputElement = document.getElementById('quoteInput')
const timerElement = document.getElementById('timer')
const replayButton = document.getElementById('replayButton')
const cpmElement = document.getElementById('cpm')
const wpmElement = document.getElementById('wpm');

let timerIntervalId;
let timerStarted = false;
let startTime;
let phraseCharacterCount = 0;
let wordCount = 0;

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
        setTimeout(() => {
            cpmElement.innerText = '';
            wpmElement.innerText = '';
            renderNewQuote();
        }, 2000);
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

function calculateWPM() {
    const elapsedTime = getTimerTime();
    const wps = wordCount / elapsedTime;
    const wpm = Math.floor(wps * 60);
    wpmElement.innerText = `Words Per Minute: ${wpm}`;
}

replayButton.addEventListener('click', renderNewQuote);

renderNewQuote()


