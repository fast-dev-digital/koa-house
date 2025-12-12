// src/firebase-config.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ DEBUG: Ver qual arquivo .env está sendo usado
console.log("🔍 Variáveis de ambiente carregadas:");
console.log("   MODE:", import.meta.env.MODE);
console.log("   DEV:", import.meta.env.DEV);
console.log("   PROJECT_ID:", import.meta.env.VITE_FIREBASE_PROJECT_ID);
console.log("   AUTH_DOMAIN:", import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);

// Objeto de configuração que lê as variáveis de ambiente seguras do arquivo .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Debug: Verificar se as configurações estão sendo carregadas

// Inicializa o aplicativo Firebase com as configurações
const app = initializeApp(firebaseConfig);
("✅ Firebase inicializado com sucesso!");

// Exporta os serviços que vamos usar no resto do projeto (Autenticação e Banco de Dados)
export const auth = getAuth(app);
export const db = getFirestore(app);
