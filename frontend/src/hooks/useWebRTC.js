import { useState, useRef, useEffect } from 'react';
import socket from '../socket';

const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.services.mozilla.com' },
    { urls: 'stun:global.stun.twilio.com:3478' },
  ],
  iceCandidatePoolSize: 10,
};

export const useWebRTC = (appState, roomId) => {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isRemoteStreamReady, setIsRemoteStreamReady] = useState(false);
  const [videoError, setVideoError] = useState('');

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const pendingIceCandidatesRef = useRef([]);

  const attachLocalStream = (stream = localStreamRef.current) => {
    if (localVideoRef.current && stream) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.play?.().catch(() => {});
    }
  };

  const attachRemoteStream = (stream = remoteStreamRef.current) => {
    if (remoteVideoRef.current && stream) {
      remoteVideoRef.current.srcObject = stream;
      remoteVideoRef.current.play?.().catch(() => {});
    }
  };

  const ensureLocalStream = async () => {
    if (localStreamRef.current) {
      attachLocalStream(localStreamRef.current);
      return localStreamRef.current;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Camera and microphone are not available in this browser.');
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 960, max: 1280 },
        height: { ideal: 540, max: 720 },
        frameRate: { ideal: 24, max: 30 },
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    localStreamRef.current = stream;
    setIsMicOn(true);
    setIsCameraOn(true);
    attachLocalStream(stream);
    return stream;
  };

  const closePeerConnection = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onconnectionstatechange = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    pendingIceCandidatesRef.current = [];
    setIsRemoteStreamReady(false);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    remoteStreamRef.current = null;
  };

  const stopLocalMedia = () => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  };

  const cleanupVideoCall = ({ stopCamera = true } = {}) => {
    closePeerConnection();
    if (stopCamera) stopLocalMedia();
    setVideoError('');
  };

  const createPeerConnection = (videoRoomId) => {
    closePeerConnection();
    const peer = new RTCPeerConnection(rtcConfig);
    peerConnectionRef.current = peer;

    localStreamRef.current?.getTracks().forEach((track) => {
      peer.addTrack(track, localStreamRef.current);
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('video_ice_candidate', {
          roomId: videoRoomId,
          candidate: event.candidate,
        });
      }
    };

    peer.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteStream) {
        remoteStreamRef.current = remoteStream;
        attachRemoteStream(remoteStream);
        setIsRemoteStreamReady(true);
      }
    };

    peer.onconnectionstatechange = () => {
      if (['failed', 'disconnected'].includes(peer.connectionState)) {
        setVideoError('Video connection became unstable. Try Next to reconnect with someone new.');
      }
    };

    return peer;
  };

  const addPendingIceCandidates = async (peer) => {
    if (!peer.remoteDescription) return;
    const candidates = pendingIceCandidatesRef.current;
    pendingIceCandidatesRef.current = [];
    for (const candidate of candidates) {
      try {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn('ICE candidate addition failed:', err);
      }
    }
  };

  const handleVideoOffer = async ({ offer }, currentRoomId) => {
    await ensureLocalStream();
    const peer = createPeerConnection(currentRoomId);
    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    await addPendingIceCandidates(peer);

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    socket.emit('video_answer', { roomId: currentRoomId, answer });
  };

  const handleVideoAnswer = async ({ answer }) => {
    const peer = peerConnectionRef.current;
    if (!peer) return;
    await peer.setRemoteDescription(new RTCSessionDescription(answer));
    await addPendingIceCandidates(peer);
  };

  const handleVideoIceCandidate = async ({ candidate }) => {
    const peer = peerConnectionRef.current;
    if (!candidate) return;

    if (!peer || !peer.remoteDescription) {
      pendingIceCandidatesRef.current.push(candidate);
      return;
    }

    try {
      await peer.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.warn('Direct ICE candidate addition failed:', err);
    }
  };

  const toggleMic = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (!audioTrack) return;
    audioTrack.enabled = !audioTrack.enabled;
    setIsMicOn(audioTrack.enabled);
  };

  const toggleCamera = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (!videoTrack) return;
    videoTrack.enabled = !videoTrack.enabled;
    setIsCameraOn(videoTrack.enabled);
  };

  return {
    localVideoRef,
    remoteVideoRef,
    isMicOn,
    isCameraOn,
    isRemoteStreamReady,
    videoError,
    setVideoError,
    ensureLocalStream,
    createPeerConnection,
    cleanupVideoCall,
    attachLocalStream,
    attachRemoteStream,
    handleVideoOffer,
    handleVideoAnswer,
    handleVideoIceCandidate,
    toggleMic,
    toggleCamera,
  };
};
