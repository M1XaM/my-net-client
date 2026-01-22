// ChatPage.tsx - Dark Obsidian Theme
import React, { useState } from 'react';
import OnlineUsersSidebar from '../Components/OnlineUsersSidebar';
import ChatArea from '../Components/ChatArea';
import TwoFactorSetup from '../Components/TwoFactorSetup';
import GraphBackground from '../Components/GraphBackground';

interface User {
  id: number;
  username: string;
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  timestamp: string;
}

interface ChatPageProps {
  user: User;
  users: User[];
  selectedUser: User | null;
  messages: Message[];
  newMessage: string;
  accessToken: string | null;
  onSelectUser: (user: User) => void;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onSendMessageWithContent: (content: string) => void;
  onLogout: () => void;
}

const ChatPage: React.FC<ChatPageProps> = ({
  user,
  users,
  selectedUser,
  messages,
  newMessage,
  accessToken,
  onSelectUser,
  onMessageChange,
  onSendMessage,
  onSendMessageWithContent,
  onLogout
}) => {
  const [showSetup, setShowSetup] = useState(false);

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#0a0a0f] relative">
      {/* Graph Background - subtle for chat */}
      <GraphBackground nodeCount={25} />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#7B61FF]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#5B47CC]/5 rounded-full blur-[120px]" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <header className="backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-white/[0.06] px-6 py-4 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#7B61FF] to-[#5B47CC] rounded-xl flex justify-center items-center text-white font-bold text-lg shadow-lg shadow-[#7B61FF]/20">
                M
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">MyNet</h1>
                <p className="text-xs text-gray-500">Secure messaging</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-400">
                  <span className="text-white font-medium">{user.username}</span>
                </span>
              </div>
              <button
                onClick={() => setShowSetup(true)}
                className="bg-[#7B61FF]/10 hover:bg-[#7B61FF]/20 text-[#7B61FF] px-4 py-2 rounded-xl text-sm font-semibold transition-all border border-[#7B61FF]/20 hover:border-[#7B61FF]/40 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                2FA
              </button>
              <button
                onClick={onLogout}
                className="bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 hover:text-white font-medium py-2 px-4 rounded-xl transition-all border border-white/[0.06] hover:border-white/[0.1] flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          <OnlineUsersSidebar
            users={users}
            selectedUser={selectedUser}
            currentUser={user}
            onSelectUser={onSelectUser}
          />

          <ChatArea
            selectedUser={selectedUser}
            messages={messages}
            newMessage={newMessage}
            currentUser={user}
            onMessageChange={onMessageChange}
            onSendMessage={onSendMessage}
            onSendMessageWithContent={onSendMessageWithContent}
          />
        </div>
      </div>

      {/* Modal for 2FA Setup */}
      {showSetup && accessToken && (
        <TwoFactorSetup
          accessToken={accessToken}
          onClose={() => setShowSetup(false)}
          onSuccess={() => {
            alert('2FA is now enabled!');
            setShowSetup(false);
          }}
        />
      )}
    </div>
  );
};

export default ChatPage;
