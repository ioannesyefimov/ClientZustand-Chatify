import React from 'react'
import { useParams } from 'react-router-dom'
import { useAuthStore } from '../../ZustandStore'
import { useResponseContext, useCurrentChannel, useWindowSize } from '../../hooks'
import Hamburger from '../HamburgerMenu/Hamburger'
import MessagesProvider from '../MessagesWrapper/Context/MessagesContext'
import MessagesWrapper from '../MessagesWrapper/MessagesWrapper'
import MultiplePeerComponent from './MultiplePeerComponent'

function ChannelCallWrapper() {
    const setLoading = useAuthStore(state=>state.setLoading)
    const user = useAuthStore(state=>state.user)
    const {setServerResponse} = useResponseContext()
    const {channel_id}=useParams()
    const {currentChannel,setCurrentChannel,addCurrentChannelMessage,currentChannelMessages,deleteCurrentChannelMessage,isLoading}=useCurrentChannel(channel_id!,user)
    const {width,height}=useWindowSize()
    const content = (
        <div className="video-chat-wrapper">
            <Hamburger type='messages' animation={{toggled:'appearFromRight',untoggled:'disappearToRight'}} isHamburger={width > 700 ? false : true}>
                <MessagesProvider>
                    <MessagesWrapper setCurrentChannel={setCurrentChannel} currentChannel={currentChannel} currentChannelMessages={currentChannel?.messages!}/>
                </MessagesProvider>
            </Hamburger>

            <MultiplePeerComponent channel_id={channel_id} currentChannel={currentChannel !}/>
        </div>
    )
  return content
}

export default ChannelCallWrapper