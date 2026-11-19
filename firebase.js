// firebase.js - Firebase v8 CDN init (user provided config)
var firebaseConfig = {
  apiKey: "AIzaSyDcdOIEXVBxgyRFSMrQoYhuHKDMAYPQVjA",
  authDomain: "fitnessbasedappcontrol.firebaseapp.com",
  projectId: "fitnessbasedappcontrol",
  storageBucket: "fitnessbasedappcontrol.firebasestorage.app",
  messagingSenderId: "960116179935",
  appId: "1:960116179935:android:83f8f152917558a76afa6a"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
