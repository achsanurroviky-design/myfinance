import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyC2IiEyrtShNEohd909IlbPchGx9OuDbXo",
  authDomain: "my-finance-f8a8d.firebaseapp.com",
  projectId: "my-finance-f8a8d",
  storageBucket: "my-finance-f8a8d.firebasestorage.app",
  messagingSenderId: "1047355920254",
  appId: "1:1047355920254:web:86ff6e5274da0a7e852d2f"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()
export const db = getFirestore(app)