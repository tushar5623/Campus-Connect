import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import socket from '../socket';

export const useChatSocket = (webRTC) => {
  const [appState, setAppState] = useState('idle');
  const [roomId, setRoomId] = useState(null);
  const [activeMode, setActiveMode] = useState('text');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [isBanned, setIsBanned] = useState(false);
  const [isStrangerTyping, setIsStrangerTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(1);
  const typingTimeoutRef = useRef(null);

  const appStateRef = useRef(appState);
  const roomIdRef = useRef(roomId);

  useEffect(() => {
    appStateRef.current = appState;
  }, [appState]);

  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  useEffect(() => {
    const myEmail = localStorage.getItem('userEmail');
    if (!myEmail) {
      window.location.href = '/';
      return;
    }

    const handleRegister = () => {
      console.log("🚀 Attempting to register with backend...");
      socket.emit('register_user', myEmail);
    };

    const handleVideoMatched = async (data) => {
      try {
        setActiveMode('video');
        setRoomId(data.roomId);
        setAppState('videoChatting');
        setMessages([]);
        webRTC.setVideoError('');

        await webRTC.ensureLocalStream();
        const peer = webRTC.createPeerConnection(data.roomId);

        if (data.initiator) {
          const offer = await peer.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });
          await peer.setLocalDescription(offer);
          socket.emit('video_offer', { roomId: data.roomId, offer });
        }
      } catch (error) {
        console.error('Video match setup failed:', error);
        webRTC.setVideoError(error.message || 'Unable to start video chat.');
        setAppState('idle');
        setRoomId(null);
        webRTC.cleanupVideoCall();
      }
    };

    const onVideoOffer = async ({ offer }) => {
      try {
        await webRTC.handleVideoOffer({ offer }, roomIdRef.current);
      } catch (error) {
        console.error('Video offer failed:', error);
        webRTC.setVideoError('Could not accept the video call. Please try Next.');
      }
    };

    const onVideoAnswer = async ({ answer }) => {
      try {
        await webRTC.handleVideoAnswer({ answer });
      } catch (error) {
        console.error('Video answer failed:', error);
        webRTC.setVideoError('Could not complete the video connection. Please try Next.');
      }
    };

    const onVideoIceCandidate = async ({ candidate }) => {
      try {
        await webRTC.handleVideoIceCandidate({ candidate });
      } catch (error) {
        console.error('ICE candidate failed:', error);
      }
    };

    if (socket.connected) {
      handleRegister();
    }

    socket.on('connect', handleRegister);
    socket.on('live_user_count', (count) => setOnlineUsers(count));
    socket.on('waiting', () => {
      setActiveMode('text');
      setAppState('searching');
    });
    socket.on('video_waiting', () => {
      setActiveMode('video');
      setAppState('searching');
    });
    socket.on('matched', (data) => {
      webRTC.cleanupVideoCall();
      setActiveMode('text');
      setRoomId(data.roomId);
      setAppState('chatting');
      setMessages([]);
    });
    socket.on('video_matched', handleVideoMatched);
    socket.on('video_offer', onVideoOffer);
    socket.on('video_answer', onVideoAnswer);
    socket.on('video_ice_candidate', onVideoIceCandidate);

    socket.on('receive_message', (msg) => setMessages(prev => [...prev, msg]));
    socket.on('stranger_typing', () => setIsStrangerTyping(true));
    socket.on('stranger_stopped', () => setIsStrangerTyping(false));

    socket.on('partner_left', (msg) => {
      if (appStateRef.current === 'videoChatting') {
        webRTC.cleanupVideoCall();
        setRoomId(null);
        setAppState('idle');
        toast('Your video partner left the call.');
      } else {
        setMessages(prev => [...prev, { text: msg, sender: 'system' }]);
      }
    });

    socket.on('you_are_blocked', () => {
      console.log("🚨 BAN HAMMER RECEIVED!");
      setIsBanned(true);
    });

    return () => {
      socket.off('connect', handleRegister);
      socket.off('live_user_count');
      socket.off('waiting');
      socket.off('video_waiting');
      socket.off('matched');
      socket.off('video_matched', handleVideoMatched);
      socket.off('video_offer', onVideoOffer);
      socket.off('video_answer', onVideoAnswer);
      socket.off('video_ice_candidate', onVideoIceCandidate);
      socket.off('receive_message');
      socket.off('partner_left');
      socket.off('you_are_blocked');
      socket.off('stranger_typing');
      socket.off('stranger_stopped');
      webRTC.cleanupVideoCall();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startMatching = () => {
    webRTC.cleanupVideoCall();
    setActiveMode('text');
    socket.emit('find_match');
  };

  const startVideoMatching = async () => {
    try {
      setActiveMode('video');
      webRTC.setVideoError('');
      setAppState('searching');
      await webRTC.ensureLocalStream();
      socket.emit('find_video_match');
    } catch (error) {
      console.error('Camera permission failed:', error);
      setAppState('idle');
      webRTC.setVideoError(error.message || 'Please allow camera and microphone access to start video chat.');
      toast.error('Please allow camera and microphone access.');
      webRTC.cleanupVideoCall();
    }
  };

  const handleTyping = (e) => {
    setInputMessage(e.target.value);
    if (roomId) {
      socket.emit('typing', roomId);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', roomId);
      }, 2000);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() === '') return;
    const myMessage = { text: inputMessage, sender: 'me' };
    setMessages((prev) => [...prev, myMessage]);
    socket.emit('send_message', { roomId, message: inputMessage });
    setInputMessage('');
  };

  const handleLeave = () => {
    if (roomId) {
      socket.emit('leave_chat', roomId);
    }
    webRTC.cleanupVideoCall();
    setAppState('idle');
    setRoomId(null);
    setMessages([]);
  };

  const handleReportSubmit = () => {
    if (!selectedReason) {
      toast.error("Please select a reason first!");
      return;
    }
    socket.emit('report_user', { roomId, reason: selectedReason });
    setIsReportModalOpen(false);
    setSelectedReason('');
    handleNext();
    toast.success("Report submitted. Finding a new mate...");
  };

  const handleNext = () => {
    if (roomId) {
      socket.emit('leave_chat', roomId);
    }
    setRoomId(null);
    setMessages([]);

    if (activeMode === 'video') {
      webRTC.cleanupVideoCall({ stopCamera: false });
      setAppState('searching');
      socket.emit('find_video_match');
      return;
    }

    webRTC.cleanupVideoCall();
    setAppState('searching');
    socket.emit('find_match');
  };

  const cancelSearch = () => {
    socket.emit('cancel_search');
    webRTC.cleanupVideoCall();
    setAppState('idle');
  };

  const handleFullLogout = async () => {
    try {
      if (roomId) {
        socket.emit('leave_chat', roomId);
      }
      webRTC.cleanupVideoCall();
      await signOut(auth);
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return {
    appState,
    roomId,
    activeMode,
    messages,
    inputMessage,
    isReportModalOpen,
    setIsReportModalOpen,
    selectedReason,
    setSelectedReason,
    isBanned,
    isStrangerTyping,
    onlineUsers,
    startMatching,
    startVideoMatching,
    handleTyping,
    sendMessage,
    handleLeave,
    handleReportSubmit,
    handleNext,
    cancelSearch,
    handleFullLogout,
  };
};
