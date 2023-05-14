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
    const setLoading = useAuthStore(state=>state.setLoading)
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
            }else if (error?.name === Errors.CHANNELS_NOT_FOUND){
                setChannels([])
            }
        },[channels]
    )
    const fetchChannels = useCallback(
    async(user:UserType,signal?:AbortSignal)=>{
        setLoading(true)
        try {
            if(!user?.email ) {
                return console.log(`USER IS UNDEFINED`)
            } 
            let response = await APIFetch({signal,url: `${serverUrl}/channels/userChannels?userEmail=${user?.email ? user.email : cookies.user.email}`, method:"GET",headers: {"Content-Type":"application/json"}})
            console.log(`CHANNELS RESPONSE:`, response)
            if(!response?.success){
                throwErr(response?.err)
            }
            let channels = response?.data?.channels
            console.log(`channels`, channels);
            
            setCookie('channels', channels, {maxAge: 2000,path:'/'})
            setCookie('user',response.data.user,{path:'/',maxAge:2000})
        } catch (error) {
        console.error(error)
        } finally{
            setLoading(false)
        }
    },[user])
    let value =useMemo(
        ()=>({channels:channels?.data?.channels,error,isLoading,fetchChannels}),[channels?.data]) 
    return value

}

export default  useFetchChannels