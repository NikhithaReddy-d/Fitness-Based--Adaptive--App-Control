// reminders.js - Reminders functionality

// Add new reminder
async function addReminder() {
    const user = auth.currentUser;
    if (!user) return;

    const title = document.getElementById('reminderTitle').value.trim();
    const type = document.getElementById('reminderType').value;
    const time = document.getElementById('reminderTime').value;
    const repeat = document.getElementById('reminderRepeat').value;
    const notes = document.getElementById('reminderNotes').value.trim();
    const msg = document.getElementById('addMsg');
    const addBtn = document.getElementById('addReminder');

    if (!title || !time) {
        msg.style.color = '#ff4d4d';
        msg.textContent = 'Error: Title and time are required';
        return;
    }

    addBtn.disabled = true;
    msg.style.color = '#00d4ff';
    msg.textContent = 'Adding reminder...';

    try {
        await db.collection('reminders').add({
            userId: user.uid,
            title: title,
            type: type,
            time: time,
            repeat: repeat,
            notes: notes,
            active: true,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        msg.style.color = '#00ff88';
        msg.textContent = 'Reminder added successfully!';

        // Clear form
        document.getElementById('reminderTitle').value = '';
        document.getElementById('reminderTime').value = '';
        document.getElementById('reminderNotes').value = '';

        // Refresh reminders list
        loadReminders();

        setTimeout(() => {
            msg.textContent = '';
        }, 3000);
    } catch (error) {
        msg.style.color = '#ff4d4d';
        msg.textContent = 'Error: ' + error.message;
    } finally {
        addBtn.disabled = false;
    }
}

// Load all reminders
async function loadReminders() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const snapshot = await db.collection('reminders')
            .where('userId', '==', user.uid)
            .orderBy('time')
            .get();

        const container = document.getElementById('remindersList');
        
        if (snapshot.empty) {
            container.innerHTML = '<p style="color:#888;">No reminders set yet.</p>';
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const reminder = doc.data();
            html += `
                <div class="reminder-item">
                    <div class="reminder-info">
                        <span class="reminder-title">${reminder.title}</span>
                        <span class="reminder-type">${reminder.type}</span>
                    </div>
                    <div class="reminder-meta">
                        <span class="reminder-time">${reminder.time}</span>
                        <span class="reminder-repeat">${reminder.repeat}</span>
                    </div>
                    ${reminder.notes ? `<div class="reminder-notes">${reminder.notes}</div>` : ''}
                    <button class="delete-btn" onclick="deleteReminder('${doc.id}')">DELETE</button>
                </div>
            `;
        });
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading reminders:', error);
    }
}

// Delete reminder
async function deleteReminder(reminderId) {
    if (!confirm('Are you sure you want to delete this reminder?')) return;

    try {
        await db.collection('reminders').doc(reminderId).delete();
        loadReminders();
    } catch (error) {
        console.error('Error deleting reminder:', error);
    }
}

// Add event listener
document.getElementById('addReminder').addEventListener('click', addReminder);

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadReminders);
