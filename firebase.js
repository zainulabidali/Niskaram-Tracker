import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCD9EfW8QAY22HX8HstqiyA9PLOHfVRD7U",
  authDomain: "demo20-d93b3.firebaseapp.com",
  databaseURL: "https://demo20-d93b3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "demo20-d93b3",
  storageBucket: "demo20-d93b3.firebasestorage.app",
  messagingSenderId: "202077213232",
  appId: "1:202077213232:web:af6f806982a6fc0abf13f5"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
