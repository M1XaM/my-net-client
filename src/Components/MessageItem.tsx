import React from 'react';
import type { Message, Mode } from './ChatArea';
import LatexMessage from './LatexMessage';
import MarkdownMessage from './MarkdownMessage.tsx';
import CodeMessage from './CodeMessage.tsx';
import MermaidMessage from './MermaidMessage.tsx';

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  mode: Mode;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isOwn, mode }) => {
  const renderContent = () => {
    switch (mode) {
      case 'latex': return <LatexMessage content={message.content} isOwnMessage={isOwn} isLatexMode />;
      case 'markdown': return <MarkdownMessage content={message.content} />;
      case 'code': return <CodeMessage content={message.content} />;
      case 'mermaid': return <MermaidMessage content={message.content} />;
      case 'plain':
      default: return <span>{message.content}</span>;
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-lg p-3 ${isOwn ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
        {renderContent()}
        <div className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
