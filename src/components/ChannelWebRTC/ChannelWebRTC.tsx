import React, { useEffect, useRef, useState } from 'react';
import './ChannelWebRTC.scss'
import SocketStore from '../SocketStore';
import { useAuthStore, useChatStore } from '../../ZustandStore';
import Button from '../Button/Button';
import { callIco } from '../../assets';
import { SocketResponse } from '../types';
import { Socket } from 'socket.io-client';
import { useCallback } from 'react';
type PeerConnections = { [userId: string]: RTCPeerConnection };
const {io,certOptions,serverUrl}=SocketStore()
const channelCallSocket = io(`${serverUrl}/current-channel-call`,{pfx:certOptions.pfx,passphrase:certOptions?.passphrase,autoConnect:false})
const ChannelWebRTC: React.FC = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peerConnections, setPeerConnections] = useState<PeerConnections>({});
  const channel= useChatStore(s=>s.currentChannel)
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<{ [userId: string]: HTMLVideoElement | null }>({});


  const user = useAuthStore(s=>s.user)

  useEffect(() => {
    // Access user's media devices (camera and microphone)
    // navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    navigator.mediaDevices.getUserMedia({ video: true})
      .then(stream => {
        // Display local video stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setLocalStream(stream);
      })
      .catch(error => {
        console.log('Error accessing media devices:', error);
      });

    // Clean up
    console.log(`REMOTE REFS`, remoteVideoRefs);
    
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
     
    };
  }, []);
  useEffect(() => {
   
    if(user?._id){
      initializePeerConnection(user?._id);
      return () => {
        Object.values(peerConnections).forEach((pc) => pc.close());
      };
    }
    // Initialize more peer connections for additional users as needed

  }, [user?._id]);


  useEffect(
    ()=>{
      channelCallSocket.connect()
      
      channelCallSocket.on('connect',()=>{
        console.log(`Socket.IO connection established`)
        channelCallSocket.emit('join_room',{room:channel?._id,user_id:user?._id}) 
        // socket.emit('candidate',{room:channel?._id,user_id:user?._id}) 

      })
      // const onCandidate=(data:any)=>{
      //   console.log(`data`,data)
      //   initializePeerConnection(data?.user_id)

      // }
      const onNewPerrConnection = (data:any)=>{
         initializePeerConnection(data?.user_id)
      }
      const onJoinRoom = (data:any)=>{
        console.log(data?.message)
      }
      const onMessage = (data:any)=>{
        const {userId,type,offer,answer,candidate}=data;
        console.log(`on message data:`,data);
        
        if (type === 'offer') {
          handleOffer(userId, offer);
        } else if (type === 'answer') {
          handleAnswer(userId, answer);
        } else if (type === 'candidate') {
          handleIceCandidate(userId, candidate);
        }
      }
      channelCallSocket.on('message',onMessage);
      channelCallSocket.on('new_peer',onNewPerrConnection);
      channelCallSocket.on('join_room',onJoinRoom);
      channelCallSocket.on('disconnect', () => {
        console.log('Socket.IO connection closed.')
      });
      return ()=>{
      
        channelCallSocket.off('message',onMessage)
        // channelCallSocket.off('candidate',onCandidate)
        channelCallSocket.off('join_room',onJoinRoom)
      }

    },[]
  )
  const initializePeerConnection = (user_id: string) => {
    try {
      console.log(`Initializinmg peer connection with id : ${user_id}`);
      
      const configuration: RTCConfiguration = {
        iceServers: [{ urls: 'stun:stun.stunserver.org:3478' }],
      };
      const pc = new RTCPeerConnection(configuration);
      // Add local stream and handle remote stream
      // ...
      
      pc.onicecandidate = (event) => {
        if (event.candidate) {
         channelCallSocket?.emit('candidate', { user_id, candidate: event.candidate });
        }
      };

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          remoteVideoRefs.current[user_id]!.srcObject = event.streams[0];
        }
      };
      channelCallSocket?.emit('join_room',{room:channel?._id,user_id:user?._id,signal:pc})
      setPeerConnections((prevConnections) => ({
        ...prevConnections,
        [user_id]: pc,
      }));
    } catch (error) {
       console.log(`Error initializing peer connection for user ${user_id}:`, error);
    }
  };

  const handleCall =
     async (userId:string) => {
    
    try {
      console.log(`CALLING`);
      const pc = peerConnections[userId];
      if (!pc) {
        console.log(`Peer connection not found for user ${userId}`);
        return;
      }
      console.log(`CALLING`);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const offerSdp = pc.localDescription?.sdp;
      console.log(`SOCKET`,channelCallSocket);
      
      channelCallSocket?.emit('message', { userId, type: 'offer', offer: offerSdp,room:channel?._id });
    } catch (error) {
      console.log(`Error creating offer for user ${userId}:`, error);
    }
  }

  const handleOffer =
    async (userId:string, offerSdp:string) => {
    try {
      console.log(`PEERCONNECTIONS`,peerConnections);
      
      const pc = peerConnections[userId];
      if (!pc) {
        console.log(`Peer connection not found for user ${userId}`);
        return;
      }

      await pc.setRemoteDescription({ type: 'offer', sdp: offerSdp });

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const answerSdp = pc?.localDescription?.sdp;
     channelCallSocket?.emit('message', { userId, type: 'answer', answer: answerSdp,room:channel?._id });
    } catch (error) {
      console.log(`Error creating answer for user ${userId}:`, error);
    }
  }

  const handleAnswer =
     async (userId:string, answerSdp: string) => {
    try {
      const pc = peerConnections[userId];
      if (!pc) {
        console.log(`Peer connection not found for user ${userId}`);
        return;
      }

      await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: answerSdp }));
    } catch (error) {
      console.log(`Error setting remote description for user ${userId}:`, error);
    }
  }

  const handleIceCandidate = async (userId:string, candidate:RTCIceCandidate) => {
    try {
      const pc = peerConnections[userId];
      if (!pc) {
        console.log(`Peer connection not found for user ${userId}`);
        return;
      }

      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.log(`Error adding ICE candidate for user ${userId}:`, error);
    }
  };

  return (
    <section className='channel__webrtc'>
      <video className='local__video' ref={localVideoRef} autoPlay playsInline muted />
      {
      Object.keys(remoteVideoRefs?.current).map((key)=>{
        console.log(`KEY`,key)
        console.log(`property`,remoteVideoRefs[key])
        return <h1>haha</h1>
      })
      }
      <Button name="call_btn" img={callIco} onClick={()=>handleCall(user?._id)}/>
    </section >
  )
}

export default ChannelWebRTC;
