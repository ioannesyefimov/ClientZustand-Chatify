import React, { useEffect, useState } from "react"
import { sendIco } from "../../assets"
import Button from "../Button/Button"
import { createDate } from "../utils"
import { KeyedMutator } from "swr"
import { useAuthStore, useChatStore } from "../../ZustandStore"
import { handleSubmitMessage } from "../../helpers/messagesMutations"
interface PropsType  {
  placeholder?: string
  name?: string
  data:any
  mutate:KeyedMutator<any>
}
const SubmitInput = ({data, name,placeholder,mutate}:PropsType) => {
    const [message,setMessage] = useState('')
  const currentChannel= useChatStore(s=>s.currentChannel)
  // const setCurrentChannel= useChatStore(s=>s.setCurrentChannel)
    let onKeyDown=(e:KeyboardEvent) => {
      if(e.key==='Enter'){
        console.log(`value:`, message);
        console.log(`currentChannel:`, currentChannel);
        handleSubmitMessage(message,currentChannel!,user,setMessage)
        // handleClick({e,value,setValue,propsValue,setPropsValue})
      }
      
        }
    useEffect(
      ()=>{
        
       window.addEventListener('keydown',onKeyDown);                                                       
          return ()=> window.removeEventListener('keydown', onKeyDown)
      },[message]
    )
      const user=useAuthStore(s=>s.user)
    // const handleSubmit = async()=>{
    //   try {
    //     console.log(`data:`,data)
    //     console.log(`sending2`)

    //     if(!value)return 

    //     channelSocket.emit('send_message',{from:user._id, message:value,channel_id: propsValue?._id,user,room:propsValue?._id})
    //     mutate()
    //   } catch (error) {
    //     console.error(error)
    //   } finally{
    //     setValue('')
    //   }
    // }
  
    return (
      <div className={`inner-wrapper ${name}`}>
        <div className='form-wrapper'>
            <input onChange={(e)=>setMessage(e?.target?.value)} value={message} placeholder={placeholder}  name={name} id={name} aria-label={`${name} `} />
        </div>
        <Button type='button' onClick={async()=>{
          if(!Array.isArray(data)) return console.log(`data is not array`,data)
          let msg = {
            message,
            createdAt: createDate(),
            channelAt: currentChannel,
            // _id:crypto.randomUUID(),
            user
          }
          mutate(handleSubmitMessage(message!,currentChannel!,user!,setMessage),{
            optimisticData: [...data,msg],
            revalidate:true,
            rollbackOnError: true,
          })
          }} img={sendIco} name='submit-btn' text={''} />
    </div>
    
    )
  }
    
    
  
  export default SubmitInput