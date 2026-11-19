// activity.js - Activity tracking functionality

// Log new activity
async function logActivity() {
    const user = auth.currentUser;
    if (!user) return;

    const type = document.getElementById('activityType').value;
    const duration = parseInt(document.getElementById('activityDuration').value);
    const intensity = document.getElementById('activityIntensity').value;
    const notes = document.getElementById('activityNotes').value.trim();
    const msg = document.getElementById('logMsg');
    const logBtn = document.getElementById('logActivity');

    if (!duration || duration <= 0) {
        msg.style.color = '#ff4d4d';
        msg.textContent = 'Error: Please enter a valid duration';
        return;
    }

    logBtn.disabled = true;
    msg.style.color = '#00d4ff';
    msg.textContent = 'Logging activity...';

    try {
        // Calculate estimated calories (rough estimate)
        const caloriesPerMin = intensity === 'high' ? 12 : intensity === 'medium' ? 8 : 5;
        const estimatedCalories = duration * caloriesPerMin;

        // Add activity to Firestore
        await db.collection('activities').add({
            userId: user.uid,
            type: type,
            duration: duration,
            intensity: intensity,
            notes: notes,
            calories: estimatedCalories,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Update user score
        const userDoc = await getUserDoc(user.uid);
        if (userDoc) {
            const newScore = (userDoc.totalScore || 0) + Math.floor(duration / 10);
            const newLevel = Math.floor(newScore / 100) + 1;
            
            await db.collection('users').doc(user.uid).update({
                totalScore: newScore,
                level: newLevel
            });
        }

        msg.style.color = '#00ff88';
        msg.textContent = 'Activity logged successfully!';

        // Clear form
        document.getElementById('activityDuration').value = '';
        document.getElementById('activityNotes').value = '';

        // Refresh data
        loadTodayActivities();
        loadWeeklySummary();

        setTimeout(() => {
            msg.textContent = '';
        }, 3000);
    } catch (error) {
        msg.style.color = '#ff4d4d';
        msg.textContent = 'Error: ' + error.message;
    } finally {
        logBtn.disabled = false;
    }
}

// Load today's activities
async function loadTodayActivities() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const snapshot = await db.collection('activities')
            .where('userId', '==', user.uid)
            .where('createdAt', '>=', firebase.firestore.Timestamp.fromDate(today))
            .orderBy('createdAt', 'desc')
            .get();

        const container = document.getElementById('todayActivities');
        
        if (snapshot.empty) {
            container.innerHTML = '<p style="color:#888;">No activities logged today.</p>';
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const activity = doc.data();
            const time = activity.createdAt ? new Date(activity.createdAt.seconds * 1000).toLocaleTimeString() : '';
            html += `
                <div class="activity-item">
                    <span class="activity-type">${activity.type}</span>
                    <span class="activity-duration">${activity.duration} min</span>
                    <span class="activity-intensity">${activity.intensity}</span>
                    <span class="activity-time">${time}</span>
                </div>
            `;
        });
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading today activities:', error);
    }
}

// Load weekly summary
async function loadWeeklySummary() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const snapshot = await db.collection('activities')
            .where('userId', '==', user.uid)
            .where('createdAt', '>=', firebase.firestore.Timestamp.fromDate(weekAgo))
            .get();

        let totalTime = 0;
        let totalCalories = 0;

        snapshot.forEach(doc => {
            const activity = doc.data();
            totalTime += activity.duration || 0;
            totalCalories += activity.calories || 0;
        });

        document.getElementById('totalWeeklyTime').textContent = totalTime + ' min';
        document.getElementById('weeklyActivityCount').textContent = snapshot.size;
        document.getElementById('weeklyCalories').textContent = totalCalories;
    } catch (error) {
        console.error('Error loading weekly summary:', error);
    }
}

// Add event listener
document.getElementById('logActivity').addEventListener('click', logActivity);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadTodayActivities();
    loadWeeklySummary();
});
