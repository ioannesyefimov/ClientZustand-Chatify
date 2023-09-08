import { Dispatch, SetStateAction } from "react"
import { ChannelType, MessageType, UserType } from "../components/types"
import { createDate, sortMessagesByDate } from "../components/utils"
import { channelSocket } from "../hooks/useCurrentChannelContext/useCurrentChannel"
export const messagesUrlEndPoint = '/messages'

export const handleSubmitMessage=async(message:string,channel:ChannelType,user:UserType,setValue:Dispatch<SetStateAction<any>>) =>{
    try {
      if(!message)return console.log(`message is missing`)
      console.log(`SUBMITTING MESSAGE`)
      console.log(`channelSocket`,channelSocket)
      if(!channelSocket.connected){
         channelSocket.connect()
      }
    
      channelSocket.emit('send_message',{from:user._id, message,channel_id: channel._id, user,room:channel._id})
    } catch (error) {
      console.error(`error:`, error)
    } finally{
      setValue('')
    }
 }

 export const handleDeleteMessage = async(message_id:string,channel:ChannelType,user_email:string) => {
   try {
     if(!message_id) return console.error(`missing id`);
     channelSocket.emit('delete_message',{channel_id:channel._id  ,message_id,userEmail:user_email,})
     
  } catch (error) {
    console.log(`error`,error)
  } finally{
  }
}

export const addMessageOptions = async (newMessage:MessageType,messages:MessageType[])=>{
    let sorted = await sortMessagesByDate([...messages,newMessage])
    console.log(`sorted:`,sorted)
    return {
        optimisticData:sorted,
        rollbackError:true,
        populateCache:true,
        revalidatre:false
    }
}