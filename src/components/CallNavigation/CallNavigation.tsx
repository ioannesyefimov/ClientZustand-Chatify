import React, { useEffect, useRef, useState } from 'react'
import { Socket } from 'socket.io-client'
import { Peer } from '../MultiplePeerComponent/MultiplePeerComponent'
import Button from '../Button/Button'
import { ChannelType } from '../types'
import { useNavigate } from 'react-router-dom'
import { cameraIco, declineIco, microIco, screenIco } from '../../assets'
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
    userAudioSource: MediaStreamAudioSourceNode
}

function CallNavigation({userAudioSource,senders, socket,setPeers,setJoinedPeers,channel,userVideoRef, userStreamRef,remoteVideoRefs,peers}:PropsType) {
    const navigate = useNavigate()
  const user = useAuthStore(s=>s.user)
   const [userShareState,setUserShareState]=useState<"video"|'screen'|'none'|'audio-on'|'audio-off'>('video')

   useEffect(
    ()=>{
      if(!userStreamRef.current || userShareState==='audio-off') return console.log(`audio-state: ${userShareState} stream ref:` + userStreamRef.current + `video ref :`+userVideoRef.current)
      let audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(userStreamRef.current)
      userAudioSource = source
      const analyser = audioContext.createAnalyser()
      source.connect(analyser)
      
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      let threshold = 1
      function checkIfUserIsSpeaking() {
        function calculateAverageVolume(dataArray:Uint8Array
          ) {   
          const sum = dataArray.reduce((acc:any, val:any) => acc + val, 0);
          const average = sum / dataArray.length;
          return average;
        }
        analyser.getByteFrequencyData(dataArray);
          // Analyze the data to determine if the user is speaking
        // For example, you can calculate the average volume level
        const averageVolume = calculateAverageVolume(dataArray);
        // Make a decision based on the average volume level
        if (averageVolume > threshold) {
          userVideoRef.current?.classList?.add('speaking')
        } else if(averageVolume < threshold){
          userVideoRef.current?.classList?.remove('speaking')
        }
      // Call the function again to continuously monitor the audio
        requestAnimationFrame(checkIfUserIsSpeaking);
      }
      checkIfUserIsSpeaking()
      return ()=>{source.disconnect()}

    },[userStreamRef.current,userShareState]
  )
    const handleDecline = ()=>{
        navigate(channel?._id ? `/chat/${channel?._id}` : '/chat')
        setPeers([])
        setJoinedPeers([])
        socket.emit('leave',user?._id)
        socket.disconnect()
        if(userAudioSource){
          userAudioSource?.disconnect()
        }
        }
    const handleCamera = async()=>{
      console.log(userStreamRef?.current);
       userStreamRef?.current!.getVideoTracks().forEach(track=>{
          track.enabled = !track.enabled 
           console.log(`track:`,track);

            socket.emit('media-track',{room:channel?._id,userId:user?._id, enabled:track.enabled},{enabled:track.enabled,id:track.id,kind:track.kind,label:track.label})

       })
    }

    const handleShareScreen =async()=>{
      if(userShareState==='screen'){
        let videoTrack = userStreamRef.current?.getVideoTracks()[0]
        if(!videoTrack) return
        Object.keys(senders)?.forEach(sender=>{
          if(senders[sender]?.track?.kind==='video'){
            console.log(`senders:`,senders)
            if(!userStreamRef.current) return console.log('user stream is ', userStreamRef.current)
            senders[sender].replaceTrack(videoTrack ?? null)
          }
     
        })
        userVideoRef.current.srcObject=userStreamRef.current!
        setUserShareState('video')
        return
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({cursor:true})
      console.log(`screen stream:`,stream)
      

      let screenTrack= stream.getTracks()[0]
        console.log(`senders:cd`,senders)
        setUserShareState('screen')

        Object.keys(senders).forEach(sender=>{
          console.log(`sender:`,senders[sender])
          if(!senders[sender]) return console.log(`sender`,sender,'senders',senders)
            senders[sender].replaceTrack(screenTrack)
        })
        userVideoRef.current.srcObject = stream
      screenTrack.onended = ()=>{
        console.log(`senders`,senders);
        console.log(`screen track is ended`);
        
        userVideoRef.current.srcObject = userStreamRef.current 
        Object.keys(senders)?.forEach(sender=>{
          console.log(`sender:`,senders[sender])
          if(senders[sender]?.track?.kind==='video'){
            if(!userStreamRef.current) return console.log('user stream is ', userStreamRef.current)
            senders[sender].replaceTrack(userStreamRef.current?.getTracks()[1])
          }
        })
      }

    }

    const handleMuteMicro = ()=>{
      
      if(!userStreamRef.current) return console.log(`user stream ref is`+userStreamRef.current)
      let audioTracks = userStreamRef.current.getAudioTracks()!
      audioTracks.forEach(track=>{
        console.log(`toggling micro:`,track);
        track.enabled = !track.enabled
        console.log(`track.enabled:`,track.enabled);

        if(track.enabled){
          console.log(`user is  speaking.`);

          setUserShareState('audio-on')
        }else if(!track.enabled) {
          userVideoRef.current?.classList.remove('speaking')
          console.log(`user is not speaking .`,userVideoRef.current);

          setUserShareState('audio-off')
        }
      })
      
    }

    const content = (
        <div className="call-navigation">
          <div className="wrapper">

            <Button onClick={handleCamera} name='camera' type="button" >
                <img src={cameraIco} className='camero-icon' alt="" />
            </Button>
            <Button onClick={handleMuteMicro} name='micro' type="button" >
                <img src={microIco} className='micro-icon' alt="" />
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