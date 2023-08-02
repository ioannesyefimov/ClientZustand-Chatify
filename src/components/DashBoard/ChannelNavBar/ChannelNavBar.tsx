import React, { useEffect, useState } from 'react'
import { ChannelType } from '../../types'
import {callIco, callInProggress} from '../../../assets'
import './ChannelNavBar.scss'
import Button from '../../Button/Button'
import { Link, useLocation } from 'react-router-dom'
function ChannelNavBar({channel}:{channel:ChannelType}) {
    const location = useLocation()
    const [isCallInProggres,setIsCallInProggres]=useState()
    

    const content = (
        <div className="channel-nav-bar">
            <div className='channel-title'>
                <h2 >{channel?.channelName}</h2> 
            </div>

            <div className="wrapper">
                <Link className='call-img' to={`/chat-video/${channel?._id}`}>
                    <img  src={channel?.isInCall ? callInProggress: callIco} />
                </Link>
            </div>
        </div>
    )



  return content
}

export default ChannelNavBar