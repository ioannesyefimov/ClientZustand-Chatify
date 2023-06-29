import React, { useEffect, useRef, useState } from 'react'
import { Socket } from 'socket.io-client'
import { Peer } from '../MultiplePeerComponent/MultiplePeerComponent'
import Button from '../Button/Button'
import { ChannelType } from '../types'
import { useNavigate } from 'react-router-dom'
import { cameraIco, declineIco, screenIco } from '../../assets'
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
    senders: {[key:string]:RTCRtpSender}
}

function CallNavigation({senders, socket,setPeers,setJoinedPeers,channel,userVideoRef, userStreamRef,remoteVideoRefs,peers}:PropsType) {
    const navigate = useNavigate()
  const user = useAuthStore(s=>s.user)
   const [userShareState,setUserShareState]=useState<"video"|'screen'|'none'>('video')
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

    const handleShareScreen =async()=>{
      if(userShareState==='screen'){
        let videoTrack = userStreamRef.current?.getTracks()[0]
        if(!videoTrack) return
        Object.keys(senders)?.forEach(sender=>{
          if(senders[sender].track){
            senders[sender].replaceTrack(videoTrack)
          }
        })
        userVideoRef.current.srcObject=userStreamRef.current
        setUserShareState('video')
        return
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({cursor:true})
      console.log(`screen stream:`,stream)
      

      let screenTrack= stream.getTracks()[0]
      // peers.forEach(peer=>{
        console.log(`senders:`,senders)
        setUserShareState('screen')

        Object.keys(senders).forEach(sender=>{
          console.log(`sender:`,senders[sender])

          if(!senders[sender]) return console.log(`sender`,sender,'senders',senders)
          // if(senders[sender]?.track?.kind==='video'){
            senders[sender].replaceTrack(screenTrack)
          // }
        })
        userVideoRef.current.srcObject = stream
      // })
      screenTrack.onended = ()=>{
        console.log(`senders`,senders);
        console.log(`screen track is ended`);
        
        userVideoRef.current.srcObject = userStreamRef.current 
        Object.keys(senders).forEach(sender=>{
          console.log(`sender:`,senders[sender])
          if(senders[sender]?.track?.kind==='video'){
            if(!userStreamRef.current) return console.log('user stream is ', userStreamRef.current)
            senders[sender].replaceTrack(userStreamRef.current?.getTracks()[1])
          }
        })
      }

    }

    const content = (
        <div className="call-navigation">
          <div className="wrapper">

            <Button onClick={handleCamera} name='camera' type="button" >
                <img src={cameraIco} className='camero-icon' alt="" />
            </Button>
            <Button onClick={handleShareScreen} name='screen' type="button" >
                <img src={screenIco} className='screen-icon' alt="" />
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