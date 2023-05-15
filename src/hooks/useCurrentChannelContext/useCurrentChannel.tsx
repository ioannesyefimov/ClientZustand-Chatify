import {  useCallback, useEffect} from "react"
import useSWR from 'swr'
import { APIFetch, Errors } from "../../components/utils"
import SocketStore from "../../components/SocketStore"
import { ChannelType, RoleType, UserType } from "../../components/types"
import { channelSocket } from "../../components/DashBoard/CurrentChannel/CurrentChannel"
import { useAuthStore, useChatStore } from "../../ZustandStore"
import { useLocation } from "react-router-dom"
 
 const serverUrl = SocketStore().serverUrl

export default function useCurrentChannel(channel_id:string,user:UserType) {
    const currentChannel=useChatStore(state=>state.currentChannel)
    const setCurrentChannel=useChatStore(state=>state.setCurrentChannel)  
    const addCurrentChannelMessage = useChatStore(s=>s.addCurrentChannelMessage)
    const currentChannelMessages = useChatStore(s=>s.currentChannel?.messages)
  const deleteCurrentChannelMessage = useChatStore(s=>s.deleteCurrentChannelMessage)

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
            if(isLoading){
                setLoading(true)
            }
            console.log(`channelid`,channel_id);
            
            if(location.pathname ==='/chat') return setCurrentChannel(null)
            if (channel?.err){
                console.error(`error`,error);
                setServerResponse(channel?.err)
            }else
            if(channel?.data){
                console.log(`CURRENT CHANNEL RESPONSE `, channel);
                let current:ChannelType = channel?.data?.channel
                    let hasAdminPermissions = current?.members?.find((member:UserType)=>member._id===channel?.data?.user?._id)
                    ?.roles?.some((role:RoleType)=>role.permissions.description === 'everything')
                    console.log(`HAS admin permissionsm, ${hasAdminPermissions}`);
                    current.hasAdminPermissions = hasAdminPermissions

                    console.log(`Current channel: `, currentChannel);
                    
                    setCurrentChannel(current)
                    channelSocket.emit('join_channel',{room:current?._id})
                    setLoading(false)
                
            }
        },[channel,user?.email,location.pathname,error]
    )

    

    return {currentChannel,currentChannelMessages,setCurrentChannel,addCurrentChannelMessage,deleteCurrentChannelMessage,isLoading}
}