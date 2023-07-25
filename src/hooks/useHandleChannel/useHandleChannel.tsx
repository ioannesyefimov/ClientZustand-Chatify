import { Dispatch, MutableRefObject, SetStateAction } from 'react'
import { APIFetch, Errors, throwErr } from '../../components/utils';
import {  useResponseContext, useAuthCookies} from '..';
import { ChannelType, ResponseType, UserType } from '../../components/types';
import { Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useChatStore } from '../../ZustandStore';

const useHandleChannel = (setCurrent?:Dispatch<SetStateAction<any>> | undefined) => {
    const {setServerResponse}=useResponseContext()
    const setLoading = useAuthStore(s=>s.setLoading)
    const serverUrl = useAuthStore(s=>s.serverUrl)
    const navigate = useNavigate()
    const leaveChannel =useChatStore(s=>s.leaveChannel) 
    // const setChannels =useChatStore(s=>s.setChannels) 
    const joinChannel =useChatStore(s=>s.joinChannel) 
    // const {setCookie,cookies} =useAuthCookies() 


    const handleLeaveChannel = async(id:string,user:UserType)=>{
        try {
          if(!id) return
          console.log(`ID:${id}`);
          console.log(`userEmail:${user.email}`);
          setLoading(true)
          let response = await APIFetch({url:`${serverUrl}/channels/leave`,method:'PUT',body:{
            userEmail:user.email,channel_id:id
          },setError:setServerResponse})
          if(!response.success){
            throwErr(response.err)
          }
          // let newchannels = [...cookies.channels, cookies.channels.filter(channel=>channel._id !== id)]
          leaveChannel(response?.data?.channel?._id)
          // setChannels(response?.data?.channels)
          // setCookie('channels',response.data.channels,{path:'/',maxAge:2000})

          
        } catch (error) {
          setServerResponse(error)
        } finally{
          setLoading(false)

        }
      }
    const handleJoinChannel = async (id:string,user:UserType)=>{
          try {
              setLoading(true)
              let fields = {id}
              console.log(`FIELDS: `, fields)
              let response:ResponseType = await APIFetch({url:`${serverUrl}/channels/join`, body:{channel_id:id,userEmail:user.email},method:'POST', setError:setServerResponse})
              if(!response.success) throwErr(response?.err)
              console.log(`RESPONSE : `, response)
              // setChannels(prev=>({...prev, ...response?.data?.channel }))
              // setCookie('user',newChannels,{path:'/',maxAge:2000})
              // let newChannels = [...user.channels, response.data.channel]
              joinChannel(response?.data?.channel)
              // setCookie('channels',newChannels,{path:'/',maxAge:2000})
              navigate(`/chat/${response?.data?.channel?._id}`)
          } catch (error) {
              console.log(`ERROR:`,error)
              setServerResponse(error)
          }finally{
              setLoading(false)
          }
      }

       
    type HandleCurrentChannelProps ={
      setter: Dispatch<SetStateAction<ChannelType| null>>
      name:string
      socket:Socket<any,any>
      scrollToRef?: MutableRefObject<HTMLDivElement | undefined>  
      user:UserType
      signal?:AbortSignal
    } 

    return {handleLeaveChannel,handleJoinChannel,}
}

export default useHandleChannel