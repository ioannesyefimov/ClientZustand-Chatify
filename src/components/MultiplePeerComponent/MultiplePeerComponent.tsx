import React, { useEffect, useRef, useState } from 'react';
import SocketStore from '../SocketStore';
import { ChannelType } from '../types';
import { Socket } from 'socket.io-client';
import './ChannelWebRTC.scss'
import { useAuthStore, useChatStore } from '../../ZustandStore';
import Button from '../Button/Button';
import { callIco, cameraIco, declineIco } from '../../assets';
import { Link, useNavigate } from 'react-router-dom';
import { sleep } from '../utils';
import CallNavigation from '../CallNavigation/CallNavigation';

const { io, certOptions, serverUrl } = SocketStore();

export interface Peer {
  socketId?:string
  userId: string;
  peerConnection: RTCPeerConnection
}
const socket = io(`${serverUrl}/current-channel-call`,{pfx: certOptions.pfx,passphrase:certOptions.passphrase,autoConnect:false}); // Replace with your Socket.IO server URL

const MultiplePeerComponent = ({currentChannel}:{currentChannel:ChannelType}) => {
  const [peers, setPeers] = useState<Peer[]>([]);
  const [joinedPeers,setJoinedPeers]=useState<string[]>([])
  const [me,setMe]=useState('')
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});
  const userStreamRef = useRef<MediaStream>();
  const user = useAuthStore(s=>s.user)
  const navigate = useNavigate()
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
      console.log(`joinedPeers:`,joinedPeers);
      console.log(`peers:`,peers);
      if(joinedPeers?.length){
        
        for (let userId of joinedPeers){
         for (let peer of peers){
            if(userId=== peer.userId){
              handleCallingPeer(peer.peerConnection, peer.userId, peer.socketId!)
            } 
          }
        }
      }
    },[joinedPeers]
  )
  
  useEffect(
    ()=>{
    function onUsers (data: {user:{userId:string,socketId:string,}}[]){
      if(!data) return
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
    }
    function onOffer({ userId, offer,from ,fromSocket}: {from:string; userId: string; offer: RTCSessionDescriptionInit,fromSocket:string }) {
      const peer = peers.find((p) => p.userId === from);
      console.log(`getting offer for ${userId} from ${from}:`,offer);
      console.log(`peer`,peer);
      console.log(`peers`,peers);
      
      if (peer && !peer.peerConnection.localDescription) {
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

    function onJoinRoom(userId:string){
      console.log(`peers`, peers)
      console.log(`joined room with id ${userId}`)
      setJoinedPeers(prev=>[...prev,userId])
      // if(!userId)return
      // let peer = peers.find(peer=>peer.userId===userId)
      // if(!peer )return console.log(`peer is ${peer}`);
      // handleCallingPeer(peer.peerConnection,peer.userId,peer.socketId!)
      
    }
    function onIceCandidate({ userId,socketId, candidate }: { userId: string;socketId:string; candidate: RTCIceCandidate }) {
      const peer = peers.find((p) => p.userId === userId);
      console.log(`peers`,peers);
      console.log(`ice candidate triggered for ${socketId}; id:${userId}`,candidate);
      if(peer) {
        peer.peerConnection
          .addIceCandidate(candidate)
          .catch((error) => {
            console.log('Error adding ICE candidate:', error);
          });
      } else {
        return console.log(`PC IS undefined`)
      }
        }
    function onCallPeers(userId:string){
      console.log(`call-peers triggered`,userId);
      if(!userId || userId === user._id)return
      let peer = peers.find(peer=>peer.userId===userId)
      console.log(`peers `,peers);
      console.log(`peer `,peer);
      if(!peer)return
      handleCallingPeer(peer.peerConnection,peer.userId,peer.socketId!)
    }
    socket.on('call-peers',onCallPeers)
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
      socket.off('call-peers',onCallPeers)
      socket.off('users',onUsers)
      socket.off('answer',onAnswer)
      socket.off('iceCandidate',onIceCandidate)
    }
    },[peers.length]
  )
  

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
  const handleCallingPeer = (peer:RTCPeerConnection, userId: string,socketId:string) => {
    console.log(`CALLING ${userId}`);
    console.log(`calling peer:`, peer);
      peer.createOffer()
        .then((offer) => peer.setLocalDescription(offer))
        .then(() => {
          socket.emit('offer', { userId,from:user._id,fromSocket:socket.id,fromUserId:user?._id, socketId, offer: peer.localDescription });
        })
        .catch((error) => {
          console.log('Error creating or setting local description:', error);
        });
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
          return (
          <div className='remote-user' key={peer.userId}>
            <video className={`remote-user-video`}  data-id={peer.userId} ref={(ref) =>  remoteVideoRefs.current[peer.userId] = ref} playsInline autoPlay />
            {
              peer.peerConnection.connectionState !== 'connected' ?   (
                <Button img={callIco} name="remote-user-call" onClick={()=>handleCall(peer.userId,peer.socketId!)}/>

              ) : null
            }
          </div>
          )
        }
        )}
      </div>
      <CallNavigation peers={peers} userStreamRef={userStreamRef} remoteVideoRefs={remoteVideoRefs} userVideoRef={userVideoRef} socket={socket} setPeers={setPeers} setJoinedPeers={setJoinedPeers} channel={currentChannel}/> 
    </div>
  );
};

export default MultiplePeerComponent;
