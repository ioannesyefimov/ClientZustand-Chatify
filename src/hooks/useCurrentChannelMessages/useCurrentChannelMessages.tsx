import useSWR from 'swr'
import { APIFetch } from '../../components/utils'
import { useAuthStore } from '../../ZustandStore'
import { useEffect } from 'react'

async function getMessages(channelId:string,userEmail:string){
    const url = useAuthStore(s=>s.serverUrl)
    return APIFetch({url:`${url}/messages/getMessages?channel_id=${channelId}&userEmail=${userEmail}`,method:'GET',})

}
export default function useCurrentChannelMessages(channelId:string,userEmail:string) {

    const {data,error, mutate} = useSWR('/api/messages',()=>getMessages(channelId,userEmail))

    useEffect(
        ()=>{
            console.log(`USE CURRENT CHANNEL MESSAGES DATA`,data)
        },[data]
    )
    return {data,mutate}
}