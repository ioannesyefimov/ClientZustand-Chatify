import useSWR from 'swr'
import { APIFetch } from '../../components/utils'
import { useAuthStore } from '../../ZustandStore'
import { useEffect } from 'react'
import { url } from 'inspector'
import { MessagesRoute, MessagesFetcer } from '../../api/swr'

export default function useCurrentChannelMessages(channelId:string,userEmail:string,serverUrl:string) {
    
    const {data:currentChannelMessages,error, mutate} = useSWR(MessagesRoute,()=>MessagesFetcer(channelId,userEmail,serverUrl))

    useEffect(
        ()=>{
          console.log(`error:`,error)
          console.log(`currentChannel messages response:`,currentChannelMessages)
        },[currentChannelMessages,error]
       )
    return {currentChannelMessages:currentChannelMessages?.data,mutate,error}
}