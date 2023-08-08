import React, {  useCallback, useEffect, useMemo, useRef, useState} from "react"
import useSWR from 'swr'
import { APIFetch, Errors } from "../../components/utils"
import SocketStore from "../../components/SocketStore"
import { ChannelType, RoleType, SocketResponse, UserType } from "../../components/types"
import { useAuthStore, useChatStore } from "../../ZustandStore"
import { useLocation } from "react-router-dom"
import { Socket } from "socket.io-client"
import useMessagesContext from "../useMessagesContext/useMessagesContext"
const {certOptions,io,serverUrl} = SocketStore()
export const channelSocket = io(`${serverUrl}/currentChannel`,{
  pfx:certOptions.pfx,passphrase:certOptions.passphrase,reconnection:true,reconnectionDelayMax:5000,reconnectionAttempts:Infinity});

export default function useCurrentChannel(channel_id:string,user:UserType) {
    const currentChannel=useChatStore(state=>state.currentChannel)
    const setCurrentChannel=useChatStore(state=>state.setCurrentChannel)  
    const addCurrentChannelMessage = useChatStore(s=>s.addCurrentChannelMessage)
    const currentChannelMessages = useChatStore(s=>s.currentChannel?.messages)
    const deleteCurrentChannelMessage = useChatStore(s=>s.deleteCurrentChannelMessage)
    const setOnlineUsers = useAuthStore(s=>s.setOnlineUsers)
    const setServerResponse = useAuthStore(s=>s.setServerResponse)
    const setLoading = useAuthStore(s=>s.setLoading)
    // const scrollToRef=useMessagesContext()?.scrollToRef
    const scrollToRef=useChatStore(s=>s.scrollToRef)
    const socketRef = useRef<Socket>()
    const messagesCountRef = useChatStore(s=>s.messagesCountRef)
    const location = useLocation()
    const [unReadMessages,setUnReadMessages]=useState(0)
    // const [reload,setReload]=useState(false)
    const [isInView,setIsInView]=useState(false)
      const fetcher = useCallback(
        ()=>APIFetch({
                url:`${serverUrl}/api/channels/channel/${channel_id}?userEmail=${user?.email}`,method:'GET'
            })
        ,[channel_id,user?.email]
    )
    // const {data:channel,error,isLoading}=useSWR(()=>channel_id ? `/api/channels/channel/${channel_id}` : null,fetcher ,{refreshInterval:1000}   )
    const {data:channel,error,isLoading}=useSWR(()=>channel_id ? `/api/channels/channel/${channel_id}` : null,fetcher)
    
    useEffect(
      ()=>{
        console.log(`is in view:`,isInView);
        if(isInView){
          messagesCountRef.current!.innerHTML = ''
          setUnReadMessages(0)
        }
      },[isInView]
    )
  
    useEffect(() => {
      const options = {
        root: null,
        rootMargin: '0px',
        threshold:0.1 // Adjust this value to change when the div is considered "in view"
      };
    
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
          console.log(`entry`,entry)
        });
      }, options);
    
      if (scrollToRef?.current) {
        observer.observe(scrollToRef?.current);
      }
    
      return () => {
        if (scrollToRef?.current) {
          observer.unobserve(scrollToRef?.current);
        }
      };
    }, [scrollToRef.current]);
    useEffect(
        ()=>{
            console.log(`data current channel:`,channel);
            console.log(`channelid`,channel_id   );
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
                console.log(`HAS admin permissions, ${hasAdminPermissions}`);
                current.hasAdminPermissions = hasAdminPermissions
                socketRef.current = channelSocket
                setCurrentChannel(current)
                channelSocket.connect()

                channelSocket.emit('join_channel',{room:current?._id,user:user})
                channelSocket.emit('get_online_users',{})
                setLoading(false)      
                
                return ()=>{
                  channelSocket.disconnect()
                  let USER = user?.email ? user.email : channel?.data?.user?.email
                  channelSocket?.emit('leave_channel',{user:USER,id:current?._id})}
          }

            
        },[channel]
    )

    useEffect(
      ()=>{
        console.log(`unread messages:`,unReadMessages);
        if(!messagesCountRef.current) return console.log(`messagesCountRef is ${messagesCountRef.current}`)
        if(unReadMessages > 0){
          messagesCountRef.current.innerHTML = `${unReadMessages}`
        }
      },[unReadMessages]
    )
    useEffect(
        ()=>{
            let onMessage = (data:SocketResponse)=>{
              if(!data?.success) setServerResponse(data?.err)
              console.log(`received message`, data);
              if(!isInView){
                console.log(`scroll ref`,scrollToRef?.current);
                setUnReadMessages((p)=>p + 1)
                // scrollToRef?.current
                console.log(`getting message and isInView is ${isInView}`);
              }
              if(data?.data?.messages){
                addCurrentChannelMessage(data?.data?.message)
                // scrollToRef?.current?.scrollIntoView({behavior:'smooth'}) 
              }
              setLoading(false)
              console.log(`getting message and isInView is ${isInView}`);
              if(data.data?.from === user._id){
                scrollToRef.current?.scrollIntoView({behavior:'smooth'})
                console.log(`scrolling into view:${data.data.from}`);

              }
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
            let onIsInCall = (data:boolean)=>{
              if(currentChannel?._id){
                currentChannel!.isInCall = data
                setCurrentChannel(currentChannel)
              }
              console.log(`currentChannel:`,currentChannel);
              console.log(`is in call triggered:`,data);
              
            }
            channelSocket.on('isInCall',onIsInCall)
            channelSocket.on('get_online_users',onOnlineUsers)
            channelSocket.on('disconnect',onDisconnect)
            channelSocket.on('join_channel',onJoinChannel)
            // channelSocket.on('connect',onConnect)
            channelSocket.on('receive_message',onMessage)
            channelSocket.on('delete_message',onDeleteMessage)
            return ()=>{
              channelSocket.off('disconnect',onDisconnect)
              channelSocket.off('delete_message',onDeleteMessage);
              channelSocket.off('receive_message',onMessage);
              // channelSocket.off('connect',onConnect);
              // if(currentChannel?._id){
              //   socketRef.current?.emit('leave_channel',{user:user.email,id:currentChannel?._id})
              //   console.log(`LEAVING CHANNEL: ${currentChannel?._id}`);
              //     setCurrentChannel(null)
              // }
          }
         
        },[currentChannel?._id,isInView]
    )


    const value = useMemo(
      ()=>{
        return {
        currentChannel,currentChannelMessages,setCurrentChannel,addCurrentChannelMessage,deleteCurrentChannelMessage,isLoading,unReadMessages
      }},[currentChannel,currentChannelMessages]
    )
    // return {currentChannel,currentChannelMessages,setCurrentChannel,addCurrentChannelMessage,deleteCurrentChannelMessage,isLoading,unReadMessages}
    return value
}