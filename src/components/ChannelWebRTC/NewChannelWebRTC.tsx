import React, { useEffect, useRef, useState } from 'react';
import  { Socket } from 'socket.io-client';
import SocketStore from '../SocketStore';
const {certOptions,serverUrl,io} = SocketStore()
interface VideoCallComponentProps {
  remoteUserId: string;
}

const VideoCallComponent: React.FC<VideoCallComponentProps> = ({ remoteUserId }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const [peerConnections, setPeerConnections] = useState<Record<string, RTCPeerConnection>>({});
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to Socket.IO server
    socketRef.current = io('http://localhost:8000'); // Replace with your Socket.IO server URL

    // Handle incoming offers
    socketRef.current.on('offer', ({ userId, offer }: { userId: string; offer: string }) => {
      handleOffer(userId, offer);
    });

    // Handle incoming ICE candidates
    socketRef.current.on('ice-candidate', ({ userId, candidate }: { userId: string; candidate: RTCIceCandidateInit }) => {
      handleIceCandidate(userId, candidate);
    });

    // Get local media stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        // Display local stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Store the stream tracks in the state
        const tracks = stream.getTracks();
        setPeerConnections((prevPeerConnections) => {
          const updatedPeerConnections = { ...prevPeerConnections };
          Object.keys(updatedPeerConnections).forEach((userId) => {
            const peerConnection = updatedPeerConnections[userId];
            tracks.forEach((track) => {
              peerConnection.addTrack(track, stream);
            });
          });
          return updatedPeerConnections;
        });
      })
      .catch((error) => {
        console.log('Error accessing media devices:', error);
      });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const initializePeerConnection = (userId: string) => {
    const peerConnection = new RTCPeerConnection();

    // Add event listeners to handle ICE candidates and track changes in connection state
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('ice-candidate', { userId, candidate: event.candidate });
      }
    };

    peerConnection.oniceconnectionstatechange = () => {
      console.log(`ICE connection state change for user ${userId}:`, peerConnection.iceConnectionState);
    };

    peerConnection.ontrack = (event) => {
      // Attach the remote track to the corresponding video element
      const remoteVideo = remoteVideoRefs.current[userId];
      if (remoteVideo) {
        remoteVideo.srcObject = event.streams[0];
      }
    };

    // Store the peer connection in the state
    setPeerConnections((prevPeerConnections) => ({
      ...prevPeerConnections,
      [userId]: peerConnection,
    }));
  };

  const handleOffer = (userId: string, offer: string) => {
    if (!peerConnections[userId]) {
      initializePeerConnection(userId);
    }

    const peerConnection = peerConnections[userId];
    const offerSdp = new RTCSessionDescription({ type: 'offer', sdp: offer });

    peerConnection.setRemoteDescription(offerSdp)
      .then(() => {
        // Get local media stream tracks
        const localStream = localVideoRef.current?.srcObject as MediaStream;
        const tracks = localStream.getTracks();

        tracks.forEach((track) => {
          peerConnection.addTrack(track, localStream);
        });

        // Create answer and set it as local description
        return peerConnection.createAnswer();
      })
      .then((answer) => {
        return peerConnection.setLocalDescription(answer);
      })
      .then(() => {
        // Send the answer to the remote user
        socketRef.current?.emit('answer', { userId, answer: peerConnection.localDescription?.sdp });
      })
      .catch((error) => {
        console.log('Error creating or setting local description:', error);
      });
  };

  const handleIceCandidate = (userId: string, candidate: RTCIceCandidateInit) => {
    if (!peerConnections[userId]) {
      initializePeerConnection(userId);
    }

    const peerConnection = peerConnections[userId];
    const iceCandidate = new RTCIceCandidate(candidate);

    peerConnection.addIceCandidate(iceCandidate)
      .catch((error) => {
        console.log('Error adding ICE candidate:', error);
      });
  };

  const handleCall = (userId: string) => {
    if (!peerConnections[userId]) {
      initializePeerConnection(userId);
    }

    const peerConnection = peerConnections[userId];
    const localStream = localVideoRef.current?.srcObject as MediaStream;
    const tracks = localStream.getTracks();

    tracks.forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    peerConnection.createOffer()
      .then((offer) => {
        return peerConnection.setLocalDescription(offer);
      })
      .then(() => {
        // Send the offer to the remote user
        socketRef.current?.emit('offer', { userId, offer: peerConnection.localDescription?.sdp });
      })
      .catch((error) => {
        console.log('Error creating or setting local description:', error);
      });
  };

  return (
    <div>
      <video ref={localVideoRef} autoPlay muted />
      {Object.keys(peerConnections).map((userId) => (
        <video key={userId} ref={(ref) => { remoteVideoRefs.current[userId] = ref; }} autoPlay />
      ))}
      <button onClick={() => handleCall(remoteUserId)}>Call</button>
    </div>
  );
};

export default VideoCallComponent;
