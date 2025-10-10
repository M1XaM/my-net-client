import React, { useEffect, useRef } from 'react';
import type { User, Message, Mode } from './ChatArea';
import MessageItem from './MessageItem';

interface MessageListProps {
  messages: Message[];
  currentUser: User | null;
  mode: Mode;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUser, mode }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      <div className="space-y-4">
        {messages.map(m => (
          <MessageItem 
            key={m.id} 
            message={m} 
            isOwn={m.sender_id === currentUser?.id} 
            mode={mode} 
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default MessageList;