import { Route, Routes, useNavigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Chat from "./pages/Chat/Chat";
import ProfileUpdate from "./pages/ProfileUpdate/ProfileUpdate";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import { useContext, useEffect } from "react";
import { AppContext } from "./context/AppContext";

function App() {

  const navigate = useNavigate()
  const { loadUserData, setUserData, setChatData, setMessagesId, setMessages, setChatUser } = useContext(AppContext)

  useEffect( () => {
    onAuthStateChanged(auth, async(user) => {
      if(user){
        await loadUserData(auth.currentUser.uid)
      }
      else{
        navigate("/")
        setUserData(null)
        setChatData([])
        setMessagesId(null)
        setMessages([])
        setChatUser(null)
      }
    })
  }, [])
  return (
    <div className="App">
      <ToastContainer />
      <Routes>
        <Route path='/' element={<Login />}/>
        <Route path='/chat' element={<Chat />}/>
        <Route path='/profile' element={<ProfileUpdate />}/>
      </Routes>
    </div>
  );
}

export default App;
