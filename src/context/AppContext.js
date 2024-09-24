import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { createContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext()

const AppContextProvider = ({children}) => {

    const navigate = useNavigate()
    
    // Note: "sender" and "receiver" are role-based terms used for convenience.
    // They do not always reflect who is actively sending/receiving messages.
    // In some contexts, the sender might be treated as a receiver and vice versa 
    // when creating chatsData for both users.

    const [userData, setUserData] = useState(null)  // sender data from "users" collection
    const [chatData, setChatData] = useState(null)  // sidebar chats data of the sender
    const [messagesId, setMessagesId] = useState(null) // id for main chat (document id in "messages")
    const [messages, setMessages] = useState([]) // the document with this id has messages array and is stored here
    const [chatUser, setChatUser] = useState(null) // store data of user you're chatting with + your particular chatsData 
    // Mainly need rId (the person we're chatting with)

    const [chatVisible, setChatVisible] = useState(false) // For responsive design
    
    const loadUserData = async(uid) => {
        try{
            const userRef = doc(db, "users", uid)
            const userSnap = await getDoc(userRef)
            const userData = userSnap.data()
            setUserData(userData)
            if(userData.avatar && userData.name){
                navigate("/chat")            
            }
            else{
                navigate("/profile")
            }
            await updateDoc(userRef,{
                lastSeen: Date.now()
            })
        } catch(err){
            console.error(err)
        }
    }

    // This one to fill our chatData state variable aka chatsData in "chats" collection
    // chatData will have all chats we (a user) have on sidebar

    // This is to set your chats on side bar
    useEffect( () => {
        if(userData){
            const chatRef = doc(db, "chats", userData.id)
            const unsubscribe = onSnapshot(chatRef, async(snapshot) => {
                const chatItems = snapshot.data().chatsData
                const tempData = []
                for(const item of chatItems){
                    const userRef = doc(db, 'users', item.rId)
                    const userSnap = await getDoc(userRef)
                    const userData = userSnap.data()
                    tempData.push({...item, userData})
                }
                setChatData(tempData.sort((a,b) => b.updatedAt - a.updatedAt))
            })
            return () => unsubscribe
        }

    }, [userData])
    
    const value = {
        userData, setUserData,
        chatData, setChatData,
        loadUserData,
        messages, setMessages,
        messagesId, setMessagesId,
        chatUser, setChatUser,
        chatVisible, setChatVisible,
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export default AppContextProvider