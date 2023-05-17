import React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import './channelManager.scss'
import ChannelJoin from './ChannelJoin/ChannelJoin'
import ChannelCreate from './ChannelCreate/ChannelCreate'
const ChannelManager = () => {
    const location = useLocation()

    let content = (
        <div className='channel-manager-component'>
            {!location.pathname.includes('/join') && !location.pathname.includes('create') ?
            (
                <div className='wrapper'>
                    <Link to={`join`}  replace>Join channel</Link>
                    <Link to={`create`}  replace>Create new channel</Link>
                </div>
            ) : (
                <Outlet/>
            )    
        }
                  
        </div>
    )

    // if(location.pathname === '/chat/manage/join') return <ChannelJoin/>
    // if(location.pathname === '/chat/manage/create') return <ChannelCreate/>
  return   content
  
}

export default ChannelManager