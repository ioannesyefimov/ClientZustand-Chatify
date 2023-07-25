import { useParams } from 'react-router-dom'
import { useCurrentChannel, useResponseContext } from '../../../hooks'
import './CurrentChannel.scss'
import MessagesProvider from '../../MessagesWrapper/Context/MessagesContext'
import MessagesWrapper from '../../MessagesWrapper/MessagesWrapper'
import { useAuthStore } from '../../../ZustandStore'
import ChannelNavBar from '../ChannelNavBar/ChannelNavBar'
import MultiplePeerComponent from '../../MultiplePeerComponent/MultiplePeerComponent'


const CurrentChannel = () => {
  const setLoading = useAuthStore(state=>state.setLoading)
  const user = useAuthStore(state=>state.user)
  const {setServerResponse} = useResponseContext()
  const {channel_id}=useParams()
  const {currentChannel,setCurrentChannel,addCurrentChannelMessage,currentChannelMessages,deleteCurrentChannelMessage,isLoading}=useCurrentChannel(channel_id ?? '',user)

  if(!currentChannel?._id) return <h2 className='channel-title dashboard'>Choose your channel</h2>

  let channelContent =
  (
    <>
      <ChannelNavBar channel={currentChannel!}/>
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
        {channelContent}
      </div>
  )
}

export default CurrentChannel
