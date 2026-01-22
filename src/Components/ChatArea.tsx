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
    onSendMessageWithContent(imageData);
    setShowDiagramCanvas(false);
  };

  const handleSendFile = (base64Content: string) => {
    onSendMessageWithContent(base64Content);
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0a0f]/40 backdrop-blur-sm">
        <div className="text-center p-8">
          {/* Animated icon */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-[#7B61FF]/20 rounded-2xl blur-xl animate-pulse" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-[#7B61FF]/20 to-[#5B47CC]/20 rounded-2xl border border-white/[0.1] flex items-center justify-center">
              <svg className="w-10 h-10 text-[#7B61FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Select a conversation</h3>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">
            Choose a user from the sidebar to start chatting with them
          </p>
          
          {/* Feature hints */}
          <div className="mt-8 flex flex-wrap gap-2 justify-center max-w-sm mx-auto">
            {['Code', 'LaTeX', 'Markdown', 'Images', 'UML'].map((feature) => (
              <span 
                key={feature}
                className="px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs text-gray-400"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 bg-[#0a0a0f]/40 backdrop-blur-sm flex flex-col overflow-hidden border-l border-white/[0.03]">
        <ChatHeader 
          username={selectedUser.username} 
          onOpenDiagram={handleOpenDiagram}
        />
        <MessageList messages={messages} currentUser={currentUser}/>
        <MessageInput 
          newMessage={newMessage} 
          onMessageChange={onMessageChange} 
          onSendMessage={onSendMessage}
          onSendFile={handleSendFile}
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
