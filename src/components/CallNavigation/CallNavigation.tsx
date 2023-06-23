import React, { useEffect, useRef, useState } from 'react'
import { Socket } from 'socket.io-client'
import { Peer } from '../MultiplePeerComponent/MultiplePeerComponent'
import Button from '../Button/Button'
import { ChannelType } from '../types'
import { useNavigate } from 'react-router-dom'
import { cameraIco, declineIco } from '../../assets'
import './CallNavigation.scss'
import { useAuthStore } from '../../ZustandStore'
import { throwErr } from '../utils'
interface PropsType {
    socket: Socket
    setPeers: React.Dispatch<React.SetStateAction<Peer[]>>
    setJoinedPeers: React.Dispatch<React.SetStateAction<string[]>>
    channel:ChannelType
    userVideoRef:React.RefObject<HTMLVideoElement>
    remoteVideoRefs: React.MutableRefObject<{
        [key: string]: HTMLVideoElement;
    }>
    userStreamRef:React.MutableRefObject<MediaStream | undefined>
    peers:Peer[]
}

function CallNavigation({socket,setPeers,setJoinedPeers,channel,userVideoRef, userStreamRef,remoteVideoRefs,peers}:PropsType) {
    const navigate = useNavigate()
    const [isCameraOn,setIsCameraOn]=useState(true)
  const user = useAuthStore(s=>s.user)
   
    const handleDecline = ()=>{
        navigate(channel?._id ? `/chat/${channel?._id}` : '/chat')
        setPeers([])
        setJoinedPeers([])
        socket.emit('leave',user?._id)
        socket.disconnect()
        }
    const handleCamera = async()=>{
      console.log(userStreamRef?.current);
      let stream = userStreamRef.current
       userStreamRef?.current!.getVideoTracks().forEach(track=>{
          track.enabled = !track.enabled 
           console.log(`track:`,track);

            socket.emit('media-track',{room:channel?._id,userId:user?._id, enabled:track.enabled},{enabled:track.enabled,id:track.id,kind:track.kind,label:track.label})

       })
    }

    const content = (
        <div className="call-navigation">
          <div className="wrapper">

            <Button onClick={handleCamera} name='camera' type="button" >
                <img src={cameraIco} className='camero-icon' alt="" />
            </Button>
            <Button onClick={handleDecline} name='decline' type="button" >
                <img src={declineIco} className='decline-icon' alt="" />
            </Button>
          </div>

        </div>

    )

    return content
}

export default CallNavigation