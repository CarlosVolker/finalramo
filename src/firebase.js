import { initializeApp } from "firebase/app";
import { getFirestore, doc, deleteDoc } from "firebase/firestore";


// Configuración firebase
const firebaseConfig = {
  apiKey: "AIzaSyCVNyLkqUDBBgyRD5_SC2NSqsokTGTML80",
  authDomain: "proyectos-a2aa3.firebaseapp.com",
  projectId: "proyectos-a2aa3",
  storageBucket: "proyectos-a2aa3.firebasestorage.app",
  messagingSenderId: "965731769142",
  appId: "1:965731769142:web:70316531968e1e38383197"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, deleteDoc, doc };


