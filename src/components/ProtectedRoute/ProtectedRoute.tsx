import  { useEffect } from 'react'
import { Navigate,Outlet } from 'react-router-dom'
import {  useAuthCookies } from '../../hooks'
import ChannelsBar from '../DashBoard/ChannelsBar/ChannelsBar'
import SocketStore from '../SocketStore'
import { sleep } from '../utils'


import { useAuthStore, useChatStore } from '../../ZustandStore'

const {io,serverUrl,certOptions}=SocketStore()

export const userSocket = io(`${serverUrl}/user`,{
  pfx:certOptions.pfx,passphrase:certOptions.passphrase,reconnection:true,reconnectionDelayMax:5000,reconnectionAttempts:Infinity, autoConnect:false});

const ProtectedRoute = () => {
  const {cookies} = useAuthCookies()
  const setUser=useAuthStore(s=>s.setUser)
  const setOnlineUsers=useAuthStore(s=>s.setOnlineUsers)
  const user=useAuthStore(s=>s.user)
  const setLoading=useAuthStore(s=>s.setLoading)
  if(!user?.email && !cookies?.user?.email) return <Navigate to="/auth/signin" replace/> 
   
  useEffect(
    ()=>{
      sleep(500).then( 
        async()=>{
        let isLogged = cookies?.user
      
        if(isLogged?.email){
          setUser(isLogged);

        }
      setLoading(false)
      }
      )
    },[cookies.user]
  )

  useEffect(
    ()=>{
      if(user?._id){
        userSocket.connect()
        let onOnline = (users: any)=>{
            console.log(`onOnline:`, users)
            setOnlineUsers(users)
          } 
          let onConnection = ()=>{
          userSocket.emit('user_online',{user_id:user?._id})
          console.log(`CONNECTED TO USER SOCKET`,)
          }
          let onDisconnect = ()=>{
            console.log(`DISCONNECTED FROM USER SOCKET`,)
          }
    
          userSocket.on('user_online',onOnline)
          userSocket.on('connect',onConnection)
          userSocket.on('disconnect',onDisconnect)
          return ()=>{
            userSocket.off('user_online',onOnline)
            userSocket.off('connect',onConnection)
            userSocket.off('disconnect',onDisconnect)
            userSocket.disconnect()
          }
      }
    },[user?._id]
  )
  return  (
      <div className='app-wrapper'>
        <ChannelsBar user={user} />
        <Outlet/>
      </div>
  )
}

export default ProtectedRoute