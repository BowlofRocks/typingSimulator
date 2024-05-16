// signin.js
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const auth = getAuth();
const signinForm = document.getElementById("signin-form");

signinForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email-signin").value;
    const password = document.getElementById("password-signin").value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("User signed in:", user.email);
        // Handle further logic (e.g., redirect to a dashboard)
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Sign-in error:", errorMessage);
    }
});
