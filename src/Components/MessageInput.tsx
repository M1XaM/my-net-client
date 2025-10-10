import React from 'react';
import { Mode } from './ChatArea';

interface MessageInputProps {
  mode: Mode;
  newMessage: string;
  onMessageChange: (msg: string) => void;
  onSendMessage: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ mode, newMessage, onMessageChange, onSendMessage }) => (
  <div className="p-4 border-t border-gray-200 bg-white">
    <div className="flex space-x-2">
      <input
        type="text"
        value={newMessage}
        onChange={e => onMessageChange(e.target.value)}
        placeholder={
          mode === 'latex'
            ? "Type LaTeX formula..."
            : mode === 'markdown'
            ? "Type Markdown message..."
            : mode === 'code'
            ? "Type code snippet..."
            : mode === 'mermaid'
            ? "Type Mermaid diagram..."
            : "Type a message..."
        }
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
);

export default MessageInput;
