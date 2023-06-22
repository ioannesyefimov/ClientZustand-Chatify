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
    const trackRef = useRef<RTCRtpSender>()
    const navigate = useNavigate()
    const [isCameraOn,setIsCameraOn]=useState(true)
  const user = useAuthStore(s=>s.user)
    useEffect(() => {
        const initializeMediaStream = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            userStreamRef.current = stream;
    
            if (userVideoRef.current) {
              userVideoRef.current.srcObject = stream;
            }
            
            peers.forEach((peer) => {
            console.log(`initializing media stream`);
            // socket.emit('call-peers',peer.userId)
    
              const tracks = stream.getTracks();
              tracks.forEach((track) => {
                peer.peerConnection.addTrack(track, stream);
                  const sender = peer.peerConnection.addTrack(track, stream);
                  trackRef.current = sender;
                  (sender as any).onremovetrack  = () => {
                    console.log('Remote user stopped sending video');
                }
              });
    
            });
          } catch (error) {
            console.log('Error accessing media devices:', error);
          }
        };
        initializeMediaStream();
      }, [peers]);

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
       userStreamRef?.current!.getTracks().forEach(track=>{
        
        if(track.kind==='video'){
          if(track?.enabled){
            track.enabled = false 
         console.log(`typeof:` ,typeof track);
         console.log(`track:`,track);

            socket.emit('media-track',{room:channel?._id,userId:user?._id,trackId:track.id, enabled:track.enabled})

            
          } else if(track?.enabled === false) {
            track.enabled = true
            socket.emit('media-track',{room:channel?._id,userId:user?._id,track:track, enabled:track.enabled})

          } 
        }
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