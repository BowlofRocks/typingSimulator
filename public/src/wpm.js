import { auth, db } from './firebase-config.js';
import { getTimerTime, wordCount } from './main.js'
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const wpmElement = document.getElementById('wpm');

async function calculateWPM() {
    const elapsedTime = getTimerTime();
    const wps = wordCount / elapsedTime;
    const wpm = Math.floor(wps * 60);
    wpmElement.innerText = `Words Per Minute: ${wpm}`;

    // Save WPM data to Firestore and update average WPM
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const uid = user.uid;
            const userRef = doc(db, 'users', uid);

            try {
                const docSnap = await getDoc(userRef);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    const wpmData = userData.wpmData || [];

                    // Update document with new WPM entry
                    await updateDoc(userRef, {
                        wpmData: [...wpmData, { wpm: wpm, timestamp: new Date().toString() }],
                        averageWPM: calculateAverageWPM([...wpmData.map(entry => entry.wpm), wpm])
                    });

                    console.log('WPM data and average WPM updated');
                } else {
                    await updateDoc(userRef, {
                        wpmData: [{ wpm: wpm, timestamp: new Date().toString() }],
                        averageWPM: wpm
                    });

                    console.log('WPM data and average WPM set for new user');
                }
            } catch (error) {
                console.error('Error updating user document: ', error);
            }
        } else {
            console.log('No user is signed in');
        }
    });
}

function calculateAverageWPM(wpmValues) {
    const totalWPM = wpmValues.reduce((total, wpm) => total + wpm, 0);
    return totalWPM / wpmValues.length;
}

export { calculateWPM }