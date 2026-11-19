// auth.js - Optimized for "Anyone Can Register"
async function registerUser(name, email, password, gender) {
  try {
    // 1. Force logout any existing session to prevent "session mixing"
    await auth.signOut();

    // 2. Create the account
    const userCred = await auth.createUserWithEmailAndPassword(email.trim(), password);
    const uid = userCred.user.uid;

    // 3. Save profile data
    await db.collection('users').doc(uid).set({
      name: name || 'Unnamed Hunter',
      email: email.trim().toLowerCase(),
      gender: gender || 'Not Specified',
      totalScore: 0,
      level: 1,
      createdAt: new Date().toISOString()
    });

    return { success: true };
  } catch (err) {
    console.error("Firebase Auth Error Code:", err.code);
    // If you see 'auth/network-request-failed', your internet is slow.
    // If you see 'auth/email-already-in-use', that specific email is definitely taken.
    return { success: false, error: err.message };
  }
}

// Keep loginUser for your actual Login page
async function loginUser(email, password) {
  try {
    await auth.signInWithEmailAndPassword(email.trim(), password);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Get user document from Firestore
async function getUserDoc(uid) {
  try {
    const doc = await db.collection('users').doc(uid).get();
    if (doc.exists) {
      return doc.data();
    }
    return null;
  } catch (err) {
    console.error("Error getting user doc:", err);
    return null;
  }
}

// Sign out user
async function signOutUser() {
  try {
    await auth.signOut();
    return { success: true };
  } catch (err) {
    console.error("Error signing out:", err);
    return { success: false, error: err.message };
  }
}

// Handle authentication state change
function onAuthStateChange(callback) {
  auth.onAuthStateChanged(async (user) => {
    if (callback) {
      await callback(user);
    }
  });
}
