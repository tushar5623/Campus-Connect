import { useState, useRef } from 'react';
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
    // TURN relay servers — required for mobile carrier NAT (4G/5G CGNAT/symmetric NAT)
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

  // Promise cache — prevents double getUserMedia when startVideoMatching and
  // handleVideoMatched both call ensureLocalStream() concurrently.
  // Without this, two getUserMedia calls race and localStreamRef.current is null
  // when createPeerConnection() runs → no tracks added → both screens black.
  const streamAcquisitionPromiseRef = useRef(null);

  // ─── Stream Attachment ───────────────────────────────────────────────────────

  // Retry via rAF until the video DOM ref is mounted, then set srcObject.
  // Handles the race where attach*Stream() is called before VideoChatRoom mounts.
  const attachStreamWhenReady = (videoRefHolder, stream, retries = 40) => {
    if (!stream) return;
    const attempt = (remaining) => {
      if (videoRefHolder.current) {
        videoRefHolder.current.srcObject = stream;
        videoRefHolder.current
          .play()
          .catch((err) => console.warn('[WebRTC] video.play() rejected:', err));
        return;
      }
      if (remaining <= 0) {
        console.warn('[WebRTC] attachStreamWhenReady: ref never mounted.');
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
      localVideoRef.current.play?.().catch((e) =>
        console.warn('[WebRTC] local video play() rejected:', e)
      );
    } else {
      attachStreamWhenReady(localVideoRef, stream);
    }
  };

  const attachRemoteStream = (stream = remoteStreamRef.current) => {
    if (!stream) return;
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
      remoteVideoRef.current.play?.().catch((e) =>
        console.warn('[WebRTC] remote video play() rejected:', e)
      );
    } else {
      attachStreamWhenReady(remoteVideoRef, stream);
    }
  };

  // ─── Camera Acquisition ──────────────────────────────────────────────────────

  const ensureLocalStream = async () => {
    // Stream already acquired and alive — reuse it
    if (localStreamRef.current) {
      attachLocalStream(localStreamRef.current);
      return localStreamRef.current;
    }

    // *** KEY FIX: Promise cache ***
    // If another caller (e.g. handleVideoMatched) is already waiting for getUserMedia,
    // return the SAME promise instead of spawning a second getUserMedia call.
    // This prevents the race where localStreamRef.current is null when
    // createPeerConnection() runs and no tracks get added to the peer.
    if (streamAcquisitionPromiseRef.current) {
      console.log('[WebRTC] Camera acquisition already in progress — sharing promise.');
      return streamAcquisitionPromiseRef.current;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error(
        'Camera and microphone are not supported in this browser or context. Ensure you are on HTTPS.'
      );
    }

    const audioConstraints = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    };

    // Progressive video constraint fallback: HD → SD → unconstrained
    const videoConstraintProfiles = [
      {
        width: { ideal: 960, max: 1280 },
        height: { ideal: 540, max: 720 },
        frameRate: { ideal: 24, max: 30 },
        facingMode: 'user',
      },
      { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      true, // bare — any camera, any resolution
    ];

    const acquireStream = async () => {
      let stream = null;
      let lastError = null;

      for (const videoConstraint of videoConstraintProfiles) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: videoConstraint,
            audio: audioConstraints,
          });
          break;
        } catch (err) {
          console.warn('[WebRTC] getUserMedia failed, trying next constraint:', err.name);
          lastError = err;
        }
      }

      if (!stream) {
        const name = lastError?.name || '';
        if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
          throw new Error('Camera/microphone access was denied. Please allow permissions and try again.');
        } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
          throw new Error('No camera or microphone found on this device.');
        } else if (name === 'NotReadableError' || name === 'TrackStartError') {
          throw new Error('Your camera is already in use by another app. Close it and try again.');
        }
        throw new Error(lastError?.message || 'Unable to access camera.');
      }

      localStreamRef.current = stream;
      setIsMicOn(true);
      setIsCameraOn(true);
      attachLocalStream(stream);

      // Release promise cache — future calls will reuse localStreamRef directly
      streamAcquisitionPromiseRef.current = null;
      console.log('[WebRTC] ✅ Camera acquired successfully.');
      return stream;
    };

    // Cache the promise so concurrent callers share it
    streamAcquisitionPromiseRef.current = acquireStream();
    return streamAcquisitionPromiseRef.current;
  };

  // ─── Peer Connection ─────────────────────────────────────────────────────────

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
    streamAcquisitionPromiseRef.current = null; // Cancel any pending acquisition
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

    const tracks = localStreamRef.current?.getTracks() ?? [];
    console.log(`[WebRTC] createPeerConnection — adding ${tracks.length} track(s) to peer.`);
    tracks.forEach((track) => {
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
        console.log('[WebRTC] ✅ Remote stream received and attached.');
      }
    };

    peer.onconnectionstatechange = () => {
      console.log(`[WebRTC] Connection state: ${peer.connectionState}`);
      if (['failed', 'disconnected'].includes(peer.connectionState)) {
        setVideoError('Video connection became unstable. Try Next to reconnect with someone new.');
      }
    };

    peer.oniceconnectionstatechange = () => {
      console.log(`[WebRTC] ICE state: ${peer.iceConnectionState}`);
    };

    return peer;
  };

  // ─── ICE Candidate Handling ──────────────────────────────────────────────────

  const addPendingIceCandidates = async (peer) => {
    if (!peer.remoteDescription) return;
    const candidates = pendingIceCandidatesRef.current;
    pendingIceCandidatesRef.current = [];
    for (const candidate of candidates) {
      try {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn('[WebRTC] ICE candidate queued-add failed:', err);
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
      console.warn('[WebRTC] Direct ICE candidate add failed:', err);
    }
  };

  // ─── Media Controls ───────────────────────────────────────────────────────────

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
