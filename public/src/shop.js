import { auth, db } from './firebase-config.js';
import { getFirestore, doc, getDoc, updateDoc, arrayUnion } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

document.addEventListener("DOMContentLoaded", () => {
    // Save skin to user's Firestore profile
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

    // Change colors based on selected skin
    function changeColors(bgColor, boxColor, borderColor, skinName) {
        document.body.style.backgroundColor = getComputedStyle(
            document.documentElement
        ).getPropertyValue(bgColor);

        const box = document.querySelector(".container");

        box.style.backgroundColor = getComputedStyle(
            document.documentElement
        ).getPropertyValue(boxColor);

        box.style.borderColor = getComputedStyle(
            document.documentElement
        ).getPropertyValue(borderColor);

        // Save the skin to the user's profile
        saveSkinToProfile(skinName);
    }

    // Initialize dropdown for purchased skins
    async function initializeDropdown() {
        const user = auth.currentUser;
        if (user) {
            const purchasedSkins = await fetchUserSkins(user);
            console.log("Purchased Skins:", purchasedSkins); // Debug output

            const skinButtons = document.querySelectorAll(".dropdown-content button[data-skin]");

            skinButtons.forEach(button => {
                const skinName = button.getAttribute("data-skin");
                if (purchasedSkins.includes(skinName)) {
                    button.style.display = "block"; // Show skin switch button
                } else {
                    button.style.display = "none"; // Hide skin switch button if not purchased
                }
            });
        } else {
            console.log("No user is signed in");
        }
    }

    // Fetch user's purchased skins from Firestore
    async function fetchUserSkins(user) {
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
    }

    onAuthStateChanged(auth, initializeDropdown);

    // Currency Handling
    const count = document.getElementById("count");

    document.getElementById("currency-incrementor").addEventListener("click", () => {
        let currentCount = parseInt(count.textContent);
        if (isNaN(currentCount)) {
            currentCount = 0;
        }

        currentCount++;
        count.textContent = currentCount;

        localStorage.setItem("count", currentCount);
    });

    window.onload = () => {
        const savedCount = localStorage.getItem("count");
        if (savedCount !== null) {
            count.textContent = parseInt(savedCount);
        }
    };

    // Buy Skins
    const skins = [
        { button: "first-buy", colorButton: "first-color", cost: 5, skin: "skin1" },
        { button: "second-buy", colorButton: "second-color", cost: 10, skin: "skin2" },
        { button: "third-buy", colorButton: "third-color", cost: 15, skin: "skin3" },
        { button: "fourth-buy", colorButton: "fourth-color", cost: 20, skin: "skin4" },
        { button: "fifth-buy", colorButton: "fifth-color", cost: 25, skin: "skin5" }
    ];

    skins.forEach(item => {
        document.getElementById(item.button).addEventListener("click", () => handleBuy(item));
    });

    // Handle skin purchase
    async function handleBuy({ button, cost, colorButton, skin }) {
        let currentCount = parseInt(localStorage.getItem("count")) || 0;

        if (currentCount >= cost) {
            currentCount -= cost;
            localStorage.setItem("count", currentCount);
            count.textContent = currentCount;

            // Display corresponding color button
            document.getElementById(colorButton).style.display = "block";

            // Hide the buy button
            document.getElementById(button).style.display = "none";

            // Save the purchased skin to user's profile
            await savePurchasedSkin(skin);

            // Update dropdown to show purchased skins
            await initializeDropdown();
        } else {
            console.log("Insufficient funds");
        }
    }

    // Save purchased skin to user's Firestore profile
    async function savePurchasedSkin(skin) {
        const user = auth.currentUser;
        if (user) {
            const userDocRef = doc(db, "users", user.uid);
            try {
                await updateDoc(userDocRef, {
                    purchasedSkins: arrayUnion(skin) // Use arrayUnion to add the skin to the array
                });
                console.log("Skin purchased successfully!");
            } catch (error) {
                console.error("Error purchasing skin: ", error);
            }
        } else {
            console.log("No user is signed in");
        }
    }

    // Color button setup
    const colorButtons = [
        { element: document.getElementById("first-color"), skin: "skin1", colors: ["--shop1-bg-color", "--shop1-box-color", "--shop1-border-color"] },
        { element: document.getElementById("second-color"), skin: "skin2", colors: ["--shop2-bg-color", "--shop2-box-color", "--shop2-border-color"] },
        { element: document.getElementById("third-color"), skin: "skin3", colors: ["--shop3-bg-color", "--shop3-box-color", "--shop3-border-color"] },
        { element: document.getElementById("fourth-color"), skin: "skin4", colors: ["--shop4-bg-color", "--shop4-box-color", "--shop4-border-color"] },
        { element: document.getElementById("fifth-color"), skin: "skin5", colors: ["--shop5-bg-color", "--shop5-box-color", "--shop5-border-color"] }
    ];

    colorButtons.forEach(button => {
        button.element.addEventListener("click", () => {
            changeColors(button.colors[0], button.colors[1], button.colors[2], button.skin);
        });
    });

    // Event listeners for switching skins (initially hidden)
    const skinButtons = document.querySelectorAll(".dropdown-content button[data-skin]");
    skinButtons.forEach(button => {
        button.addEventListener("click", () => {
            const skinName = button.getAttribute("data-skin");
            changeColorsForSkin(skinName); // Implement changeColorsForSkin function to switch skin styles
        });
    });

    // Function to change colors based on selected skin
    function changeColorsForSkin(skinName) {
        switch (skinName) {
            case "skin1":
                changeColors("--shop1-bg-color", "--shop1-box-color", "--shop1-border-color", "skin1");
                break;
            case "skin2":
                changeColors("--shop2-bg-color", "--shop2-box-color", "--shop2-border-color", "skin2");
                break;
            case "skin3":
                changeColors("--shop3-bg-color", "--shop3-box-color", "--shop3-border-color", "skin3");
                break;
            case "skin4":
                changeColors("--shop4-bg-color", "--shop4-box-color", "--shop4-border-color", "skin4");
                break;
            case "skin5":
                changeColors("--shop5-bg-color", "--shop5-box-color", "--shop5-border-color", "skin5");
                break;
            default:
                console.log("Unknown skin:", skinName);
        }
    }

});
