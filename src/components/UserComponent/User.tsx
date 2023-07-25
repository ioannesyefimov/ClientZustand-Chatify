import React from 'react'
import { offlineStatusIco, onlineStatusIco, userIco } from '../../assets'
import { UserType } from '../types'
import { Link } from 'react-router-dom'
import './UserComponent.scss'
import { useAuthStore } from '../../ZustandStore'
type PropsType = {
  user:UserType
  location?: 'profile' | 'bar' | ''
}

const User = ({user,className,location}:{ user?:UserType,className?:string,location:string}) => {
  const onlineUsers=useAuthStore(s=>s.onlineUsers)

  let isOnline = Object.keys(onlineUsers).some((onlineUser)=>onlineUsers[onlineUser]===user?._id)
  let statusImg = isOnline===true ? onlineStatusIco : isOnline===false ? offlineStatusIco :''
  return (
      <Link to={location==='profile' || location==='bar' ? '/profile' : `/user/${user?._id  ?? 'deleted'}`} className={className ?? 'user'} >
          <img src={user?.picture ? user.picture : userIco} alt="avatar" className='user-img' />
          <div className="flex ga-1">
            <span className='user-name'>{user?.userName ?? 'This user has been deleted...(⊙_⊙;)'}</span>        
            {
              location!=='bar' && (
                <img className='user-status' src={statusImg} alt="online icon" />
              )
            }
          </div>
      </Link>
    )
  }
  
export default User