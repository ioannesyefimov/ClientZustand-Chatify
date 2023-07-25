import React from 'react'
import Message from '../Message/Message';
import { MessageType, UserType } from '../../types';
import Button from '../../Button/Button';
type PropsType ={
    
    messages?: MessageType[]
    date?: string
    user?:UserType
    scrollToRef?:  React.ForwardedRef<HTMLDivElement |undefined>
}
const Messages = ({messages,user,scrollToRef,date}:PropsType) => {
  
    let content = (
      <>
        <div className="messages-wrapper" id='messagesWrapper' >
          <div className='date-divider'>
            <span >{date}</span>
          </div> 
          {
            messages?.map((message:MessageType| any,i:number|string)=>{
              return (
                <Message channel_id={message.channelAt[0]?._id} ref={scrollToRef} _id={message?._id!} key={message?._id}  message={message?.message} createdAt={message?.createdAt} messageUser={message?.user}  />
                )
              })
            }
        </div>
      </>
    )
  return content
}

export default Messages