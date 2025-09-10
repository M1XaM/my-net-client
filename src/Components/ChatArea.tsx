// ChatArea.tsx
import React from 'react';

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

interface ChatAreaProps {
  selectedUser: User | null;
  messages: Message[];
  newMessage: string;
  currentUser: User | null;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  selectedUser,
  messages,
  newMessage,
  currentUser,
  onMessageChange,
  onSendMessage
}) => {
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
      <div className="p-4 border-b border-gray-200 bg-white">
        <h3 className="font-semibold text-gray-800">Chat with {selectedUser.username}</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-4">
          {messages.map(m => (
            <div 
              key={m.id} 
              className={`flex ${m.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-lg p-3 ${m.sender_id === currentUser?.id ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                <div className="message-content">{m.content}</div>
                <div className={`text-xs mt-1 ${m.sender_id === currentUser?.id ? 'text-blue-100' : 'text-gray-500'}`}>
                  {new Date(m.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={e => onMessageChange(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={e => e.key === 'Enter' && onSendMessage()}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button 
            onClick={onSendMessage}
            disabled={!newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;