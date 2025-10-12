import React, { useState } from 'react';
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import MessageList from './MessageList';

export interface User { id: number; username: string; }
export interface Message { id: number; sender_id: number; receiver_id: number; content: string; timestamp: string; }
export type Mode = 'plain' | 'latex' | 'markdown' | 'code' | 'diagram';

interface ChatAreaProps {
  selectedUser: User | null;
  messages: Message[];
  newMessage: string;
  currentUser: User | null;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  selectedUser, messages, newMessage, currentUser, onMessageChange, onSendMessage
}) => {
  const [mode, setMode] = useState<Mode>('plain');

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center p-6">
          <div className="text-gray-400 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-gray-500">Select a user to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
      <ChatHeader username={selectedUser.username} mode={mode} setMode={setMode} />
      <MessageList messages={messages} currentUser={currentUser} mode={mode} />
      <MessageInput 
        mode={mode} 
        newMessage={newMessage} 
        onMessageChange={onMessageChange} 
        onSendMessage={onSendMessage} 
      />
    </div>
  );
};

export default ChatArea;