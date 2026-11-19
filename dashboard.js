// dashboard.js - Dashboard functionality

// Load user data and display stats
async function loadDashboardData() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        // Get user document
        const userDoc = await getUserDoc(user.uid);
        if (userDoc) {
            document.getElementById('userName').textContent = userDoc.name || 'HUNTER';
            document.getElementById('userLevel').textContent = userDoc.level || 1;
            document.getElementById('totalScore').textContent = userDoc.totalScore || 0;
        }

        // Get activity count
        const activitiesSnapshot = await db.collection('activities')
            .where('userId', '==', user.uid)
            .get();
        document.getElementById('activityCount').textContent = activitiesSnapshot.size;

        // Get reminder count
        const remindersSnapshot = await db.collection('reminders')
            .where('userId', '==', user.uid)
            .get();
        document.getElementById('reminderCount').textContent = remindersSnapshot.size;

        // Load recent activities
        loadRecentActivities(user.uid);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Load recent activities
async function loadRecentActivities(userId) {
    try {
        const snapshot = await db.collection('activities')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();

        const container = document.getElementById('recentActivities');
        
        if (snapshot.empty) {
            container.innerHTML = '<p style="color:#888;">No recent activities recorded.</p>';
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const activity = doc.data();
            const date = activity.createdAt ? new Date(activity.createdAt.seconds * 1000).toLocaleDateString() : 'N/A';
            html += `
                <div class="activity-item">
                    <span class="activity-type">${activity.type || 'Activity'}</span>
                    <span class="activity-duration">${activity.duration || 0} min</span>
                    <span class="activity-date">${date}</span>
                </div>
            `;
        });
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading recent activities:', error);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadDashboardData);
