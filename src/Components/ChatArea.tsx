import React, { useState } from 'react';
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import MessageList from './MessageList';
import DiagramCanvas from './DiagramCanvas';

export interface User { id: number; username: string; }
export interface Message { id: number; sender_id: number; receiver_id: number; content: string; timestamp: string; }

interface ChatAreaProps {
  selectedUser: User | null;
  messages: Message[];
  newMessage: string;
  currentUser: User | null;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onSendMessageWithContent: (content: string) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  selectedUser, messages, newMessage, currentUser, onMessageChange, onSendMessage, onSendMessageWithContent
}) => {
  const [showDiagramCanvas, setShowDiagramCanvas] = useState(false);

  const handleOpenDiagram = () => {
    setShowDiagramCanvas(true);
  };

  const handleCloseDiagram = () => {
    setShowDiagramCanvas(false);
  };

  const handleSendDiagram = (imageData: string) => {
    // Send the image data directly without relying on state
    onSendMessageWithContent(imageData);
    setShowDiagramCanvas(false);
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#EDF2F7]">
        <div className="text-center p-6">
          <div className="text-gray-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg">Select a user to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 bg-[#EDF2F7] flex flex-col overflow-y-scroll">
        <ChatHeader 
          username={selectedUser.username} 
          onOpenDiagram={handleOpenDiagram}
        />
        <MessageList messages={messages} currentUser={currentUser}/>
        <MessageInput 
          newMessage={newMessage} 
          onMessageChange={onMessageChange} 
          onSendMessage={onSendMessage} 
        />
      </div>

      {showDiagramCanvas && (
        <DiagramCanvas 
          onClose={handleCloseDiagram}
          onSend={handleSendDiagram}
          selectedUser={selectedUser}
        />
      )}
    </>
  );
};

export default ChatArea;