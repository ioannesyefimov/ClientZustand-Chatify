import  { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useCurrentChannel, useResponseContext } from '../../../hooks'
import { SocketResponse } from '../../types'
import SocketStore from '../../SocketStore'
import './CurrentChannel.scss'
import MessagesProvider from '../../MessagesWrapper/Context/MessagesContext'
import MessagesWrapper from '../../MessagesWrapper/MessagesWrapper'
import { useAuthStore } from '../../../ZustandStore'
import { LoadingFallback } from '../../LoadingFallback/LoadingFallback'
import ChannelsSettings from '../ChannelsSettings/ChannelsSettings'

const {certOptions,io,serverUrl} = SocketStore()
export const channelSocket = io(`${serverUrl}/currentChannel`,{
  pfx:certOptions.pfx,passphrase:certOptions.passphrase,reconnection:true,reconnectionDelayMax:5000,reconnectionAttempts:Infinity});

const CurrentChannel = () => {
  const setLoading = useAuthStore(state=>state.setLoading)
  const user = useAuthStore(state=>state.user)
  const {setServerResponse} = useResponseContext()
  const {channel_id}=useParams()
  const {currentChannel,setCurrentChannel,addCurrentChannelMessage,currentChannelMessages,deleteCurrentChannelMessage,isLoading}=useCurrentChannel(channel_id ?? '',user)

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
        console.log(`Disconnected from server`)
      }
      let onJoinChannel=(data:SocketResponse)=>{
        if(!data?.success) setServerResponse(data?.err)
        console.log(`JOINED CHANNEL ${data.data.room}`);
      }
      // channelSocket.on('get_channel',onGetChannel)
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
        // channelSocket.off('get_channel',onGetChannel);
        if(currentChannel?._id){
          channelSocket.emit('leave_channel',{user:user.email,id:currentChannel?._id})
          console.log(`LEAVING CHANNEL: ${currentChannel?._id}`);
            setCurrentChannel(null)
        }
    }
     
    },[]
  )


  let channelContent =
  (
    <>
      {location.search.includes('?settings=show') && <ChannelsSettings/>}
    <div className='channel-title'>
      <h2 >{currentChannel?.channelName}</h2> 
    </div>
      <MessagesProvider>
        {isLoading ? 
          (<h2>Loading messages...</h2>) : 
          (<MessagesWrapper  currentChannelMessages={currentChannelMessages ?? []} setCurrentChannel={setCurrentChannel} currentChannel={currentChannel}/>)
        }
      </MessagesProvider>
    </>
    )
    return (
    
    <div className="main-wrapper">
      {
        currentChannel?._id ? (
          channelContent 
        ) : 
        (
          <h2 className='channel-title dashboard'>Choose your channel</h2>
          ) 
      }
    </div>
)
}

export default CurrentChannel
