import React, { useEffect, useRef, useState } from 'react';
import SocketStore from '../SocketStore';
import { ChannelType } from '../types';
import { Socket } from 'socket.io-client';
import './ChannelWebRTC.scss'
import { useAuthStore, useChatStore } from '../../ZustandStore';

const { io, certOptions, serverUrl } = SocketStore();

interface Peer {
  userId: string;
  peerConnection: RTCPeerConnection
}


const MultiplePeerComponent = () => {
  const [peers, setPeers] = useState<Peer[]>([]);
  const socketRef = useRef<Socket>();
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});
  const userStreamRef = useRef<MediaStream>();

  const currentChannel = useChatStore(s=>s.currentChannel)
  const user = useAuthStore(s=>s.user)

  useEffect(() => {
    const socket = io(`${serverUrl}/current-channel-call`,certOptions); // Replace with your Socket.IO server URL
    socketRef.current = socket;
    console.log(`initializing current channel call`);
    socket.connect()
    socket.on('connect',()=>{
      console.log(`${user?._id} connected to channelCall socket by ID: ${socket?.id}`)
      socket.emit('join_room', {userId:user._id,room:currentChannel?._id})
    })

    socket.on('users', (userIds: string[]) => {
      console.log(`users`,userIds);
      
      if(!userIds) return console.log(`usersIDS IS ${userIds}`)
      const newPeers = userIds?.map((userId) => ({
        userId,
        peerConnection: initializePeerConnection(userId),
      }));
      setPeers(newPeers);
    });

    socket.on('offer', ({ userId, offer }: { userId: string; offer: RTCSessionDescriptionInit }) => {
      const peer = peers.find((p) => p.userId === userId);
      if (peer) {
        peer.peerConnection
          .setRemoteDescription(offer)
          .then(() => peer.peerConnection.createAnswer())
          .then((answer) => peer.peerConnection.setLocalDescription(answer))
          .then(() => {
            socket.emit('answer', { userId, answer: peer.peerConnection.localDescription });
          })
          .catch((error) => {
            console.log('Error creating or setting local/remote description:', error);
          });
      }
    });

    socket.on('answer', ({ userId, answer }: { userId: string; answer: RTCSessionDescriptionInit }) => {
      const peer = peers.find((p) => p.userId === userId);
      if (peer) {
        peer.peerConnection.setRemoteDescription(answer).catch((error) => {
          console.log('Error setting remote description:', error);
        });
      }
    });

    socket.on('iceCandidate', ({ userId, candidate }: { userId: string; candidate: RTCIceCandidate }) => {
      const peer = peers.find((p) => p.userId === userId);
      if (peer) {
        peer.peerConnection
          .addIceCandidate(candidate)
          .catch((error) => {
            console.log('Error adding ICE candidate:', error);
          });
      }
    });

    return () => {
      socket.disconnect();
    }
  }, []);

  useEffect(() => {
    const initializeMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        userStreamRef.current = stream;

        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
        }

        peers.forEach((peer) => {
          const tracks = stream.getTracks();
          tracks.forEach((track) => {
            peer.peerConnection.addTrack(track, stream);
          });

          if (peer.userId !== socketRef.current?.id) {
            const sender = peer.peerConnection.addTrack(track, stream);
            sender.onremovetrack = () => {
              console.log('Remote user stopped sending video');
            };
          }
        });
      } catch (error) {
        console.log('Error accessing media devices:', error);
      }
    };

    initializeMediaStream();
  }, [peers]);

  const initializePeerConnection = (userId: string) => {
    const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
    const peerConnection = new RTCPeerConnection(configuration);

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('iceCandidate', { userId, candidate: event.candidate });
      }
    };

    peerConnection.ontrack = (event) => {
      if (remoteVideoRefs.current[userId]) {
        remoteVideoRefs.current[userId].srcObject = event.streams[0];
      }
    };

    if (userStreamRef.current) {
      userStreamRef.current.getTracks().forEach((track) => {
        if(track ){
          peerConnection.addTrack(track, userStreamRef.current!);
        }
      });
    }
    handleCall(userId)

    return peerConnection;
  };
  const handleCall = (userId: string) => {
    const peer = peers.find((p) => p.userId === userId);
    if (peer) {
      peer.peerConnection.createOffer()
        .then((offer) => peer.peerConnection.setLocalDescription(offer))
        .then(() => {
          socketRef.current?.emit('offer', { userId, offer: peer.peerConnection.localDescription });
        })
        .catch((error) => {
          console.log('Error creating or setting local description:', error);
        });
    }
  };

  const handleFocusedStream = ()=>{

  }

  return (
    <div className='channel-webrtc'>
      <div className='local-user focused-user'>
        <video className='local-user-video' ref={userVideoRef} playsInline autoPlay muted />
      </div>
      <div className='remote-users'>
        {peers.map((peer) => (
          <div className='remote-user' key={peer.userId}>
            <video className='remote-user-video' ref={(ref) => { remoteVideoRefs.current[peer.userId] = ref; }} playsInline autoPlay />
            {/* <button className='remote-user-btn' onClick={() => handleCall(peer.userId)}>Call</button> */}
          </div>
        ))}
       <div className='remote-user' >
            <video className='remote-user-video'  playsInline autoPlay />
            {/* <button className='remote-user-btn' onClick={() => handleCall(peer.userId)}>Call</button> */}
          </div>
       <div className='remote-user' >
            <video className='remote-user-video'  playsInline autoPlay />
            {/* <button className='remote-user-btn' onClick={() => handleCall(peer.userId)}>Call</button> */}
          </div>
       <div className='remote-user' >
            <video className='remote-user-video'  playsInline autoPlay />
            {/* <button className='remote-user-btn' onClick={() => handleCall(peer.userId)}>Call</button> */}
          </div>
      </div>
    </div>
  );
};

export default MultiplePeerComponent;
