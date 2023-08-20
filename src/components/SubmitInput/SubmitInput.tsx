import React, {SetStateAction, useEffect, useId, useState } from "react"
import { sendIco } from "../../assets"
import Button from "../Button/Button"
import {  ChannelType, SubmitInputType } from "../types"
import { HandleClickType } from "../MessagesWrapper/Context/MessagesContext"
import { createDate } from "../utils"
import { KeyedMutator } from "swr"
import { channelSocket } from "../../hooks/useCurrentChannelContext/useCurrentChannel"
import { useAuthStore } from "../../ZustandStore"
interface PropsType extends SubmitInputType {
  placeholder?: string
  name?: string
  data:any
  currentChannel:ChannelType
  mutate:KeyedMutator<any>
  handleClick: ({e,value,setValue,propsValue,setPropsValue}: HandleClickType)=>Promise<void>
}
const SubmitInput = ({data,propsValue,setPropsValue,handleClick, name,placeholder,mutate,currentChannel}:PropsType) => {
    const [value,setValue] = useState('')

    let onKeyDown=(e:KeyboardEvent) => {
      if(e.key==='Enter'){
        console.log(`value:`, value);
        console.log(`propsValue:`, propsValue);
        
        handleClick({e,value,setValue,propsValue,setPropsValue})
      }
      
        }
    useEffect(
      ()=>{
        
       window.addEventListener('keydown',onKeyDown);                                                       
          return ()=> window.removeEventListener('keydown', onKeyDown)
      },[value]
    )
      const user=useAuthStore(s=>s.user)
    const handleSubmit = async()=>{
      try {
        console.log(`data:`,data)
        console.log(`sending2`)

        if(!value)return 

        channelSocket.emit('send_message',{from:user._id, message:value,channel_id: propsValue?._id,user,room:propsValue?._id})
      } catch (error) {
        console.error(error)
      } finally{
        setValue('')
      }
    }
  
    return (
      <div className={`inner-wrapper ${name}`}>
        <div className='form-wrapper'>
            <input onChange={(e)=>setValue(e?.target?.value)} value={value} placeholder={placeholder}  name={name} id={name} aria-label={`${name} `} />
        </div>
        {/* <Button type='button' onClick={async(e)=>{
          try {
            console.log(`submitting message:`,value)
            const newMessage = {
              _id:Date.now(),
              message:value,
              createdAt:createDate(),
              channelAt:currentChannel
            }
            await mutate(handleClick({e,value,setValue,propsValue,setPropsValue}),
            {
              optimisticData:[...data,newMessage],
              rollbackOnError:true,
              populateCache:true,
              revalidate:false
            })
          } catch (error) {
            
          }
          }} img={sendIco} name='submit-btn' text={''} /> */}
        <button className='submit-btn' onClick={async()=>{
          try {
            let newMessage = {
              id:Date.now(),
              message:value,
              channelAt:propsValue,
              createdAt:createDate(),
              user:user,
            }
          console.log(`sending`)
            await handleSubmit()
            // await mutate({
            //   optimisticData:[...data,newMessage],
            //   rollbackOnError:true,
            //   populateCache: true,
            //   revalidate: false
            // })
            await mutate({
              ...data,newMessage
            })
          } catch (error) {
            
          }
        }}><img src={sendIco} /></button>
    </div>
    
    )
  }
    
    
  
  export default SubmitInput