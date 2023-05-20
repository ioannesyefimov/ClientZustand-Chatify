import React, { useEffect, useRef, useState } from 'react';
import './ChannelWebRTC.scss'
import SocketStore from '../SocketStore';
import { useAuthStore, useChatStore } from '../../ZustandStore';
import Button from '../Button/Button';
import { callIco } from '../../assets';
import { SocketResponse } from '../types';
import { Socket } from 'socket.io-client';

const {io,certOptions,serverUrl}=SocketStore()
const ChannelWebRTC: React.FC = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);
  const [peerConnections,setPeerConnections]=useState<RTCPeerConnection[]>([])

  const socketRef = useRef<Socket|null>(null)
  const channel= useChatStore(s=>s.currentChannel)
  const user = useAuthStore(s=>s.user)
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<HTMLVideoElement[]>([]);
  // const configuration: RTCConfiguration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

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
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      remoteStreams.forEach(stream => {
        stream.getTracks().forEach(track => track.stop());
      });
    };
  }, []);
  useEffect(() => {
    const initializePeerConnection = (userId: string) => {
      try {
        const configuration: RTCConfiguration = {
          iceServers: [{ urls: 'stun:stun.stunserver.org:3478' }],
        };

        const pc = new RTCPeerConnection(configuration);

        // Add local stream and handle remote stream
        // ...

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socketRef.current?.emit('candidate', { userId, candidate: event.candidate });
          }
        };

        pc.ontrack = (event) => {
          if (event.streams && event.streams[0]) {
            remoteVideoRefs.current[userId]!.srcObject = event.streams[0];
          }
        };

        setPeerConnections((prevConnections) => ({
          ...prevConnections,
          [userId]: pc,
        }));
      } catch (error) {
        console.log(`Error initializing peer connection for user ${userId}:`, error);
      }
    };

    initializePeerConnection('user1');
    initializePeerConnection('user2');
    // Initialize more peer connections for additional users as needed

    return () => {
      Object.values(peerConnections).forEach((pc) => pc.close());
    };
  }, []);

  useEffect(
    ()=>{
      const socket = io(`${serverUrl}/current-channel-call`)
      socket.on('connect',()=>{
        console.log('Socket.IO connection established')
        socketRef.current = socket
      })

      socket.on('answer_call',data=>{
        const {userId,type,offer,answer,candidate}=data
        if (type === 'offer') {
          handleOffer(userId, offer);
        } else if (type === 'answer') {
          handleAnswer(userId, answer);
        } else if (type === 'candidate') {
          handleIceCandidate(userId, candidate);
        }
      })
      socket.on('disconnect', () => {
        console.log('Socket.IO connection closed.');
        socketRef.current = null;
      });
  
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    },[]
  )
 
  const handleCall = async (userId: string) => {
    try {
      const pc = peerConnections[userId];
      if (!pc) {
        console.log(`Peer connection not found for user ${userId}`);
        return;
      }

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const offerSdp = pc.localDescription?.sdp;
      socketRef.current?.emit('message', { userId, type: 'offer', offer: offerSdp });
    } catch (error) {
      console.log(`Error creating offer for user ${userId}:`, error);
    }
  };

  const handleOffer = async (userId: string, offerSdp: string) => {
    try {
      const pc = peerConnections[userId];
      if (!pc) {
        console.log(`Peer connection not found for user ${userId}`);
        return;
      }

      await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: offerSdp }));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const answerSdp = pc.localDescription?.sdp;
      socketRef.current?.emit('message', { userId, type: 'answer', answer: answerSdp });
    } catch (error) {
      console.log(`Error creating answer for user ${userId}:`, error);
    }
  };

  const handleAnswer = async (userId: string, answerSdp: string) => {
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
  };

  const handleIceCandidate = async (userId: string, candidate: RTCIceCandidateInit) => {
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
      {remoteStreams?.map((stream, index) => (
        <video key={index} ref={videoRef => remoteVideoRefs.current[index] = videoRef} autoPlay playsInline />
      ))}
      {/* <button className='call__btn' onClick={handleCall}>Call</button> */}
      <Button name="call_btn" img={callIco} onClick={handleCall}/>
    </section >
  );
};

export default ChannelWebRTC;
