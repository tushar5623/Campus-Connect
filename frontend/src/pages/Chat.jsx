import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebRTC } from '../hooks/useWebRTC';
import { useChatSocket } from '../hooks/useChatSocket';
import { Navbar } from '../components/layout/Navbar';
import { DashboardView } from '../components/dashboard/DashboardView';
import { SearchingRadar } from '../components/common/SearchingRadar';
import { BannedView } from '../components/common/BannedView';
import { TextChatRoom } from '../components/chat/TextChatRoom';
import { VideoChatRoom } from '../components/video/VideoChatRoom';
import { ReportModal } from '../components/modals/ReportModal';

const Chat = () => {
  const navigate = useNavigate();
  const [dummyState, setDummyState] = useState(0); // Trigger re-render if needed
  
  // Custom hooks
  const webRTC = useWebRTC(null, null);
  const chat = useChatSocket(webRTC);

  // Derive user name
  const userName = localStorage.getItem('userName')?.split(' ')[0] || 'Student';

  if (chat.isBanned) {
    return <BannedView onFullLogout={chat.handleFullLogout} />;
  }

  return (
    <div className="relative flex h-full min-h-[100dvh] w-full flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* Background Ambient Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[130px] dark:bg-indigo-600/15" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px] dark:bg-cyan-600/15" />
      </div>

      {/* Top Application Navbar */}
      <Navbar
        onlineUsers={chat.onlineUsers}
        userName={userName}
        appState={chat.appState}
        onFullLogout={chat.handleFullLogout}
        onNavigateHome={() => chat.appState === 'idle' && navigate('/')}
      />

      {/* View Machine */}
      <main className="relative z-10 flex flex-1 flex-col overflow-y-auto px-4 py-6 md:px-6">
        {chat.appState === 'idle' && (
          <DashboardView
            videoError={webRTC.videoError}
            onStartMatching={chat.startMatching}
            onStartVideoMatching={chat.startVideoMatching}
            onNavigateWelcome={() => navigate('/')}
          />
        )}

        {chat.appState === 'searching' && (
          <SearchingRadar
            activeMode={chat.activeMode}
            onCancelSearch={chat.cancelSearch}
          />
        )}

        {chat.appState === 'chatting' && (
          <TextChatRoom
            messages={chat.messages}
            inputMessage={chat.inputMessage}
            isStrangerTyping={chat.isStrangerTyping}
            onTyping={chat.handleTyping}
            onSendMessage={chat.sendMessage}
            onOpenReportModal={() => chat.setIsReportModalOpen(true)}
            onNext={chat.handleNext}
            onLeave={chat.handleLeave}
          />
        )}

        {chat.appState === 'videoChatting' && (
          <VideoChatRoom
            webRTC={webRTC}
            onOpenReportModal={() => chat.setIsReportModalOpen(true)}
            onNext={chat.handleNext}
            onLeave={chat.handleLeave}
          />
        )}
      </main>

      {/* Report Modal Dialog */}
      <ReportModal
        isOpen={chat.isReportModalOpen}
        selectedReason={chat.selectedReason}
        onSelectReason={chat.setSelectedReason}
        onSubmitReport={chat.handleReportSubmit}
        onClose={() => chat.setIsReportModalOpen(false)}
      />

    </div>
  );
};

export default Chat;
