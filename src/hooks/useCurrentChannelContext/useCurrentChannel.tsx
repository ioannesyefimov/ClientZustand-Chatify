import {  useCallback, useEffect, useMemo} from "react"
import useSWR from 'swr'
import { APIFetch, Errors } from "../../components/utils"
import SocketStore from "../../components/SocketStore"
import { ChannelType, RoleType, SocketResponse, UserType } from "../../components/types"
import { useAuthStore, useChatStore } from "../../ZustandStore"
import { useLocation } from "react-router-dom"
const {certOptions,io,serverUrl} = SocketStore()
 export const channelSocket = io(`${serverUrl}/currentChannel`,{
  pfx:certOptions.pfx,passphrase:certOptions.passphrase,reconnection:true,reconnectionDelayMax:5000,reconnectionAttempts:Infinity, autoConnect:false});


export default function useCurrentChannel(channel_id:string,user:UserType) {
    const currentChannel=useChatStore(state=>state.currentChannel)
    const setCurrentChannel=useChatStore(state=>state.setCurrentChannel)  
    const addCurrentChannelMessage = useChatStore(s=>s.addCurrentChannelMessage)
    const currentChannelMessages = useChatStore(s=>s.currentChannel?.messages)
    const deleteCurrentChannelMessage = useChatStore(s=>s.deleteCurrentChannelMessage)
    const setOnlineUsers = useAuthStore(s=>s.setOnlineUsers)
    const setServerResponse = useAuthStore(s=>s.setServerResponse)
    const setLoading = useAuthStore(s=>s.setLoading)
    
    const location = useLocation()
      const fetcher = useCallback(
        ()=>APIFetch({
                url:`${serverUrl}/api/channels/channel/${channel_id}?userEmail=${user?.email}`,method:'GET'
            })
        ,[channel_id,user?.email]
    )
    const {data:channel,error,isLoading}=useSWR(()=>channel_id ? `/api/channels/channel/${channel_id}` : null,fetcher    )
    
  
    useEffect(
        ()=>{
            console.log(`channelid`,channel_id);
            if(location.pathname ==='/chat') {
                setCurrentChannel(null)
                return
            }
            if (channel?.err){
                console.error(`error`,error);
                setServerResponse(channel?.err)
            }else
            if(channel?.data){
                console.log(`CURRENT CHANNEL RESPONSE `, channel);
                let current:ChannelType = channel?.data?.channel
                let hasAdminPermissions = current?.members?.find((member:UserType)=>member?.member?._id===channel?.data?.user?._id)
                ?.roles?.some((role:RoleType)=>role.permissions.description === 'everything')
                console.log(`HAS admin permissionsm, ${hasAdminPermissions}`);
                current.hasAdminPermissions = hasAdminPermissions

                console.log(`Current channel: `, currentChannel);
                
                setCurrentChannel(current)
                channelSocket.connect()

                channelSocket.emit('join_channel',{room:current?._id,user:user})
                channelSocket.emit('get_online_users',{})
                setLoading(false)      
                
                return ()=>{
                    let USER = user?.email ? user.email : channel?.data?.user?.email
                    channelSocket?.emit('leave_channel',{user:USER,id:current?._id})}
            }

        },[channel?.data,location.pathname]
    )

    useEffect(
        ()=>{
            let onConnect = ()=>{
              console.log(`CONNECTED BY ID ${channelSocket.id}`)
            }
            let onMessage = (data:SocketResponse)=>{
              if(!data?.success) setServerResponse(data?.err)
              console.log(`received message`, data);
              
              if(data?.data?.messages){
                addCurrentChannelMessage(data?.data?.message)
                // scrollToRef?.current?.scrollIntoView({behavior:'smooth'}) 
              }
              setLoading(false)
            }
            let onOnlineUsers = (data:SocketResponse)=>{
              setOnlineUsers(data?.online)
            }
            let onDeleteMessage = (data:SocketResponse)=>{
              if(!data?.success) setServerResponse(data?.err)
              console.log(`DELETING  MESSAGE RESPONSE`,data);
              if(data?.success){
                console.log(`SUCCESS DELETE`, data);
                deleteCurrentChannelMessage(data?.data?.message?._id)
              } else {
                setServerResponse(data?.err)
              }
              setLoading(false)
      
            }
            let onDisconnect = ()=>{
              console.log(`${user?._id} disconnected from server`)
            }
            let onJoinChannel=(data:SocketResponse)=>{
              if(!data?.success) setServerResponse(data?.err)
              console.log(`JOINED CHANNEL ${data.data.room}`);
            }
            channelSocket.on('get_online_users',onOnlineUsers)
            channelSocket.on('disconnect',onDisconnect)
            channelSocket.on('connect',onConnect)
            channelSocket.on('receive_message',onMessage)
            channelSocket.on('delete_message',onDeleteMessage)
            channelSocket.on('join_channel',onJoinChannel)
            return ()=>{
              channelSocket.off('delete_message',onDeleteMessage);
              channelSocket.off('receive_message',onMessage);
              channelSocket.off('connect',onConnect);
              channelSocket.off('disconnect',onDisconnect)
              channelSocket.disconnect()
              // channelSocket.off('get_channel',onGetChannel);
              if(currentChannel?._id){
                channelSocket.emit('leave_channel',{user:user.email,id:currentChannel?._id})
                console.log(`LEAVING CHANNEL: ${currentChannel?._id}`);
                  setCurrentChannel(null)
              }
          }
         
        },[]
      )
    
      const value = useMemo(()=>{
        currentChannel
      },[currentChannel,currentChannelMessages,])
    

    return {currentChannel,currentChannelMessages,setCurrentChannel,addCurrentChannelMessage,deleteCurrentChannelMessage,isLoading}
}