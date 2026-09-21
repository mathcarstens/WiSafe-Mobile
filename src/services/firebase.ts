import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
//aqui a magia acontece, pssoal, esse arquivo configura a conexao 
// com o Firebase usando as chaves do projeto e exporta os 
// objetos de autenticacao e banco de dados para serem usados em
//  outras partes do app.
const firebaseConfig = {
  apiKey: "AIzaSyDTIco738zN1i-WWIYUZ1QpHtxdS2g6-aY",
  authDomain: "projetomobile-88287.firebaseapp.com",
  projectId: "projetomobile-88287",
  storageBucket: "projetomobile-88287.firebasestorage.app",
  messagingSenderId: "886733565032",
  appId: "1:886733565032:web:35c6a9a5017c7b7e969fdd"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);