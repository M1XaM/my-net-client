import React, { useState } from 'react';
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import MessageList from './MessageList';

export interface User { id: number; username: string; }
export interface Message { id: number; sender_id: number; receiver_id: number; content: string; timestamp: string; }
export type Mode = 'plain' | 'latex' | 'markdown' | 'code' | 'mermaid';

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
        <p className="text-gray-500">Select a user to start chatting</p>
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
