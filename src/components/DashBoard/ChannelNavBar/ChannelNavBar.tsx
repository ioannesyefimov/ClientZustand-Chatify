import React from 'react'
import { ChannelType } from '../../types'
import {callIco} from '../../../assets'
import './ChannelNavBar.scss'
import Button from '../../Button/Button'
import { Link, useLocation } from 'react-router-dom'
function ChannelNavBar({channel}:{channel:ChannelType}) {
    const location = useLocation()
    const content = (
        <div className="channel-nav-bar">
            <div className='channel-title'>
                <h2 >{channel?.channelName}</h2> 
            </div>

            <div className="wrapper">
                <Link className='call-img' to={`/chat-video/${channel?._id}`}>
                    <img src={callIco} />
                </Link>
            </div>
        </div>
    )



  return content
}

export default ChannelNavBar