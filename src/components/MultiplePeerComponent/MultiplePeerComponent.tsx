import React, { LegacyRef, ReactElement, ReactNode, useEffect, useRef, useState } from 'react';
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
import Hamburger from '../HamburgerMenu/Hamburger';
import { useWindowSize } from '../../hooks';

const { io, certOptions, serverUrl } = SocketStore();

export interface Peer {
  socketId?:string
  userId: string;
  peerConnection: RTCPeerConnection
  userName: string
}
const socket = io(`${serverUrl}/current-channel-call`,{pfx: certOptions.pfx,passphrase:certOptions.passphrase,autoConnect:false}); // Replace with your Socket.IO server URL

const MultiplePeerComponent = ({currentChannel,channel_id, children}:{currentChannel:ChannelType; channel_id:string; children?:ReactNode | ReactElement}) => {
  const [peers, setPeers] = useState<Peer[]>([]);
  
  const [joinedPeers,setJoinedPeers]=useState<string[]>([])
  const [me,setMe]=useState('')
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});
  const userStreamRef = useRef<MediaStream>();
  const user = useAuthStore(s=>s.user)
  const navigate = useNavigate()
  const [reload,setReload]=useState(false)
  const localUserRef = useRef<HTMLDivElement>()
  const remoteUsersRef = useRef<{ [key: string]: HTMLDivElement }>({})
  const senders = useRef<{[key:string]: RTCRtpSender}>({})
  const audioSources = useRef<{[key:string]:MediaStreamAudioSourceNode}>({})
  const userAudioSource =useRef<MediaStreamAudioSourceNode>()
  const checkingPeerConnectionRefCount = useRef(0)
  const setServerResponse = useAuthStore(s=>s.setServerResponse)
  const {width}=useWindowSize()
  useEffect(() => {
    socket.connect()
    socket.on('connect',async ()=>{
      setMe(socket.id)
      console.log(user,` connected to channelCall socket by ID: ${socket?.id}`)
      socket.emit('join_room', {user,room:currentChannel._id})
    })
    return ()=>{
      if(socket.connected){
        socket.disconnect();
      }
      setMe('')
    }
  }, [reload]);
  // }, []);

  useEffect(
    ()=>{
    function onUsers (data: {user:{userId:string,socketId:string,userName:string}}[]){
      if(!data) return
      console.log(`users`,data);
      data=data?.filter(userId=>userId?.user.userId!==user?._id && userId !== null)
      console.log(`filtered users`,data);
      if(!data) return console.log(`usersIDS IS ${data}`)
      
      const newPeers = data?.map((user) => ({
        userId:user?.user.userId,
        socketId: user?.user.socketId,
        peerConnection: initializePeerConnection(user?.user.userId,user?.user?.socketId),
        userName:user.user.userName
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
        peer.peerConnection.setRemoteDescription(answer).catch((error) => {
          console.log('Error setting remote description:', error);
        });
      }
    }
    // function onJoinRoom(userId:string){
    //   console.log(`peers`, peers)
    //   console.log(`joined room with id ${userId}`)
    //   let Peer = peers.find(peer=>peer.userId===userId)
    //   if(!Peer) return
    //   handleCallingPeer(Peer.peerConnection,Peer.userId,Peer.socketId!)
    // }
    function onJoinRoom(data:{userId:string,socketId:string,userName:string}){
      console.log(`peers`, peers)
      console.log(`joined room with id ${data.userId}`)
      let isInRoom = peers.find(peer=>peer.userId===data.userId)
      if(isInRoom){
        sleep(1000).then(()=>{
          socket.emit('joinCallUser',data.userId)
        })
        return
      }
      let Peer =  {
        userId:data.userId,
        socketId: data.socketId,
        peerConnection: initializePeerConnection(data.userId,data.socketId),
        userName:data.userName
      }
      setPeers(prev=>[...prev,Peer])
      sleep(1000).then(()=>{
        socket.emit('joinCallUser',data.userId)
      })
    }
    function onJoinCallUser(userId:string){
      console.log(`peers`, peers)
      console.log(`joined room with id ${userId}`)
      let Peer = peers.find(peer=>peer.userId===userId)
      if(!Peer) return
      handleCallingPeer(Peer.peerConnection,Peer.userId,Peer.socketId!)
    }
    function onIceCandidate({ userId,socketId, candidate,fromUserId }: { userId: string;socketId:string; candidate: RTCIceCandidate; fromUserId:string }) {
      const peer = peers.find((p) => p.userId === userId);
      console.log(`peers`,peers);
      console.log(`ice candidate triggered for ${socketId}; id:${userId}`,candidate);
      if(peer) {
        if(!peer.peerConnection.remoteDescription) return socket.emit('call-peer',{userId:user?._id,fromUserId})
        peer.peerConnection
          .addIceCandidate(candidate)
          .catch((error) => {
            console.log('Error adding ICE candidate:', error);
          });
      } else {
        return console.log(`PC IS undefined`)
      }
        }
    function onUserDisconnected(userId:string){
      console.log(`user disconnected id:`,userId)
      setPeers(prev=>prev.filter(peer=>peer.userId!==userId))
    }
    socket.on('joinCallUser',onJoinCallUser)
    socket.on('user-disconnected',onUserDisconnected)
    socket.on('offer', onOffer);
    socket.on('answer',onAnswer);
    socket.on('iceCandidate', onIceCandidate);
    socket.on('userRemoved',(userId)=>{
      console.log(`USER ${userId} has been removed`)
      setPeers(prev=>prev.filter(peer=>peer.userId !== userId))
    })
    socket.on('users', onUsers);
    socket.on('join_room',onJoinRoom)
    console.log(`initializing current channel call`);
    return () => {
      socket.off('offer',onOffer)
      socket.off('joinCallUser',onJoinCallUser)
      socket.off('join_room',onJoinRoom)
      socket.off('users',onUsers)
      socket.off('answer',onAnswer)
      socket.off('iceCandidate',onIceCandidate)
    }
    },[peers]
  )

  useEffect(
    ()=>{
      let unFocusUser = (e:any)=>{
        if(e.code!=='Escape')return
        let localUser =localUserRef?.current
        let remoteUsers = remoteUsersRef.current
        if(localUser?.classList.contains('focused-user')) {
          localUser.classList.toggle('focused-user')
          return
        }
        for(let remoteUser in remoteUsers){
          if(remoteUsers[remoteUser].classList.contains('focused-user')){
            remoteUsers[remoteUser].classList.toggle('focused-user')
            return
          }
        }
      }
      window.addEventListener('keydown',unFocusUser)
      return ()=>{window.removeEventListener('keydown',unFocusUser)}
    },[]
  )
  
  // useEffect(
  //   ()=>{
  //     const checkPeerConnection = async ()=>{
  //       console.log(`checking peer connection status...`);
  //       console.log(`checking count`,checkingPeerConnectionRefCount.current);
  //       if(!peers?.length) return
  //       peers.forEach( peer=>{
  //         console.log(`peerConnection ${peer.userId} = ${peer.peerConnection.connectionState}`)
  //         let {connectionState} = peer.peerConnection
  //         if(checkingPeerConnectionRefCount?.current > 2 && connectionState !=='connected'){
  //             setReload(prev=>!prev)
  //             checkingPeerConnectionRefCount.current = 0
  //         } else 
  //         if(connectionState ===  'failed'){
  //           setReload(prev=>!prev)

  //         } 
  //         if(connectionState === 'new' || connectionState=== 'closed' ||connectionState=== 'connecting' ){
  //           checkingPeerConnectionRefCount.current++
  //         } else if (connectionState ==='connected'){
  //           checkingPeerConnectionRefCount.current = 0
  //         }
  //       })p
  //     let interval = setInterval(checkPeerConnection,20000)
  //     return ()=>{clearInterval(interval)}
  //   },[peers.length]
  // )

  useEffect(() => {
    const initializeMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        userStreamRef.current = stream;

        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
        }
        
        peers.forEach((peer) => {
        console.log(`initializing media stream`);
          const tracks = stream.getTracks();
          tracks.forEach((track) => {
          const sender = peer.peerConnection.addTrack(track, stream);
          senders.current[peer.userId] = sender
            console.log(`senders:`,senders.current);
            console.log(`sender:`,sender);
            (sender as any).onremovetrack  = () => {
              console.log('Remote user stopped sending video');
            }
          });
        });
      } catch (error) {
        console.log('Error accessing media devices:', error);
        // setServerResponse(error)
      }
    };
    initializeMediaStream()
  }, [peers]);
  const initializePeerConnection = (userId: string,socketId:string) => {
    const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
    const peerConnection = new RTCPeerConnection(configuration);
    console.log("🚀 ~ file: MultiplePeerComponent.tsx:263 ~ initializePeerConnection ~ peerConnection:", peerConnection)
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.emit('iceCandidate', { userId:user._id,socketId, candidate: event.candidate });
      }
    };
    peerConnection.ontrack = ({track,streams:[stream]}) => {
      console.log(`peer video triggered`,track);
      if (remoteVideoRefs.current[userId]) {
        console.log(`triggered remote video ref`,stream);
        console.log(`peer:`,remoteVideoRefs.current[userId]);
        remoteVideoRefs.current[userId].srcObject = stream;
        console.log(remoteVideoRefs.current[userId].srcObject, 'THIS IS SRC OBJ OF THE REF ' + userId)
        stream.onremovetrack = ({track})=>{
          console.log(`${track.kind} was removed userId: ${userId}`)
          if(!stream.getTracks().length){
            console.log(`stream ${stream.id} emptied (effectively removed).`);      
          }
        }
      }
        let audioContext = new AudioContext()
        const source = audioContext.createMediaStreamSource(stream)
        audioSources.current[userId] = source
        const analyser = audioContext.createAnalyser()
        source.connect(analyser)
        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        let threshold = 0.9
        console.log("🚀 ~ file: MultiplePeerComponent.tsx:313 ~ checkIfUserIsSpeaking ~ remoteVideoRefs:", remoteVideoRefs)
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
          remoteVideoRefs.current[userId]?.classList.add('speaking')
        } else if(averageVolume < threshold) {
          remoteVideoRefs.current[userId]?.classList.remove('speaking')
        }
        // Call the function again to continuously monitor the audio
        requestAnimationFrame(checkIfUserIsSpeaking);
      }
        // Start monitoring the audio
        checkIfUserIsSpeaking();
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
  const handleFocusedStream = (e:React.MouseEvent<HTMLDivElement>)=>{
    console.log(`e:`,e);
    if(!e?.currentTarget) return 
    e.currentTarget?.classList.toggle('focused-user')
  }
  return (
    <>
      <div   className='channel-webrtc'>
      <div ref={localUserRef as LegacyRef<HTMLDivElement>} onClick={(e)=>handleFocusedStream(e)}  id={user?._id} className='local-user '>
        <video className='local-user-video ' ref={userVideoRef} playsInline autoPlay muted />
        <p className="local-user-name">You</p>
      </div>
      <div  className='remote-users'>
        {
        peers.map(
          (peer) => {
            return (
            <div ref={(ref)=>remoteUsersRef.current[peer.userId] = ref!} onClick={(e)=>handleFocusedStream(e)} id={peer.userId} className={`remote-user `} key={peer.userId}>
              <video style={{backgroundImage:`url()`}} className={`remote-user-video`}  data-id={peer.userId} ref={(ref) => remoteVideoRefs.current[peer.userId] = ref!} playsInline autoPlay />
              <p className="remote-user-name">{peer.userName}</p>
          </div>
          )
        }
        )}
      </div>
      <CallNavigation userAudioSource={userAudioSource.current!} senders={senders.current} peers={peers} userStreamRef={userStreamRef} remoteVideoRefs={remoteVideoRefs} userVideoRef={userVideoRef} socket={socket} setPeers={setPeers} setJoinedPeers={setJoinedPeers} channel={currentChannel}/> 
    </div>
    <Hamburger type='messages' animation={{loaded:'loaded',toggled:'appearFromRight',untoggled:'disappearToRight'
  }} isHamburger={width > 700 ?   false : true}>
      {children ? children : null}
    </Hamburger>

    </>
    
  );
};
export default MultiplePeerComponent;