import { auth, db } from './firebase-config.js';
import { doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js'

document.addEventListener("DOMContentLoaded", () => {
    async function saveSkinToProfile(skin) {
        const user = auth.currentUser;
        if (user) {
            const userDocRef = doc(db, "users", user.uid);
            try {
                await updateDoc(userDocRef, {
                    lastSkin: skin
                });
                console.log("Skin saved successfully!");
            } catch (error) {
                console.error("Error saving skin: ", error);
            }
        } else {
            console.log("No user is signed in");
        }
    }

    function changeColors(bgColor, boxColor, borderColor, skinName) {
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

        // Save the skin to the user's profile
        saveSkinToProfile(skinName);
    }

    document.getElementById("first-color").addEventListener("click", () => {
        changeColors("--shop1-bg-color", "--shop1-box-color", "--shop1-border-color", "skin1");
    });

    document.getElementById("second-color").addEventListener("click", () => {
        changeColors("--shop2-bg-color", "--shop2-box-color", "--shop2-border-color", "skin2");
    });

    document.getElementById("third-color").addEventListener("click", () => {
        changeColors("--shop3-bg-color", "--shop3-box-color", "--shop3-border-color", "skin3");
    });

    document.getElementById("fourth-color").addEventListener("click", () => {
        changeColors("--shop4-bg-color", "--shop4-box-color", "--shop5-border-color", "skin4");
    });

    document.getElementById("fifth-color").addEventListener("click", () => {
        changeColors("--shop5-bg-color", "--shop5-box-color", "--shop5-border-color", "skin5");
    });
});

document.addEventListener("DOMContentLoaded", async () => {
    const shopDropdown = document.querySelector(".dropdown-content");

    async function fetchUserSkins() {
        const user = auth.currentUser;
        if (user) {
            const userDocRef = doc(db, "users", user.uid);
            try {
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const purchasedSkins = userData.purchasedSkins || []; // Assuming purchasedSkins is an array field in Firestore
                    return purchasedSkins;
                } else {
                    console.log("User document does not exist");
                    return [];
                }
            } catch (error) {
                console.error("Error fetching user document:", error);
                return [];
            }
        } else {
            console.log("No user is signed in");
            return [];
        }
    }
});

function applySkin(skinName) {
    let bgColor, boxColor, borderColor;

    switch (skinName) {
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
document.addEventListener("DOMContentLoaded", async () => {
    const shopDropdown = document.querySelector(".dropdown-content");

    async function fetchUserSkins() {
        const user = auth.currentUser;
        if (user) {
            const userDocRef = doc(db, "users", user.uid);
            try {
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const purchasedSkins = userData.purchasedSkins || []; // Assuming purchasedSkins is an array field in Firestore
                    console.log("Fetched Purchased Skins:", purchasedSkins); // Debug output
                    return purchasedSkins;
                } else {
                    console.log("User document does not exist");
                    return [];
                }
            } catch (error) {
                console.error("Error fetching user document:", error);
                return [];
            }
        } else {
            console.log("No user is signed in");
            return [];
        }
    }

    // Function to initialize the dropdown based on user's purchased skins
    async function initializeDropdown() {
        const purchasedSkins = await fetchUserSkins();
        console.log("Purchased Skins:", purchasedSkins); // Debug output

        const dropdownItems = Array.from(shopDropdown.children);

        for (let item of dropdownItems) {
            const skinName = item.dataset.skin;
            if (purchasedSkins.includes(skinName)) {
                item.textContent = `${skinName} (Owned)`; // Update text to indicate ownership
                // Optionally disable or change appearance to indicate ownership
            }
        }
    }

    // Call initializeDropdown when the DOM is loaded
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            await initializeDropdown();
        } else {
            console.log("No user is signed in");
        }
    });
});





//Currency
let count = document.getElementById("count");

document
    .getElementById("currency-incrementor")
    .addEventListener("click", () => {
        let currentCount = parseInt(count.textContent);
        if (isNaN(currentCount)) {
            currentCount = 0;
        }

        currentCount++;
        count.textContent = currentCount;

        localStorage.setItem("count", currentCount);
    });

//Save Player Currency
window.onload = () => {
    let savedCount = localStorage.getItem("count");
    if (savedCount !== null) {
        count.textContent = parseInt(savedCount);
    }
};

//Buy Skins
// Buy buttons and costs
const buyButtons = [
    { button: document.getElementById("first-buy"), cost: 5, colorButton: document.getElementById("first-color") },
    { button: document.getElementById("second-buy"), cost: 10, colorButton: document.getElementById("second-color") },
    { button: document.getElementById("third-buy"), cost: 15, colorButton: document.getElementById("third-color") },
    { button: document.getElementById("fourth-buy"), cost: 20, colorButton: document.getElementById("fourth-color") },
    { button: document.getElementById("fifth-buy"), cost: 25, colorButton: document.getElementById("fifth-color") }
];

