import React from 'react';
import type { Message } from './ChatArea';
import UnifiedMessage from "./UnifiedMessage"

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isOwn }) => {
  // Check if message content is a base64 image
  const isImage = () => {
    return message.content.startsWith('data:image/');
  };

  const renderContent = () => {
    if (!message.content || message.content.trim() === '') {
      return <span className="text-gray-400 italic">Empty message</span>;
    }

    // If it's an image (diagram), always render as image
    if (isImage()) {
      return (
        <div className="diagram-image-container">
          <img
            src={message.content}
            alt="Diagram"
            className="max-w-full h-auto rounded-lg border-2 border-gray-200 shadow-md"
            style={{ maxHeight: '400px', objectFit: 'contain' }}
          />
          <p className="text-xs text-gray-500 mt-2 italic">📊 UML Diagram</p>
        </div>
      );
    }

    // Otherwise render based on current mode
    // switch () {
    //   case 'latex': 
    //     return <LatexMessage content={message.content} isOwnMessage={isOwn} />;
    //   case 'markdown': 
    //     return <MarkdownMessage content={message.content} />;
    //   case 'code': 
    //     return <CodeMessage content={message.content} />;
    //   case 'plain':
    //   default: 
    //     return <span className="whitespace-pre-wrap">{message.content}</span>;
    // }

    return <UnifiedMessage content={message.content} isOwnMessage={isOwn} />
  };

  return (
    <div className={`${isImage() ? 'max-w-[75%]' : 'max-w-[75%] md:max-w-[60%]'} p-3 rounded-lg ${isOwn
        ? 'bg-[#7B61FF] text-white'
        : 'bg-white text-black shadow-sm'
      }`}>
      <div className="message-content">
        {renderContent()}
      </div>
      <div className={`text-[12px] mt-1 ${isOwn ? 'text-white/70' : 'text-black/70'}`}>
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
};

export default MessageItem;