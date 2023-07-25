import { useAuthCookies, useResponseContext } from '..'
import { APIFetch, Errors, sleep, throwErr } from '../../components/utils'
import { useCallback, useEffect, useMemo } from 'react'
import { UserType } from '../../components/types'
import useSWR from 'swr'
import { useAuthStore, useChatStore } from '../../ZustandStore'

const useFetchChannels = (user:UserType) => {
    // const serverUrl = useServerUrl()
    const setChannels=useChatStore((state)=>state.setChannels)
    const serverUrl = useAuthStore(state=>state.serverUrl)
    const {cookies,setCookie} = useAuthCookies()
    // const setLoading=useSetLoading()
    // const setChannels = useSetChannels()
    let fetcher = ()=>APIFetch({url: `${serverUrl}/channels/userChannels?userEmail=${user?.email ? user.email : cookies.user.email}`, method:"GET",headers: {"Content-Type":"application/json"}})

    const {data:channels,error,isLoading} = useSWR('/api/channels/userChannels',fetcher )
    
    useEffect(
        ()=>{
            console.log(`fetching channels`,channels);
            
            if(channels){
                setChannels(channels?.data?.channels)
            }else {
                setChannels([])
            }
        },[channels]
    )
    const fetchChannels = useCallback(
    async(user:UserType,signal?:AbortSignal)=>{
        try {
            if(!user?.email ) {
                return console.log(`USER IS UNDEFINED`)
            } 
            let response = await APIFetch({signal,url: `${serverUrl}/channels/userChannels?userEmail=${user?.email ? user.email : cookies.user.email}`, method:"GET",headers: {"Content-Type":"application/json"}})
            console.log(`CHANNELS RESPONSE:`, response)
            if(!response?.success){
                setChannels([])
                throwErr(response?.err)
            }
            let channels = response?.data?.channels
            console.log(`channels`, channels);
            setChannels(channels)
            setCookie('channels', channels, {maxAge: 2000,path:'/'})
            setCookie('user',response.data.user,{path:'/',maxAge:2000})
        } catch (error) {
        console.error(error)
        } finally{
        }
    },[user])
    return {
        channels:channels?.data?.channels,error,isLoading,fetchChannels
    }
}

export default  useFetchChannels