buyButtons.forEach(item => {
    item.button.addEventListener("click", () => {
        handleBuy(item);
    });
});

function handleBuy({ button, cost, colorButton }) {
    let currentCount = parseInt(localStorage.getItem("count")) || 0;

    if (currentCount >= cost) {
        currentCount -= cost;
        localStorage.setItem("count", currentCount);
        count.textContent = currentCount;

        // Display corresponding color button
        colorButton.style.display = "block";

        // Hide the buy button
        button.style.display = "none";
    } else {
        console.log("Insufficient funds");
    }
}

//Cost of Skins
const costOne = 5;
const costTwo = 10;
const costThree = 15;
const costFour = 20;
const costFive = 25;

//Buy buttons
let firstBuy = document.getElementById("first-buy");
let secondBuy = document.getElementById("second-buy");
let thirdBuy = document.getElementById("third-buy");
let fourthBuy = document.getElementById("fourth-buy");
let fifthBuy = document.getElementById("fifth-buy");

//Skins buttons
let firstColor = document.getElementById("first-color");
let secondColor = document.getElementById("second-color");
let thirdColor = document.getElementById("third-color");
let fourthColor = document.getElementById("fourth-color");
let fifthColor = document.getElementById("fifth-color");

// Add event listener to the button
firstBuy.addEventListener("click", () => {
    //Get the current count from local storage
    let currentCount = parseInt(localStorage.getItem("count"));

    // Check if currentCount is a number and is greater than or equal to the cost
    if (!isNaN(currentCount) && currentCount >= costOne) {
        // Decrement the count by the cost
        currentCount -= costOne;

        // Save the decremented count back to local storage
        localStorage.setItem("count", currentCount);

        // Update the count on the screen
        count.textContent = currentCount;

        // Change the display property of the element to show
        firstColor.style.display = "block";

        // Hide the buy button
        firstBuy.style.display = "none";
    }
});

// Add similar event listeners for the other buy buttons...

secondBuy.addEventListener("click", () => {
    //Get the current count from local storage
    let currentCount = parseInt(localStorage.getItem("count"));

    // Check if currentCount is a number and is greater than or equal to the cost
    if (!isNaN(currentCount) && currentCount >= costTwo) {
        // Decrement the count by the cost
        currentCount -= costTwo;

        // Save the decremented count back to local storage
        localStorage.setItem("count", currentCount);

        // Update the count on the screen
        count.textContent = currentCount;

        // Change the display property of the element to show
        secondColor.style.display = "block";

        // Hide the buy button
        secondBuy.style.display = "none";
    }
});

thirdBuy.addEventListener("click", () => {
    //Get the current count from local storage
    let currentCount = parseInt(localStorage.getItem("count"));

    // Check if currentCount is a number and is greater than or equal to the cost
    if (!isNaN(currentCount) && currentCount >= costThree) {
        // Decrement the count by the cost
        currentCount -= costThree;

        // Save the decremented count back to local storage
        localStorage.setItem("count", currentCount);

        // Update the count on the screen
        count.textContent = currentCount;

        // Change the display property of the element to show
        thirdColor.style.display = "block";

        // Hide the buy button
        thirdBuy.style.display = "none";
    }
});

fourthBuy.addEventListener("click", () => {
        //Get the current count from local storage
    let currentCount = parseInt(localStorage.getItem("count"));

        // Check if currentCount is a number and is greater than or equal to the cost
    if (!isNaN(currentCount) && currentCount >= costFour) {
            // Decrement the count by the cost
        currentCount -= costFour;

            // Save the decremented count back to local storage
        localStorage.setItem("count", currentCount);

            // Update the count on the screen
        count.textContent = currentCount;

            // Change the display property of the element to show
        fourthColor.style.display = "block";

            // Hide the buy button
        fourthBuy.style.display = "none";
    }
});

fifthBuy.addEventListener("click", () => {
        //Get the current count from local storage
    let currentCount = parseInt(localStorage.getItem("count"));

        // Check if currentCount is a number and is greater than or equal to the cost
    if (!isNaN(currentCount) && currentCount >= costFive) {
            // Decrement the count by the cost
        currentCount -= costFive;

            // Save the decremented count back to local storage
        localStorage.setItem("count", currentCount);

            // Update the count on the screen
        count.textContent = currentCount;

            // Change the display property of the element to show
        fifthColor.style.display = "block";

            // Hide the buy button
        fifthBuy.style.display = "none";
    }
});