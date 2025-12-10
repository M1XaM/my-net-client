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
    <div className="flex flex-col px-7 py-4 flex-shrink-0 bg-[#EDF2F7] border-t border-gray-200">
      {helperText && mode !== 'plain' && (
        <div className="mb-2 p-2 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-xs text-purple-700">{helperText}</p>
        </div>
      )}
      <div className="flex items-center gap-4">
        <div className="cursor-pointer hover:scale-110 transition-transform flex-shrink-0">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="outline-none bg-white w-full rounded-lg border-2 border-gray-200 flex items-center overflow-hidden">
          <input
            className="border-none p-3 outline-none bg-white w-full text-sm"
            type="text"
            placeholder={getPlaceholder()}
            value={newMessage}
            onChange={e => onMessageChange(e.target.value)}
            onKeyPress={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSendMessage();
              }
            }}
          />
          <button 
            className="pr-3 cursor-pointer hover:scale-110 transition-transform flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={onSendMessage}
            disabled={!newMessage.trim()}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="#7B61FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;