import React, { LegacyRef, RefObject, SetStateAction, useEffect, useRef, useState } from 'react'
import { sleep, sortMessagesByDate } from '../utils'
import { ChannelType, MessageType } from '../types'
import Messages from './Messages/Messages'
import { useMessagesContext } from '../../hooks'
import SubmitInput from '../SubmitInput/SubmitInput'
import './MessagesWrapper.scss'
import { useChatStore } from '../../ZustandStore'
import { downArrowIco } from '../../assets'
import Button from '../Button/Button'
type PropsType ={
    currentChannel: ChannelType | null
    currentChannelMessages: MessageType[] | null
    setCurrentChannel: (channel:ChannelType)=>void
}


export default function MessagesWrapper({currentChannel,currentChannelMessages,setCurrentChannel}:PropsType) {
   const {
    sortedMessages
    ,setSortedMessages
    ,handleSubmitMessage
    // ,scrollToRef
  }=useMessagesContext()!
  const scrollToRef = useChatStore(s=>s.scrollToRef)
  const messagesCountRef = useChatStore(s=>s.messagesCountRef)
   let initMessages = async()=>{
    // await sleep(1000);
    let messages=currentChannel?.messages ?? []
    if(!messages?.length) return
    let sorted = sortMessagesByDate(messages)
    if(sorted?.fullMessageArray?.length){
      setSortedMessages(sorted.fullMessageArray)
    }
    console.log(`sorted.fullMessageArray`,sorted.fullMessageArray);
   }
 
   useEffect(
    ()=>{
      scrollToRef?.current?.scrollIntoView({behavior:'smooth'})  
    },[]
   )
  useEffect(
    ()=>{
        initMessages()  
      
    },[currentChannelMessages]
  )
  let messages=
    sortedMessages?.length ? (
      
      // loop through array of every message
        Object.keys(sortedMessages).map((arrays: any,i:number)=>{
          // then loop through every instance of array that is created on different day
          
            return Object?.keys(sortedMessages[arrays] as any).map((key:any)=>{
              let date =new Date(key)?.toDateString()  
              if(!arrays) return
              let messages:unknown = sortedMessages[arrays as keyof typeof sortedMessages]![key]
              // and return Messages with divider for day and time
              return(
                    <Messages messages={messages as MessageType[]} date={date} key={key ?? 'newkey'}   />
                )
                }) 
        }) 
        ): (
            <div>
              <h4>There is no any messages yet.</h4>
            </div>
          )
  let content = (
    <div className='messages-wrapper-outer'>
      <div className="wrapper">
        {messages}
      </div>
      <div className='scrool-ref'  ref={scrollToRef as RefObject<HTMLDivElement>}  >
    </div>
      <SubmitInput  handleClick={handleSubmitMessage} setPropsValue={setCurrentChannel} propsValue={currentChannel} name="message-input" placeholder="Type a message here" e={undefined} value= {undefined} setValue={function (value: any): void {
      throw new Error('Function not implemented.')
    } } />
   
    <Button onClick={()=>{
      scrollToRef.current?.scrollIntoView({behavior:'smooth'})
      console.log('scrooling into view:',scrollToRef.current)
    }} img={downArrowIco} name='into-view-div'>
      <div ref={messagesCountRef as LegacyRef<HTMLDivElement>}>
      </div>
    </Button>
    </div>
  )
  return content
}
