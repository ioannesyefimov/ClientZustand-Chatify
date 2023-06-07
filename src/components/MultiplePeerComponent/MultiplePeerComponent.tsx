import React, { useEffect, useRef, useState } from 'react';
import SocketStore from '../SocketStore';
import { ChannelType } from '../types';
import { Socket } from 'socket.io-client';
import './ChannelWebRTC.scss'
import { useAuthStore, useChatStore } from '../../ZustandStore';
import Button from '../Button/Button';
import { callIco, declineIco } from '../../assets';
import { Link } from 'react-router-dom';
import { sleep } from '../utils';

const { io, certOptions, serverUrl } = SocketStore();

interface Peer {
  socketId?:string
  userId: string;
  peerConnection: RTCPeerConnection
}
const socket = io(`${serverUrl}/current-channel-call`,{pfx: certOptions.pfx,passphrase:certOptions.passphrase,autoConnect:false}); // Replace with your Socket.IO server URL

const MultiplePeerComponent = ({currentChannel}:{currentChannel:ChannelType}) => {
  const [peers, setPeers] = useState<Peer[]>([]);
  const socketRef = useRef<Socket>();
  const [me,setMe]=useState('')
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});
  const userStreamRef = useRef<MediaStream>();
  const user = useAuthStore(s=>s.user)

  useEffect(() => {
    socket.connect()
    socket.on('connect',async ()=>{
      setMe(socket.id)
      console.log(`${user?._id} connected to channelCall socket by ID: ${socket?.id}`)
      socket.emit('join_room', {userId:user._id,room:currentChannel?._id})
    })
    return()=>{
      socket.disconnect();
      setMe('')
    }
  }, []);
  
  useEffect(
    ()=>{
    function onUsers (data: {user:{userId:string,socketId:string,}}[]) {
      console.log(`users`,data);
      data=data?.filter(userId=>userId?.user.userId!==user?._id && userId !== null)
      console.log(`filtered users`,data);
      if(!data) return console.log(`usersIDS IS ${data}`)
      const newPeers = data?.map((user) => ({
        userId:user?.user.userId,
        socketId: user?.user.socketId,
        peerConnection: initializePeerConnection(user?.user.userId,user?.user?.socketId),
      }));
      console.log(`new peers`, newPeers);
      
      setPeers(newPeers);
      socket.emit('call-peer',newPeers)
    }
    function onOffer({ userId, offer,from ,fromSocket}: {from:string; userId: string; offer: RTCSessionDescriptionInit,fromSocket:string }) {
      const peer = peers.find((p) => p.userId === from);
      console.log(`getting offer for ${userId} from ${from}:`,offer);
      console.log(`peer`,peer);
      console.log(`peers`,peers);
      
      if (peer) {
        peer.peerConnection
          .setRemoteDescription(offer)
          .then(() => peer.peerConnection.createAnswer())
          .then((answer) => peer.peerConnection.setLocalDescription(answer))
          .then(() => {
            socket.emit('answer', { userId,socketId:fromSocket, answer: peer.peerConnection.localDescription });
          })
          .catch((error) => {
            console.log('Error creating or setting local/remote description:', error);
          });
      }
    }
    function onCallPeer(data){
      console.log(`on call peer triggered`,data);
      
      if(!data)return 
      data?.every(user=>handleCall(user?.userId,user?.socketId))
    }
    function onAnswer  ({ userId, answer }: { userId: string; answer: RTCSessionDescriptionInit }) {
      const peer = peers.find((p) => p.userId === userId);
      console.log(`ON answer is triggered`);
      
      if (peer) {
        if(peer.peerConnection.signalingState === 'stable') return console.log(`CONNECTION SIGNAL IS ${peer.peerConnection.signalingState}`);
        
        peer.peerConnection.setRemoteDescription(answer).catch((error) => {
          console.log('Error setting remote description:', error);
        });
      }
    }
    function onJoinRoom(data:string){
      console.log(data)
    }
    function onIceCandidate({ userId,socketId, candidate }: { userId: string;socketId:string; candidate: RTCIceCandidate }) {
      const peer = peers.find((p) => p.socketId === socketId);
      console.log(`ice candidate triggered for ${socketId}; id:${userId}`,candidate);
      if(!peer) return console.log(`PC IS ${peer?.peerConnection}`)
        peer.peerConnection
          .addIceCandidate(candidate)
          .catch((error) => {
            console.log('Error adding ICE candidate:', error);
          });
    }
    socket.on('call-peer',onCallPeer)
    socket.on('offer', onOffer);
    socket.on('answer',onAnswer);
    socket.on('iceCandidate', onIceCandidate);
    socket.on('userRemoved',(userId)=>{
      console.log(`USER ${userId} has been removed`)
    })
    socket.on('users', onUsers);
    socket.on('join_room',onJoinRoom)
    console.log(`initializing current channel call`);
    return () => {
      socket.off('offer',onOffer)
      socket.off('join_room',onJoinRoom)
      socket.off('users',onUsers)
      socket.off('answer',onAnswer)
      socket.off('iceCandidate',onIceCandidate)
    }
    },[peers.length]
  )
  useEffect(() => {
    const initializeMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        userStreamRef.current = stream;

        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
        }
        console.log(`initializing media stream`);
        
        peers.forEach((peer) => {
          const tracks = stream.getTracks();
          tracks.forEach((track) => {
            peer.peerConnection.addTrack(track, stream);
              const sender = peer.peerConnection.addTrack(track, stream);
              sender.onremovetrack = () => {
                console.log('Remote user stopped sending video');
            }
          });

        });
      } catch (error) {
        console.log('Error accessing media devices:', error);
      }
    };
    initializeMediaStream();
  }, [peers.length]);

  const initializePeerConnection = (userId: string,socketId:string) => {
    const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
    const peerConnection = new RTCPeerConnection(configuration);

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.emit('iceCandidate', { userId:user._id,socketId, candidate: event.candidate });
      }
    };

    peerConnection.ontrack = (event) => {
      console.log(`peer video triggered`);
      
      if (remoteVideoRefs.current[userId]) {
        console.log(`triggered remote video ref`,event.streams[0]);
        console.log(`peer:`,remoteVideoRefs.current[userId]);
        remoteVideoRefs.current[userId].srcObject = event.streams[0];
        console.log(remoteVideoRefs.current[userId].srcObject, 'THIS IS SRC OBJ OF THE REF ' + userId)
      }
    };

    if (userStreamRef?.current) {
      userStreamRef.current.getTracks().forEach((track) => {
        if(track ){
          peerConnection.addTrack(track, userStreamRef.current!);
        }
      });
    }
    // handleCall(userId,socketId)
    return peerConnection;
  };
  const handleCall = (userId: string,socketId:string) => {
    console.log(`CALLING ${userId}`);
    
    const peer = peers.find((p) => p.userId === userId);
    console.log(`calling peer:`, peer);
    if (peer) {
      peer.peerConnection.createOffer()
        .then((offer) => peer.peerConnection.setLocalDescription(offer))
        .then(() => {
          socket.emit('offer', { userId,from:user._id,fromSocket:socket.id,fromUserId:user?._id, socketId, offer: peer.peerConnection.localDescription });
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
        {peers.map((peer) => {
          console.log(`peer:`,peer);
          console.log(`peerRef:`,remoteVideoRefs.current[peer.userId]);
          return (
          <div className='remote-user' key={peer.userId}>
            <video className={`remote-user-video`}  data-id={peer.userId} ref={(ref) =>  remoteVideoRefs.current[peer.userId] = ref} playsInline autoPlay />
            <Button img={callIco} name="remote-user-call" onClick={()=>handleCall(peer.userId,peer.socketId!)}/>
          </div>
          )
        }
        )}
      </div>
      <Link className="decline" to={currentChannel?._id ? `/chat/${currentChannel?._id}` : '/chat'}>
          <img src={declineIco} className='decline-img' alt="" />
      </Link>
    </div>
  );
};

export default MultiplePeerComponent;
