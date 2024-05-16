import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const auth = getAuth();
const registrationForm = document.getElementById("registration-form");

registrationForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email-register").value;
    const password = document.getElementById("password-register").value;

    try {
        const userCredetial = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredetial.user;
        console.log("User registered", user.email);

    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Registration error:", errorMessage)
    }
});