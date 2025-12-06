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
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">ChatApp</h1>
          <div className="flex items-center space-x-4">
            <span className="font-medium">Welcome, {user.username}</span>
            <button
              onClick={() => setShowSetup(true)}
              className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded text-sm"
            >
              Enable 2FA
            </button>
            <button
              onClick={onLogout}
              className="bg-white text-blue-600 hover:bg-blue-100 font-medium py-1 px-3 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden container mx-auto p-4 gap-4">
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