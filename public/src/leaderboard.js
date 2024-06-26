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

async function fetchAverageWPMData() {
    try {
        const usersCollection = collection(db, 'users');
        const snapshot = await getDocs(usersCollection);
        const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Fetched users data:', usersData);
        return usersData;
    } catch (error) {
        console.error('Error fetching data: ', error);
        throw error;
    }
}

async function getLeaderboardData() {
    try {
        const usersData = await fetchAverageWPMData();
        const leaderboardData = usersData.map(user => ({
            nickname: user.nickname,
            averageWPM: user.averageWPM || 0 // Ensure there's a default value
        }));

        leaderboardData.sort((a, b) => b.averageWPM - a.averageWPM);
        console.log('Leaderboard data:', leaderboardData);
        return leaderboardData;
    } catch (error) {
        console.error('Error getting leaderboard data: ', error);
        throw error;
    }
}

async function renderLeaderboard() {
    try {
        const leaderboardData = await getLeaderboardData();
        const leaderboardContainer = document.getElementById('leaderboard');

        if (leaderboardData.length === 0) {
            leaderboardContainer.innerHTML = '<p>No data available</p>';
            return;
        }

        leaderboardContainer.innerHTML = leaderboardData.map(user => `
            <div class="leaderboard-entry">
                <span class="user-id">${user.nickname}</span>
                <span class="wpm-bar" style="width: ${user.averageWPM * 5}px;">${user.averageWPM} WPM</span>
            </div>
        `).join('');
        console.log('Rendered leaderboard');
    } catch (error) {
        console.error('Error rendering leaderboard: ', error);
    }
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log('User is signed in:', user);
        try {
            await renderLeaderboard();
        } catch (error) {
            console.error('Error in onAuthStateChanged:', error);
        }
    } else {
        console.log('No user is signed in');
    }
});

export { renderLeaderboard }