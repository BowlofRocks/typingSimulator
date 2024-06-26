import {renderNewQuote} from "./main.js";

const replayButton = document.getElementById('replayButton');
//Shuffle
replayButton.addEventListener('click', renderNewQuote);