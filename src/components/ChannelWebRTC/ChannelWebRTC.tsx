import React, { useEffect, useRef, useState } from 'react';
import SocketStore from '../SocketStore';
import Peer from 'peerjs';
import { ChannelType } from '../types';
import { Socket } from 'socket.io-client';

const { io, certOptions, serverUrl } = SocketStore();

const Video: React.FC<{ peer: Peer.Instance,muted:boolean }> = ({ peer,muted}) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref?.current) {
      peer?.on("stream", (stream) => {
        ref.current!.srcObject = stream;
      });
    }
  }, [peer]);

  return <video muted playsInline autoPlay ref={ref} />;
};

const videoConstraints = {
  height: window.innerHeight / 2,
  width: window.innerWidth / 2,
};

const ChannelWebRTC: React.FC<{ channel: ChannelType }> = ({ channel }) => {
  const [peers, setPeers] = useState<Peer.Instance[]>([]);
  const socketRef = useRef<Socket<any>>();
  const userVideo = useRef<HTMLVideoElement>(null);
  const peersRef = useRef<{ peerID: string; peer: Peer.Instance }[]>([]);
  const roomID = channel?._id;

  useEffect(() => {
    socketRef.current = io(`${serverUrl}/currentChannelCall`, certOptions);

    const initPeerConnection = async function () {
      let stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true });
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }

      socketRef?.current?.emit("join room", roomID);
      socketRef?.current?.on("all users", (users: string[]) => {
        const peers: Peer.Instance[] = [];
        users.forEach((userID: string) => {
          const peer = createPeer(userID, socketRef.current!.id, stream);
          peersRef.current.push({
            peerID: userID,
            peer,
          });
          peers.push(peer);
        });
        setPeers(peers);
      });

      socketRef.current?.on("user joined", (payload: { signal: any; callerID: string; stream: MediaStream }) => {
        const peer = addPeer(payload.signal, payload.callerID, stream);
        peersRef.current.push({
          peerID: payload.callerID,
          peer,
        });
        setPeers((users) => [...users, peer]);
      });

      socketRef.current?.on("receiving returned signal", (payload: { id: string; signal: any }) => {
        const item = peersRef.current.find((p) => p.peerID === payload.id);
        if (item) {
          item.peer?.signal(payload.signal);
        }
      });
    };

    initPeerConnection();
  }, []);

  function createPeer(userToSignal: string, callerID: string, stream: MediaStream) {
    const peer = new Peer(callerID, {
      host: serverUrl,
      port: 9000,
      path: "/myapp",
    });

    peer.on("signal", (signal: any) => {
      socketRef.current?.emit("sending signal", { userToSignal, callerID, signal });
    });

    peer.on("error", (error: any) => {
      console.log("PeerJS error:", error);
    });

    return peer;
  }

  function addPeer(incomingSignal: any, callerID: string, stream: MediaStream) {
    const peer = new Peer(callerID, {
      host: serverUrl,
      port: 9000,
      path: "/myapp",
    });

    peer.on("signal", (signal: any) => {
      socketRef.current?.emit("returning signal", { signal, callerID });
    });

    peer.on("error", (error: any) => {
      console.log("PeerJS error:", error);
    });

    peer.signal(incomingSignal);

    return peer;
  }

  return (
    <div className="channel__webrtc">
      <video muted={true} ref={userVideo} />
      {peers.map((peer, index) => (
        <Video muted={false} key={index} peer={peer} />
      ))}
    </div>
  );
};

export default ChannelWebRTC;
