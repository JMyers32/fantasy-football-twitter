import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
    apiKey: "AIzaSyCZfLR4C0OaFZd00e_S1tiXuEd2PUlihMQ",
    authDomain: "fantasyfootball-daf99.firebaseapp.com",
    projectId: "fantasyfootball-daf99",
    storageBucket: "fantasyfootball-daf99.appspot.com",
    messagingSenderId: "859532331395",
    appId: "1:859532331395:web:cc4d3e92988f7c6fa44eb6"
  
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


export default db


