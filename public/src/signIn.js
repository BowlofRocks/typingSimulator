
import { getAuth, signInWithPopup, signOut, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

const auth = getAuth();
const provider = new GoogleAuthProvider();
function signIn() {
    signInWithPopup(auth, provider)
        .then((result) => {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;

            document.getElementById('whenSignedOut').hidden = true;
            document.getElementById('whenSignedIn').hidden = false;
            document.getElementById('userDetails').innerText = `Hello, ${user.displayName}`;
        }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.error(`Error ${errorCode}: ${errorMessage}`)
    });
}

function signOutUser() {
    signOut(auth).then(() => {
        document.getElementById('whenSignedOut').hidden = false;
        document.getElementById('whenSignedIn').hidden = true;
        document.getElementById('userDetails').innerText = '';
    }).catch(() => {
        console.error(`Sign Out error: ${error.message}`)
    });
}

window.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('signInBtn').addEventListener('click', signIn);
    document.getElementById('signOutBtn').addEventListener('click', signOutUser);
});