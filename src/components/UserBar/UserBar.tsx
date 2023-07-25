import React, { MouseEventHandler } from 'react'
import './UserBar.scss'
import { triangleIco, userIco } from '../../assets'
import { UserType } from '../types'
import User from '../UserComponent/User'
import DropDown from './DropDown'
import { useAuthStore } from '../../ZustandStore'
const UserBar = ({user}:{user:UserType}) => {
  const content = (
    <div className='user-bar-component'>
      <User  location="bar" user={user}/>
      
      <DropDown />
    </div>
  )
  
  return content
    
  
}

export default UserBar