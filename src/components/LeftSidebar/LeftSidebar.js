import React, { useContext, useEffect, useState } from 'react'
import "./LeftSidebar.css"
import assets from '../../assets/assets'
import { db, logout } from '../../config/firebase'
import { useNavigate } from 'react-router-dom'
import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'

const LeftSidebar = () => {

  // userData is logged in user data
  const { userData, chatData, chatUser, setChatUser, messagesId, setMessagesId, chatVisible, setChatVisible } = useContext(AppContext)
  const [user, setUser] = useState(null)  // User we trying to find and storing his info here
  const [showSearch, setShowSearch] = useState(false)
  const navigate = useNavigate()


  const inputHandler = async (e) => {
    try {
      const input = e.target.value
      if (input) {
        setShowSearch(true)
        const userRef = collection(db, "users")
        const userQuery = query(userRef, where("username", "==", input.toLowerCase()))
        // We pass query to getDocs to filter data of "users" to find our user, 
        // we want to chat with, by username. 
        const querySnap = await getDocs(userQuery)
        // Check if the user exists
        if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
          let userExist = false
          chatData.map((user) => {
            if(user.rId === querySnap.docs[0].data().id){
              userExist = true
            }
          })
          // And save his/her data in user state variable
          if(!userExist){
            setUser(querySnap.docs[0].data())
          }
        }
        else {
          setUser(null)
        }
      }
      else {
        setShowSearch(false)
      }
    } catch (err) {

    }
  }


  // when you found a guy on search bar, you click on him and the following callback 
  // function executes. This function will add a guy to your sidebar "chats".
  // Also, you will be added to his sidebar "chats". This will be done as soon as you 
  // click on a guy during searching, even if you dont chat yet, chats will be created 
  const addChat = async() => {

    // This collection is not created yet
    const messagesCollectionRef = collection(db, "messages")
    // This collection's alrdy created but it has documents, those IDs are user's ID, without filled chatsData=[]
    const chatsCollectionRef = collection(db, "chats") 
    
    try{
      // Create "messages" collection
      const newMessageRef = doc(messagesCollectionRef)
      await setDoc(newMessageRef,{
        createdAt: serverTimestamp(), 
        messages: [], // This will contain objects with sId, text, createdAt
      })

      // So we created "messages" but we need to connect our chats with it
      // Remember empty chatsData array? Now we fill it with information 
      await updateDoc(doc(chatsCollectionRef, user.id),{
        chatsData: arrayUnion({
          messageId: newMessageRef.id, // For that we pass messageId (a document id of "message") your chats
          lastMessage: "",  // To display on sidebar next to interlocutor(friend)'s name and avatar
          rId: userData.id, // The person you're chatting with
          updatedAt: Date.now(),
          messageSeen: true,
        })
      })

      // Since you started chat, the chat should be added to sidebar of the person you're chatting with
      // Note that IDs are switched now 
      await updateDoc(doc(chatsCollectionRef, userData.id),{
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: user.id, 
          updatedAt: Date.now(),
          messageSeen: true,
        })
      })

      const uSnap = await getDoc(doc(db, "users", user.id))
      const uData = uSnap.data()
      setChat({
        messagesId: newMessageRef.id,
        lastMessage: "",
        rId: user.id,
        updatedAt: Date.now(),
        messageSeen: true,
        userData: uData,
      })
      setShowSearch(false)
      setChatVisible(true)
    } catch(err){
      console.error(err)
      toast.error(err.message)
    }
  }

  // REMEMBER:
  // When you're using updateDoc along with arrayUnion, you don't encounter the issue of overwriting 
  // elements in the array because arrayUnion is a special Firestore method designed 
  // to append new values to an array without removing or replacing existing elements.

  // To save data to context and display the main chat in the middle
  const setChat = async(item) => {
    try{
      setMessagesId(item.messageId)
      setChatUser(item)
      const userChatsRef = doc(db,"chats",userData.id)
      const userChatsSnapshot = await getDoc(userChatsRef)
      const userChatsData = userChatsSnapshot.data()
      const chatIndex = userChatsData.chatsData.findIndex( (c) => c.messageId === item.messageId)
      userChatsData.chatsData[chatIndex].messageSeen = true
      await updateDoc(userChatsRef, {
        chatsData: userChatsData.chatsData
      })
      setChatVisible(true)
    } catch(err) {
      toast.error(err)
      console.error(err)
    }
  }

  useEffect( () => {
    const updateChatUserData = async() => {
      if(chatUser){
        const userRef = doc(db, "users", chatUser.userData.id)
        const userSnap = await getDoc(userRef)
        const userData = userSnap.data()
        setChatUser(prev=>({
          ...prev,
          userData: userData,
        }))
      }
    }

    updateChatUserData()
  },[chatData])
  return (
    <div className={`ls ${chatVisible ? "hidden" : ""}`}>
      <div className='ls-top'>
        <div className='ls-nav'>
          <img src={assets.logo} className='logo' alt="" />
          <div className='menu'>
            <img src={assets.menu_icon} alt="" />
            <div className='sub-menu'>
              <p onClick={() => { navigate("/profile") }}>Edit profile</p>
              <hr />
              <p onClick={() => logout()}>Logout</p>
            </div>
          </div>
        </div>
        <div className='ls-search'>
          <img src={assets.search_icon} alt="" />
          <input onChange={inputHandler} type="text" placeholder='Search here..' />
        </div>
      </div>
      <div className='ls-list'>
        {
          (showSearch && user)
            ? <div onClick={addChat} className='friends add-user'>
              <img src={user.avatar} alt="" />
              <p>{user.name}</p>
            </div>

            :
              chatData.map((item, index) => (
                <div onClick={()=>setChat(item)} key={index} className={`friends ${item.messageSeen || item.messageId === messagesId ? "" : "border"}`}>
                  <img src={item.userData.avatar} alt="" />
                  <div>
                    <p>{item.userData.name}</p>
                    <span>{item.lastMessage}</span>
                  </div>
                </div>
              ))
        }
      </div>
    </div>
  )
}

export default LeftSidebar
