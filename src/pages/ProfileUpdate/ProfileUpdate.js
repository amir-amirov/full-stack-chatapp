import React, { useContext, useEffect, useState } from 'react'
import "./ProfileUpdate.css"
import assets from '../../assets/assets'
import { getStorage, ref } from "firebase/storage";
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import upload from '../../lib/upload';
import { AppContext } from '../../context/AppContext';

const ProfileUpdate = () => {

    const navigate = useNavigate()

    const [profileImage, setProfileImage] = useState(null)
    const [name, setName] = useState("")
    const [bio, setBio] = useState("")
    const [uid, setUid] = useState("")
    const [prevImage, setPrevImage] = useState("")
    const {setUserData} = useContext(AppContext)

    const profileUpdate = async(e) =>{
        e.preventDefault()
        try{
            if(!prevImage && !profileImage){
                toast.error("Upload profile picture")
            }
            const docRef = doc(db, "users", uid)

            if(profileImage){
                const imgUrl = await upload(profileImage)
                setPrevImage(imgUrl)
                await updateDoc(docRef, {
                    name: name,
                    bio: bio,
                    avatar: imgUrl,
                })
            }
            else{
                await updateDoc(docRef, {
                    name: name,
                    bio: bio,
                })
            }
            const snap = await getDoc(docRef)
            setUserData(snap.data())
            navigate("/chat")

        } catch(err){
            console.error(err)
            toast.error(err.message)
        }
    }

    useEffect( () => {
        onAuthStateChanged(auth, async(user) => {
            if(user){
                setUid(user.uid)
                const docRef = doc(db, "users", user.uid)
                // Note I cannot write like this: const docRef = doc(db, "users", uid)
                // Because state update does NOT happen immediately, updated only when the current execution cycle finishes
                const docSnap = await getDoc(docRef)
                docSnap.data().name ? setName(docSnap.data().name) : setName("")
                docSnap.data().bio ? setBio(docSnap.data().bio) : setBio("")
                docSnap.data().avatar ? setPrevImage(docSnap.data().avatar) : setPrevImage("")
            }
            else{
                navigate("/")
            }
        })
    }, [])

  return (
    <div className='profile'>
        <div className='profile-container'>
            <form onSubmit={profileUpdate}>
                <h3>Profile details</h3>
                <label htmlFor="avatar">
                    <input type="file" onChange={(e) => setProfileImage(e.target.files[0])} id="avatar" accept=".png, .jpg, .jpeg" hidden/>
                    <img src={profileImage ? URL.createObjectURL(profileImage) : assets.avatar_icon} alt=""/>
                    Upload profile image
                </label>
                <input value={name} onChange={e => setName(e.target.value)} type="text" placeholder='Your name..' required/>
                <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder='Write profile bio' required></textarea>
                <button type="submit">Save</button>
            </form>
            <img className="profile-pic" src={profileImage ? URL.createObjectURL(profileImage) : (prevImage ? prevImage : assets.logo_icon)} alt=""/>
        </div>
    </div>
  )
}

export default ProfileUpdate
