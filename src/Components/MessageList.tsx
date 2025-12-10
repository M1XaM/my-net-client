import React, { useEffect, useRef } from 'react';
import type { User, Message } from './ChatArea';
import MessageItem from './MessageItem';

interface MessageListProps {
  messages: Message[];
  currentUser: User | null;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUser }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-scroll w-full min-h-0 px-7" id="messageContainer">
      {messages.map(m => (
        <div key={m.id} className={`flex ${m.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'} my-4`}>
          <MessageItem 
            message={m} 
            isOwn={m.sender_id === currentUser?.id}
          />
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;