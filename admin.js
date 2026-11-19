// admin.js - Admin functionality

// Load admin dashboard data
async function loadAdminData() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        // Check if user is admin
        const userDoc = await getUserDoc(user.uid);
        if (!userDoc || !userDoc.isAdmin) {
            alert('Access Denied: Admin privileges required');
            location.href = 'menu.html';
            return;
        }

        // Load stats
        await loadStats();
        
        // Load users list
        await loadUsers();
        
        // Load recent activity logs
        await loadActivityLogs();
    } catch (error) {
        console.error('Error loading admin data:', error);
    }
}

// Load system stats
async function loadStats() {
    try {
        // Get total users
        const usersSnapshot = await db.collection('users').get();
        document.getElementById('totalUsers').textContent = usersSnapshot.size;

        // Get active users (users with activities in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        let activeCount = 0;
        const userIds = new Set();
        
        const activitiesSnapshot = await db.collection('activities')
            .where('createdAt', '>=', firebase.firestore.Timestamp.fromDate(thirtyDaysAgo))
            .get();
        
        activitiesSnapshot.forEach(doc => {
            userIds.add(doc.data().userId);
        });
        activeCount = userIds.size;
        
        document.getElementById('activeUsers').textContent = activeCount;

        // Get total activities
        const allActivitiesSnapshot = await db.collection('activities').get();
        document.getElementById('totalActivities').textContent = allActivitiesSnapshot.size;

    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load users list
async function loadUsers(searchTerm = '') {
    try {
        let query = db.collection('users');
        
        const snapshot = await query.get();
        const container = document.getElementById('usersList');
        
        let users = [];
        snapshot.forEach(doc => {
            users.push({ id: doc.id, ...doc.data() });
        });

        // Filter by search term if provided
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            users = users.filter(u => 
                (u.name && u.name.toLowerCase().includes(term)) || 
                (u.email && u.email.toLowerCase().includes(term))
            );
        }

        if (users.length === 0) {
            container.innerHTML = '<p style="color:#888;">No users found.</p>';
            return;
        }

        let html = '';
        users.forEach(user => {
            const createdAt = user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'N/A';
            html += `
                <div class="user-item">
                    <div class="user-info">
                        <span class="user-name">${user.name || 'Unknown'}</span>
                        <span class="user-email">${user.email || 'No email'}</span>
                    </div>
                    <div class="user-meta">
                        <span class="user-level">Level: ${user.level || 1}</span>
                        <span class="user-score">Score: ${user.totalScore || 0}</span>
                        <span class="user-date">Joined: ${createdAt}</span>
                    </div>
                    <div class="user-actions">
                        <button onclick="viewUser('${user.id}')">VIEW</button>
                        <button onclick="deleteUser('${user.id}')" style="background:#ff4d4d;">DELETE</button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Load activity logs
async function loadActivityLogs() {
    try {
        const snapshot = await db.collection('activities')
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();

        const container = document.getElementById('activityLogs');
        
        if (snapshot.empty) {
            container.innerHTML = '<p style="color:#888;">No recent activity.</p>';
            return;
        }

        let html = '';
        for (const doc of snapshot.docs) {
            const activity = doc.data();
            const date = activity.createdAt ? new Date(activity.createdAt.seconds * 1000).toLocaleString() : 'N/A';
            
            // Get user name
            let userName = 'Unknown';
            try {
                const userDoc = await db.collection('users').doc(activity.userId).get();
                if (userDoc.exists) {
                    userName = userDoc.data().name || 'Unknown';
                }
            } catch (e) {}

            html += `
                <div class="log-item">
                    <span class="log-user">${userName}</span>
                    <span class="log-activity">${activity.type}</span>
                    <span class="log-duration">${activity.duration} min</span>
                    <span class="log-date">${date}</span>
                </div>
            `;
        }
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading activity logs:', error);
    }
}

// Search users
function searchUsers() {
    const searchTerm = document.getElementById('searchUsers').value.trim();
    loadUsers(searchTerm);
}

// View user details
async function viewUser(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
            const user = userDoc.data();
            alert(`User Details:\n\nName: ${user.name}\nEmail: ${user.email}\nGender: ${user.gender}\nLevel: ${user.level}\nTotal Score: ${user.totalScore}`);
        }
    } catch (error) {
        console.error('Error viewing user:', error);
    }
}

// Delete user
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
        // Delete user data from Firestore
        await db.collection('users').doc(userId).delete();
        
        alert('User deleted successfully!');
        loadUsers();
        loadStats();
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user: ' + error.message);
    }
}

// Add event listeners
document.getElementById('searchBtn').addEventListener('click', searchUsers);

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadAdminData);
