import React from 'react'
import { useParams } from 'react-router-dom'
import { useAuthStore } from '../../ZustandStore'
import {useCurrentChannel, useWindowSize } from '../../hooks'
import Hamburger from '../HamburgerMenu/Hamburger'
import MessagesProvider from '../MessagesWrapper/Context/MessagesContext'
import MessagesWrapper from '../MessagesWrapper/MessagesWrapper'
import MultiplePeerComponent from './MultiplePeerComponent'

function ChannelCallWrapper() {
    const user = useAuthStore(state=>state.user)
    const {channel_id}=useParams()
    const {currentChannel,setCurrentChannel}=useCurrentChannel(channel_id!,user)
    const {width}=useWindowSize()
    const content = (
        <div className="video-chat-wrapper">
            <Hamburger type='messages' animation={{loaded:'loaded', toggled:'appearFromRight',untoggled:'disappearToRight'}} isHamburger={width > 700 ? false : true}>
                <MessagesProvider>
                    {/* <MessagesWrapper setCurrentChannel={setCurrentChannel} currentChannel={currentChannel} currentChannelMessages={currentChannel?.messages!}/> */}
                    <MessagesWrapper setCurrentChannel={setCurrentChannel} currentChannel={currentChannel} />
                </MessagesProvider>
            </Hamburger>

            <MultiplePeerComponent channel_id={channel_id?? ''} currentChannel={currentChannel !}/>
        </div>
    )
  return content
}

export default ChannelCallWrapper