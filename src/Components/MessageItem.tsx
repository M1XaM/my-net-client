import React from 'react';
import type { Message, Mode } from './ChatArea';
import LatexMessage from './LatexMessage';
import MarkdownMessage from './MarkdownMessage';
import CodeMessage from './CodeMessage';
import MermaidMessage from './MermaidMessage';

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  mode: Mode;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isOwn, mode }) => {
  const renderContent = () => {
    // Don't render if content is empty
    if (!message.content || message.content.trim() === '') {
      return <span className="text-gray-400 italic">Empty message</span>;
    }

    switch (mode) {
      case 'latex': 
        return <LatexMessage content={message.content} isOwnMessage={isOwn} />;
      case 'markdown': 
        return <MarkdownMessage content={message.content} />;
      case 'code': 
        return <CodeMessage content={message.content} />;
      case 'mermaid': 
        // Only render Mermaid if content looks like a diagram
        if (message.content.includes('graph') || 
            message.content.includes('flowchart') || 
            message.content.includes('sequenceDiagram') ||
            message.content.includes('classDiagram') ||
            message.content.includes('stateDiagram') ||
            message.content.includes('erDiagram') ||
            message.content.includes('journey') ||
            message.content.includes('gantt') ||
            message.content.includes('pie')) {
          return <MermaidMessage content={message.content} />;
        }
        // Otherwise show as plain text
        return <span className="whitespace-pre-wrap">{message.content}</span>;
      case 'plain':
      default: 
        return <span className="whitespace-pre-wrap">{message.content}</span>;
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-lg p-3 ${
        isOwn 
          ? 'bg-blue-500 text-white' 
          : 'bg-white border border-gray-200 text-gray-800'
      }`}>
        <div className="message-content">
          {renderContent()}
        </div>
        <div className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;