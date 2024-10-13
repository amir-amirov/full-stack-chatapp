import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { getFirestore, doc, setDoc } from "firebase/firestore"
import { toast } from "react-toastify";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore(app)

export const signUp = async(username, email, password) => {
  try{

    const userCredentials = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredentials.user

    const defaultAvatar = 'https://firebasestorage.googleapis.com/v0/b/chat-app-e2ad2.appspot.com/o/images%2Favatar_icon.png?alt=media&token=2ae0cf20-afff-4f7f-9c3c-2b6d97f35fc8'

    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      email: email,
      username: username.toLowerCase(),
      name: "",
      avatar: defaultAvatar,
      bio: "Hi there! I am using chat app",
      lastSeen: Date.now()
    })
    await setDoc(doc(db, "chats", user.uid), {
      chatsData: []
    })
  } catch(err){
    console.error(err)
    toast.error(err.code)
  }
}

export const login = async(email, password) => {
  try{
    await signInWithEmailAndPassword(auth, email, password)
  } catch(err){
    console.error(err)
    toast.error(err.code.split("/")[1].split("-").join(" "))
  }
}

export const logout = async() => {
  try{
    await signOut(auth)
  } catch(err){
    console.error(err)
    toast.error(err.code.split("/")[1].split("-").join(" "))
  }
}