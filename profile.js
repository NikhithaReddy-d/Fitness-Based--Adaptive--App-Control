// profile..js - Profile functionality

// Load user profile data
async function loadProfileData() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const userDoc = await getUserDoc(user.uid);
        if (userDoc) {
            document.getElementById('profileName').textContent = userDoc.name || 'HUNTER';
            document.getElementById('profileEmail').textContent = userDoc.email || 'email@example.com';
            document.getElementById('profileLevel').textContent = userDoc.level || 1;
            document.getElementById('totalScore').textContent = userDoc.totalScore || 0;
            document.getElementById('editName').value = userDoc.name || '';
            document.getElementById('editGender').value = userDoc.gender || 'Not Specified';
            document.getElementById('editEmail').value = userDoc.email || '';
            
            if (userDoc.createdAt) {
                const createdDate = new Date(userDoc.createdAt.seconds * 1000).toLocaleDateString();
                document.getElementById('createdAt').value = createdDate;
            }

            // Set avatar initial
            const initial = userDoc.name ? userDoc.name.charAt(0).toUpperCase() : '?';
            document.getElementById('userAvatar').textContent = initial;
        }

        // Get activities count
        const activitiesSnapshot = await db.collection('activities')
            .where('userId', '==', user.uid)
            .get();
        document.getElementById('activitiesCompleted').textContent = activitiesSnapshot.size;

        // Get reminders count
        const remindersSnapshot = await db.collection('reminders')
            .where('userId', '==', user.uid)
            .get();
        document.getElementById('remindersSet').textContent = remindersSnapshot.size;

    } catch (error) {
        console.error('Error loading profile data:', error);
    }
}

// Save profile changes
async function saveProfile() {
    const user = auth.currentUser;
    if (!user) return;

    const name = document.getElementById('editName').value.trim();
    const gender = document.getElementById('editGender').value;
    const email = document.getElementById('editEmail') ? document.getElementById('editEmail').value.trim() : null;
    const msg = document.getElementById('saveMsg');
    const saveBtn = document.getElementById('saveProfile');

    if (!name) {
        msg.style.color = '#ff4d4d';
        msg.textContent = 'Error: Name is required';
        return;
    }

    saveBtn.disabled = true;
    msg.style.color = '#00d4ff';
    msg.textContent = 'Saving...';

    try {
        // Build update data object
        const updateData = {
            name: name,
            gender: gender
        };

        // Add email to update if provided
        if (email) {
            updateData.email = email.toLowerCase();
        }

        // Use set with merge: true to create document if it doesn't exist
        await db.collection('users').doc(user.uid).set(updateData, { merge: true });

        msg.style.color = '#00ff88';
        msg.textContent = 'Profile updated successfully!';
        
        // Update display
        document.getElementById('profileName').textContent = name;
        document.getElementById('userAvatar').textContent = name.charAt(0).toUpperCase();
        
        // Update email display if email was changed
        if (email) {
            document.getElementById('profileEmail').textContent = email;
        }
        
        setTimeout(() => {
            msg.textContent = '';
        }, 3000);
    } catch (error) {
        msg.style.color = '#ff4d4d';
        msg.textContent = 'Error: ' + error.message;
        console.error('Error saving profile:', error);
    } finally {
        saveBtn.disabled = false;
    }
}

// Add event listener
document.getElementById('saveProfile').addEventListener('click', saveProfile);

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadProfileData);
