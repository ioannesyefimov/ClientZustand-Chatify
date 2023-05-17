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
import ChannelsSettings from '../ChannelsBar/ChannelsSettings/ChannelsSettings'

const {certOptions,io,serverUrl} = SocketStore()
export const channelSocket = io(`${serverUrl}/currentChannel`,{
  pfx:certOptions.pfx,passphrase:certOptions.passphrase,reconnection:true,reconnectionDelayMax:5000,reconnectionAttempts:Infinity, autoConnect:false});

const CurrentChannel = () => {
  const setLoading = useAuthStore(state=>state.setLoading)
  const user = useAuthStore(state=>state.user)
  const {setServerResponse} = useResponseContext()
  const {channel_id}=useParams()
  const {currentChannel,setCurrentChannel,addCurrentChannelMessage,currentChannelMessages,deleteCurrentChannelMessage,isLoading}=useCurrentChannel(channel_id ?? '',user)

 

  let channelContent =
  (
    <>
     
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
