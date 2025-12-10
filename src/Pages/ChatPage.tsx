// ChatPage.tsx
import React, { useState } from 'react';
import OnlineUsersSidebar from '../Components/OnlineUsersSidebar';
import ChatArea from '../Components/ChatArea';
import TwoFactorSetup from '../Components/TwoFactorSetup';

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
  error: string;
  accessToken: string | null;  // ← This is required
  onSelectUser: (user: User) => void;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onLogout: () => void;
}

const ChatPage: React.FC<ChatPageProps> = ({
  user,
  users,
  selectedUser,
  messages,
  newMessage,
  error,
  accessToken,  // ADD THIS
  onSelectUser,
  onMessageChange,
  onSendMessage,
  onLogout
}) => {
  // Hooks must be INSIDE the component function
  const [showSetup, setShowSetup] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-[#EDF2F7]">
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#7B61FF] rounded-xl flex justify-center items-center text-white font-bold text-lg">
              M
            </div>
            <h1 className="text-xl font-bold text-gray-900">MyNet</h1>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">Welcome, <span className="font-semibold text-gray-900">{user.username}</span></span>
            <button
              onClick={() => setShowSetup(true)}
              className="bg-[#7B61FF19] hover:bg-[#7B61FF40] text-[#7B61FF] px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Enable 2FA
            </button>
            <button
              onClick={onLogout}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-1.5 px-4 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
          {error}
        </div>
      )}

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
        />
      </div>

      {/* Modal for 2FA Setup - inside the return statement */}
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