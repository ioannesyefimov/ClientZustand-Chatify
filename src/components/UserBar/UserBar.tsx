import React, { MouseEventHandler } from 'react'
import './UserBar.scss'
import { triangleIco, userIco } from '../../assets'
import { UserType } from '../types'
import User from '../UserComponent/User'
import DropDown from './DropDown'
import { useAuthStore } from '../../ZustandStore'
const UserBar = ({user}:{user:UserType}) => {
  const onlineUsers = useAuthStore(s=>s.onlineUsers)
  let isOnline = onlineUsers?.some(onlineUser=>{
    console.log(`online:`, onlineUser)
    console.log(`user:`, user)
  return  onlineUser?.userId===user?._id || onlineUser?.userId===user?.member?._id
})
  const content = (
    <div className='user-bar-component'>
      <User isOnline={isOnline} location="bar" user={user}/>
      
      <DropDown />
    </div>
  )
  
  return content
    
  
}

export default UserBar