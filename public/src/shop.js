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

    async function updateShopDropdown() {
        const skins = await fetchUserSkins();
        shopDropdown.innerHTML = ""; // Clear existing dropdown content

        // Create and append new buttons for each skin
        skins.forEach((skin, index) => {
            const button = document.createElement("button");
            button.textContent = skin.name; // Assuming each skin object has a 'name' property
            button.addEventListener("click", () => {
                // Apply the selected skin
                applySkin(skin); // Implement applySkin function as per your requirements
            });
            shopDropdown.appendChild(button);
        });
    }

    // Initial update of the shop dropdown on page load
    await updateShopDropdown();
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

//Skins
    document.getElementById("first-color").addEventListener("click", () => {
        document.body.style.backgroundColor = getComputedStyle(
            document.documentElement
        ).getPropertyValue("--shop1-bg-color");

        let box = document.querySelector(".container");

        box.style.backgroundColor = getComputedStyle(
            document.documentElement
        ).getPropertyValue("--shop1-box-color");

        box.style.borderColor = getComputedStyle(
            document.documentElement
        ).getPropertyValue("--shop1-border-color");
    });

    document.getElementById("second-color").addEventListener("click", () => {
        document.body.style.backgroundColor = getComputedStyle(
            document.documentElement
        ).getPropertyValue("--shop2-bg-color");

        let box = document.querySelector(".container");

        box.style.backgroundColor = getComputedStyle(
            document.documentElement
        ).getPropertyValue("--shop2-box-color");

        box.style.borderColor = getComputedStyle(
            document.documentElement
        ).getPropertyValue("--shop2-border-color");
    });

    document.getElementById("third-color").addEventListener("click", () => {
        document.body.style.backgroundColor = getComputedStyle(
            document.documentElement
        ).getPropertyValue("--shop3-bg-color");

        let box = document.querySelector(".container");


        box.style.backgroundColor = getComputedStyle(
            document.documentElement
        ).getPropertyValue("--shop3-box-color");

        box.style.borderColor = getComputedStyle(
            document.documentElement
        ).getPropertyValue("--shop3-border-color");
    });

    document.getElementById("fourth-color").addEventListener("click", () => {
        document.body.style.backgroundColor = getComputedStyle(
            document.documentElement
        ).getPropertyValue("--shop4-bg-color");

        let box = document.querySelector(".container");


        box.style.backgroundColor = getComputedStyle(
            document.documentElement
        ).getPropertyValue("--shop4-box-color");

        box.style.borderColor = getComputedStyle(
            document.documentElement
        ).getPropertyValue("--shop5-border-color");
    });

    document.getElementById("fifth-color").addEventListener("click", () => {
        document.body.style.backgroundColor = getComputedStyle(
            document.documentElement
        ).getPropertyValue("--shop5-bg-color");

        let box = document.querySelector(".container");


        box.style.backgroundColor = getComputedStyle(
            document.documentElement
        ).getPropertyValue("--shop5-box-color");

        box.style.borderColor = getComputedStyle(
            document.documentElement
        ).getPropertyValue("--shop5-border-color");
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
}
//deincrement currency