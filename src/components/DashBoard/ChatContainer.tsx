import React, { useEffect } from 'react'
import CurrentChannel from './CurrentChannel/CurrentChannel'
import "./ChatContainer.scss"
import { Outlet, useLocation} from 'react-router-dom'
import ChannelManager from '../ChannelManager/ChannelManager'

const ChatContainer = () => {
    const location = useLocation()
    
    

    let content = (
        <div className='chat-container-outer '>  
            <CurrentChannel />
            {location.search.includes('?manage') && <ChannelManager/>}
            <Outlet/>
        </div>
    )
 
    
  return content
}

export default ChatContainer