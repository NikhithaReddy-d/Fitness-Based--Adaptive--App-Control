# FitnessBasedAppControl - Full Games (Phaser + Firebase + MediaPipe)

This package contains three improved browser games (Runner, Battle, Dino) using Phaser for visuals and MediaPipe for gesture controls,
integrated with Firebase Authentication and Firestore for user accounts and app unlock persistence.

## Run locally
1. Extract the ZIP and open folder in VS Code.
2. Install Live Server extension and open `index.html` with Live Server.
3. Register/login using email/password.
4. Choose a game and allow camera access when prompted.

## Notes
- Assets load from open-source CDN links; if any asset fails to load replace with local files in /assets.
- Firestore rules must allow authenticated users to read/write their own `/users/{uid}` documents.
