import React from 'react'
import Message from '../Message/Message';
import { MessageType, UserType } from '../../types';
import Button from '../../Button/Button';
import { KeyedMutator } from 'swr';
type PropsType ={
    
    messages?: MessageType[]
    date?: string
    user?:UserType
    handleDeleteMsg:(_id:string)=>any
    scrollToRef?:  React.ForwardedRef<HTMLDivElement |undefined>
}
const Messages = ({handleDeleteMsg,messages,user,scrollToRef,date}:PropsType) => {
  
    let content = (
      <>
        <div className="messages-wrapper" id='messagesWrapper' >
          <div className='date-divider'>
            <span >{date}</span>
          </div> 
          {
            messages?.map((message:MessageType| any,i:number|string)=>{
              return (
                <Message handleDeleteMsg={handleDeleteMsg} channel={message.channelAt[0]} ref={scrollToRef} _id={message?._id!} key={message?._id}  message={message?.message} createdAt={message?.createdAt} messageUser={message?.user}  />
                )
              })
            }
        </div>
      </>
    )
  return content
}

export default Messages