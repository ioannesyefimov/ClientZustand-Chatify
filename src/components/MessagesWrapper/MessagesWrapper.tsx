import  { LegacyRef, RefObject, useEffect } from 'react'
import { sortMessagesByDate } from '../utils'
import { ChannelType, MessageType } from '../types'
import Messages from './Messages/Messages'
import { useCurrentChannelMessages } from '../../hooks'
import SubmitInput from '../SubmitMessageInput/SubmitIMessageInput'
import './MessagesWrapper.scss'
import { useAuthStore, useChatStore } from '../../ZustandStore'
import { downArrowIco } from '../../assets'
import Button from '../Button/Button'
import { handleDeleteMessage} from '../../helpers/messagesMutations'
type PropsType ={
    currentChannel: ChannelType | null
    // currentChannelMessages: MessageType[] | null
    setCurrentChannel: (channel:ChannelType)=>void
}


export default function MessagesWrapper({currentChannel,setCurrentChannel}:PropsType) {
  //  const {
  //   handleSubmitMessage
  // }=useMessagesContext()!

  const serverUrl=useAuthStore(s=>s.serverUrl)
  const user=useAuthStore(s=>s.user)
  const {mutate,error}=useCurrentChannelMessages(currentChannel?._id!,user.email,serverUrl)
  const currentChannelMessages = useChatStore(s=>s.currentChannelMessages)
  const sortedMessages = useChatStore(s=>s.sortedMessages)
  const setSortedMessages = useChatStore(s=>s.setSortedMessages)
  const scrollToRef = useChatStore(s=>s.scrollToRef)
  const messagesCountRef = useChatStore(s=>s.messagesCountRef)
   let initMessages = async()=>{
    let messages=currentChannelMessages ?? currentChannel?.messages ?? []
    console.log(`messages:`,messages);
    

 
    if(!messages?.length) return
    let sorted = sortMessagesByDate(messages)
    if(sorted?.fullMessageArray?.length){
      setSortedMessages(sorted.fullMessageArray)
    }
    console.log(`sorted.fullMessageArray`,sorted.fullMessageArray);
   }
   const handleDeleteMsg = async(_id:string)=>{
    console.log(`deleting msg:`,_id);
    
    let filtered=currentChannelMessages?.filter(msg=>msg._id!== _id)
    console.log(`filtered:`,filtered);

    mutate(()=>handleDeleteMessage(_id,currentChannel!,user._id!),{
      optimisticData:[filtered],
      revalidate:true,
      rollbackOnError:true,
      populateCache:true
    })
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
                    <Messages handleDeleteMsg={handleDeleteMsg} messages={messages as MessageType[]} date={date} key={key ?? 'newkey'}   />
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
      <SubmitInput data={currentChannelMessages} mutate={mutate} name="message-input" placeholder="Type a message here"  />
   
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
