import { useState, useRef, useEffect } from 'react';
import socket from '../socket';

// Bug #4 Fix: Added TURN servers so WebRTC works on carrier/mobile NAT (4G/5G CGNAT/symmetric NAT)
// Without TURN, peer connections fail on most mobile networks.
const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.services.mozilla.com' },
    { urls: 'stun:global.stun.twilio.com:3478' },
    // Free TURN relay servers — required for symmetric NAT (most mobile carriers)
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
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

  // Bug #3 Fix: Poll via rAF until the video DOM ref is mounted, then set srcObject.
  // This eliminates the race condition where attach*Stream() is called before the
  // VideoChatRoom component mounts and populates the ref.
  const attachStreamWhenReady = (videoRefHolder, stream, retries = 30) => {
    if (!stream) return;
    const attempt = (remaining) => {
      if (videoRefHolder.current) {
        videoRefHolder.current.srcObject = stream;
        videoRefHolder.current
          .play()
          .catch((err) => console.warn('Video play() rejected:', err));
        return;
      }
      if (remaining <= 0) {
        console.warn('attachStreamWhenReady: ref never mounted after max retries.');
        return;
      }
      requestAnimationFrame(() => attempt(remaining - 1));
    };
    attempt(retries);
  };

  const attachLocalStream = (stream = localStreamRef.current) => {
    if (!stream) return;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.play?.().catch((err) =>
        console.warn('Local video play() rejected:', err)
      );
    } else {
      // Ref not yet mounted — wait for it
      attachStreamWhenReady(localVideoRef, stream);
    }
  };

  const attachRemoteStream = (stream = remoteStreamRef.current) => {
    if (!stream) return;
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
      remoteVideoRef.current.play?.().catch((err) =>
        console.warn('Remote video play() rejected:', err)
      );
    } else {
      // Ref not yet mounted — wait for it
      attachStreamWhenReady(remoteVideoRef, stream);
    }
  };

  // Bug #1 Fix: Progressive constraint fallback for getUserMedia.
  // Many phone cameras (especially front-facing on Android) reject the specific
  // resolution constraints with an OverconstrainedError, causing a silent failure.
  // We try HD → SD → bare { video: true } to maximise device compatibility.
  const ensureLocalStream = async () => {
    if (localStreamRef.current) {
      attachLocalStream(localStreamRef.current);
      return localStreamRef.current;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error(
        'Camera and microphone are not supported in this browser or context. Make sure you are on HTTPS.'
      );
    }

    const audioConstraints = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    };

    // Constraint profiles in order of preference (most specific → most permissive)
    const videoConstraintProfiles = [
      // HD — ideal for desktop/high-end phones
      {
        width: { ideal: 960, max: 1280 },
        height: { ideal: 540, max: 720 },
        frameRate: { ideal: 24, max: 30 },
        facingMode: 'user',
      },
      // SD — works on most mid-range Android phones
      {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user',
      },
      // Bare minimum — any camera, any resolution
      true,
    ];

    let stream = null;
    let lastError = null;

    for (const videoConstraint of videoConstraintProfiles) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraint,
          audio: audioConstraints,
        });
        break; // Success — stop trying
      } catch (err) {
        console.warn('getUserMedia failed with constraint profile, trying next:', videoConstraint, err);
        lastError = err;
      }
    }

    if (!stream) {
      // Surface a user-friendly error based on the actual error type
      const name = lastError?.name || '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        throw new Error(
          'Camera/microphone access was denied. Please allow permissions in your browser settings and try again.'
        );
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        throw new Error(
          'No camera or microphone found on this device.'
        );
      } else if (name === 'NotReadableError' || name === 'TrackStartError') {
        throw new Error(
          'Your camera is already in use by another app. Close it and try again.'
        );
      }
      throw new Error(
        lastError?.message || 'Unable to access camera. Please check your device and permissions.'
      );
    }

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
        setVideoError(
          'Video connection became unstable. Try Next to reconnect with someone new.'
        );
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
