import React from 'react';
import type { Mode } from './ChatArea';

interface MessageInputProps {
  mode: Mode;
  newMessage: string;
  onMessageChange: (msg: string) => void;
  onSendMessage: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ mode, newMessage, onMessageChange, onSendMessage }) => {
  const getPlaceholder = () => {
    switch (mode) {
      case 'latex': return 'Type LaTeX formula (e.g., $E = mc^2$)...';
      case 'markdown': return 'Type Markdown message (supports **bold**, *italic*, etc.)...';
      case 'code': return 'Type code snippet...';
      default: return 'Type a message...';
    }
  };

  const getHelperText = () => {
    switch (mode) {
      case 'latex': 
        return 'Use $...$ for inline math, $$...$$ for display math';
      case 'markdown': 
        return 'Supports **bold**, *italic*, `code`, # headers, lists, etc.';
      case 'code': 
        return 'Syntax highlighting supported';
      default: 
        return null;
    }
  };

  const helperText = getHelperText();

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      {helperText && mode !== 'plain' && (
        <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">{helperText}</p>
        </div>
      )}
      <div className="flex space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={e => onMessageChange(e.target.value)}
          placeholder={getPlaceholder()}
          onKeyPress={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSendMessage();
            }
          }}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={onSendMessage}
          disabled={!newMessage.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default MessageInput;