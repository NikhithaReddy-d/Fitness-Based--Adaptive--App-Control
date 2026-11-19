// history.js - History functionality

let currentFilter = {
    type: '',
    date: 'all'
};

// Load history data
async function loadHistory() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        let query = db.collection('activities').where('userId', '==', user.uid);

        // Apply date filter
        if (currentFilter.date !== 'all') {
            const now = new Date();
            let startDate;

            if (currentFilter.date === 'today') {
                startDate = new Date(now.setHours(0, 0, 0, 0));
            } else if (currentFilter.date === 'week') {
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 7);
            } else if (currentFilter.date === 'month') {
                startDate = new Date(now);
                startDate.setMonth(startDate.getMonth() - 1);
            }

            if (startDate) {
                query = query.where('createdAt', '>=', firebase.firestore.Timestamp.fromDate(startDate));
            }
        }

        const snapshot = await query.orderBy('createdAt', 'desc').get();

        // Calculate stats
        let totalTime = 0;
        let activities = [];

        snapshot.forEach(doc => {
            const activity = doc.data();
            if (!currentFilter.type || activity.type === currentFilter.type) {
                totalTime += activity.duration || 0;
                activities.push({ id: doc.id, ...activity });
            }
        });

        // Update stats display
        document.getElementById('totalActivities').textContent = activities.length;
        document.getElementById('totalTime').textContent = totalTime + ' min';
        document.getElementById('avgDuration').textContent = activities.length > 0 ? Math.round(totalTime / activities.length) + ' min' : '0 min';

        // Display activities
        displayHistory(activities);
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

// Display history list
function displayHistory(activities) {
    const container = document.getElementById('historyList');
    
    if (activities.length === 0) {
        container.innerHTML = '<p style="color:#888;">No activities recorded yet.</p>';
        return;
    }

    let html = '';
    activities.forEach(activity => {
        const date = activity.createdAt ? new Date(activity.createdAt.seconds * 1000).toLocaleDateString() : 'N/A';
        const time = activity.createdAt ? new Date(activity.createdAt.seconds * 1000).toLocaleTimeString() : '';
        
        html += `
            <div class="history-item">
                <div class="history-info">
                    <span class="history-type">${activity.type}</span>
                    <span class="history-duration">${activity.duration} min</span>
                    <span class="history-intensity">${activity.intensity}</span>
                </div>
                <div class="history-meta">
                    <span class="history-date">${date} ${time}</span>
                    <span class="history-calories">~${activity.calories || 0} cal</span>
                </div>
                ${activity.notes ? `<div class="history-notes">${activity.notes}</div>` : ''}
            </div>
        `;
    });
    container.innerHTML = html;
}

// Apply filter
function applyFilter() {
    currentFilter.type = document.getElementById('filterType').value;
    currentFilter.date = document.getElementById('filterDate').value;
    loadHistory();
}

// Add event listeners
document.getElementById('applyFilter').addEventListener('click', applyFilter);

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadHistory);
