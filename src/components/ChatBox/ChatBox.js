import React, { useContext, useEffect, useState } from 'react'
import "./ChatBox.css"
import assets from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { toast } from 'react-toastify'
import { db } from '../../config/firebase'
import upload from '../../lib/upload';

const ChatBox = () => {

  const { userData, messagesId, chatUser, messages, setMessages, chatVisible, setChatVisible } = useContext(AppContext)

  const [input, setInput] = useState("")

  const sendMessage = async() => {
    try{
      if(input && messagesId){
        await updateDoc(doc(db, "messages", messagesId),{
          messages: arrayUnion({
            sId: userData.id,
            text: input,
            createdAt: new Date()
          })
        })

        const userIDs = [chatUser.rId, userData.id]

        userIDs.forEach(async(id) => {
          const userChatsRef = doc(db, 'chats', id)
          const userChatsSnapshot = await getDoc(userChatsRef)

          if(userChatsSnapshot.exists()){
            const userChatData = userChatsSnapshot.data()
            const chatIndex = userChatData.chatsData.findIndex( (c) => c.messageId  === messagesId)
            userChatData.chatsData[chatIndex].lastMessage = input.slice(0,30)
            userChatData.chatsData[chatIndex].updatedAt = Date.now()
            if(userChatData.chatsData[chatIndex].rId === userData.id){
              userChatData.chatsData[chatIndex].messageSeen = false;
            }
            await updateDoc(userChatsRef,{
              chatsData: userChatData.chatsData
            })
          }
        })
      }
      setInput("")
    } catch(err){
      console.error(err)
      toast.error(err.message)
    }
  }
  
  // In case message is image
  const sendImage = async(e) => {
    try{
      const fileUrl = await upload(e.target.files[0])

      if(fileUrl && messagesId){

        // This is to send image to main chat, but image is not visible yet
        // To display image, in messages.map, it's needed to check if image property is available
        // if available, the image should be send if not, then text
        await updateDoc(doc(db, "messages", messagesId),{
          messages: arrayUnion({
            sId: userData.id,
            image: fileUrl,
            createdAt: new Date()
          })
        })

        // To update chats on sidebar
        const userIDs = [chatUser.rId, userData.id]

        userIDs.forEach(async(id) => {
          const userChatsRef = doc(db, 'chats', id)
          const userChatsSnapshot = await getDoc(userChatsRef)

          if(userChatsSnapshot.exists()){
            const userChatData = userChatsSnapshot.data()
            const chatIndex = userChatData.chatsData.findIndex( (c) => c.messageId  === messagesId)
            userChatData.chatsData[chatIndex].lastMessage = "Image"
            userChatData.chatsData[chatIndex].updatedAt = Date.now()
            if(userChatData.chatsData[chatIndex].rId === userData.id){
              userChatData.chatsData[chatIndex].messageSeen = false;
            }
            await updateDoc(userChatsRef,{
              chatsData: userChatData.chatsData
            })
          }
        })
      }
    } catch(err){
      toast.error(err.message)
      console.error(err)
    }
  }

  const convertTimestamp = (timestamp) => {
    let date = timestamp.toDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    if(hour > 12){
      return hour - 12 + ":" + minute + " PM"
    }
    else{
      return hour + ":" + minute + " AM"
    }
  }


  useEffect( () => {
    if(messagesId){
      const unsubscribe = onSnapshot(doc(db, "messages", messagesId), (snapshot) => {
        setMessages(snapshot.data().messages.reverse())
      })
      return () => unsubscribe()
    }

  }, [messagesId])

  return chatUser ? (
    <div className={`chat-box ${chatVisible ? "" : "hidden"}`}>
      <div className='chat-user'>
        <img src={chatUser.userData.avatar} alt=""/>
        <p>{chatUser.userData.name} <img className="dot" src={assets.green_dot} alt=""/></p>
        <img src={assets.help_icon} className="help" alt=""/>
        <img onClick={()=>setChatVisible(false)} src={assets.arrow_icon} className="arrow" alt=""/>
      </div>
      
      <div className='chat-msg'>
        {messages.map( (msg, index) => (
          <div key={index} className={msg.sId === userData.id ? "s-msg" : "r-msg"}>
            {
            /*Here we check if images are available, to determine what to send
              If yes, then image is sent. If not, text is sent. */
            }
            {msg["image"]
            ? <img className="msg-image" src={msg.image} alt=""/>
            : <p className='msg'>{msg.text}</p>
            }
            <div>
                <img src={msg.sId === userData.id ? userData.avatar : chatUser.userData.avatar} alt=""/>
                <p>{convertTimestamp(msg.createdAt)}</p>
            </div>
          </div>
        ))}

      </div>

      <div className='chat-input'>
        <input value={input} onChange={e => setInput(e.target.value)} type="text" placeholder='Send a message'/>
        <input onChange={sendImage} type="file" id="image" accept='image/png, image/jpeg, image/jpg' hidden />
        <label htmlFor="image">
            <img src={assets.gallery_icon} alt=""/>
        </label>
        <img onClick={sendMessage} src={assets.send_button} alt=""/>
      </div>
    </div>
  )
  : <div className={`chat-welcome ${chatVisible ? "" : "hidden"}`}>
    <img src={assets.logo_icon} alt=""/>
    <p>Chat anytime, anywhere!</p>
  </div>
}

export default ChatBox
