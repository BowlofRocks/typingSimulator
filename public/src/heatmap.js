import { renderNewQuote } from "./main.js";

const keyboardContainer = document.getElementById('keyboard');

let keyErrorCounts = {};

// Function to update keyboard colors based on key error counts
function updateKeyboardColors(errorCounts) {
    // Iterate over keys and update colors based on error counts
    keys.flat().forEach(key => {
        const keyElement = document.querySelector(`.key[data-key="${key}"]`);
        if (keyElement) {
            const errors = errorCounts[key] || 0;
            let color = '';

            // Determine color based on error count thresholds
            if (errors === 1) {
                color = 'green';
            } else if (errors === 2) {
                color = 'yellow';
            } else if (errors === 3) {
                color = 'orange';
            } else if (errors >= 4) {
                color = 'red';
            }

            keyElement.style.backgroundColor = color;
        }
    });
}

// Function to refresh heatmap
function refreshHeatmap() {
    // Clear key error counts
    keyErrorCounts = {};
    // Update keyboard colors
    updateKeyboardColors(keyErrorCounts);
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
    if (!keyErrorCounts[keyPressed]) {
        keyErrorCounts[keyPressed] = 0;
    }
    keyErrorCounts[keyPressed]++;
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

export { refreshHeatmap, updateKeyboardColors };

