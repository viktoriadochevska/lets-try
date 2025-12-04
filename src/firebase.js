import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBWvkuucqRhIy8VpNVHl3LYnzQAjOlmcPY",
  authDomain: "framing-study.firebaseapp.com",
  databaseURL: "https://framing-study-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "framing-study",
  storageBucket: "framing-study.firebasestorage.app",
  messagingSenderId: "508135784536",
  appId: "1:508135784536:web:96c2ecb4ad01f647910a2d"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
