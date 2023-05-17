import React from 'react'
import { offlineStatusIco, onlineStatusIco, userIco } from '../../assets'
import { UserType } from '../types'
import { Link } from 'react-router-dom'
type PropsType = {
  user:UserType
  location?: 'profile' | 'bar' | ''
}

const User = ({user,className,location,isOnline}:{isOnline:boolean | undefined, user?:UserType,className?:string,location:string}) => {
    return (
      <Link to={location==='profile' || location==='bar' ? '/profile' : `/user/${user?._id  ?? 'deleted'}`} className={className ?? 'user'} >
          <img src={user?.picture ? user.picture : userIco} alt="avatar" className='user-img' />
          <span className='user-name'>{user?.userName ?? 'This user has been deleted...(⊙_⊙;)'}</span>        
          <img className='user-status' src={isOnline===true ? onlineStatusIco : isOnline===false ? offlineStatusIco : !isOnline ? '': null} alt="online icon" />
      </Link>
    )
  }
  
export default User