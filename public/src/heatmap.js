import { renderNewQuote } from "./main.js";

const keyboardContainer = document.getElementById('keyboard');

let keyFrequencies = {};

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



    // Trigger the replay button action if "Tab" key is pressed
    if (event.key === 'Tab') {
        event.preventDefault();
        renderNewQuote();
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

export {refreshHeatmap, updateKeyboardColors}