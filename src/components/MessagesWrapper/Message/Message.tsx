import React, { ForwardedRef } from 'react'
import './Message.scss'
import { createDate } from '../../utils'
import Button from '../../Button/Button'
import { trashIco, userIco } from '../../../assets'
import { ChannelType, UserType } from '../../types'
import { Link, useNavigate } from 'react-router-dom'
import { useCurrentChannelMessages, useMessagesContext } from '../../../hooks'
import { useAuthStore, useChatStore } from '../../../ZustandStore'
import User from '../../UserComponent/User'
import { handleDeleteMessage } from '../../../helpers/messagesMutations'
import { KeyedMutator } from 'swr'
type PropsType = {
    createdAt:{day:string,
      time:string
      timeStamp:'string'
    }
    message:string
    messageUser?:UserType
    key:any
    _id?: string
    channel:ChannelType
    handleDeleteMsg:(_id:string)=>any
  }

type DisplayDateProps ={
    day:string,
    time:string
    timeStamp:'string'
}
const displayDate = (date:DisplayDateProps) => {
  let today =createDate().date()
  let messageDate =new Date(date?.timeStamp)
  let yesterday = new Date();yesterday.setDate(today.getDate()-1)
  if(messageDate.toLocaleDateString() == today.toLocaleDateString()){
    return `today at ${date.time}`
  }else if (messageDate.toLocaleDateString() == yesterday.toLocaleDateString()) {
    return `yesterday at ${date.time}`
  }else {
    return `${date.day} at ${date.time}`
  }
}



const Message = React.forwardRef(({handleDeleteMsg,createdAt,message,messageUser,_id,channel}:PropsType,ref:ForwardedRef<HTMLDivElement | undefined>) => {
  const {scrollToRef}=useMessagesContext()!
  const deleteCurrentChannelMessage = useChatStore(s=>s.deleteCurrentChannelMessage)
  const user = useAuthStore(s=>s.user)
  const navigate = useNavigate()
  const serverUrl = useAuthStore(s=>s.serverUrl)
  const currentChannelMessages =useChatStore(s=>s.currentChannelMessages)
  let sentBy = user?._id === messageUser?._id ? 'sent' : 'received'  
  
  let visitProfileFunc = sentBy ==='received' ? (`/user/${messageUser?._id ?? 'deleted'}` )
  : ('/profile')

return (
    <div  className={`message ${sentBy}`}>
        <Link to={visitProfileFunc} className='show-member-button'>
            <img className='message-logo' src={messageUser?.picture ?? userIco} alt="profile-logo" />
        </Link> 
         {/* <button onClick={visitProfileFunc} className='show-member-button'> */}
          {/* </button> */}
      
       <div className="message-wrapper">
         <span className="message-name">{messageUser?.userName ?? '404'}</span>
         <span className="message-date">{displayDate(createdAt)}</span>
       </div>
       <p className="message-text">{message}</p>
       {sentBy==='sent'? (
        //  <Button img={trashIco} name='message-delete' type="button" onClick={()=>handleDeleteMessage(_id!,channel_id)} />
          <button onClick={()=>handleDeleteMsg(_id!)} className='message-delete'>
            <img src={trashIco} />
          </button>
       ): (
        null
       )}
    <div className="scrolledToDiv" ref={scrollToRef as any}></div>
     </div>
  )
})

export default Message