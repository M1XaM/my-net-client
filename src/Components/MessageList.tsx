import { useEffect, useRef } from 'react';
import type { User, Message } from './ChatArea';
import MessageItem from './MessageItem';

interface MessageListProps {
  messages: Message[];
  currentUser: User | null;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUser }) => {
  const messageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const lastMessageElement = messageRefs.current.get(lastMessage.id);
      
      if (lastMessageElement) {
        lastMessageElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [messages]);

  const setMessageRef = (id: number) => (element: HTMLDivElement | null) => {
    if (element) {
      messageRefs.current.set(id, element);
    } else {
      messageRefs.current.delete(id);
    }
  };

  return (
    <div
      className="flex-1 overflow-y-auto w-full min-h-0 px-7 py-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent" 
      id="messageContainer"
    >
      {messages.length === 0 && (
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
        </div>
      )}
      {messages.map(m => (
        <div 
          key={m.id} 
          ref={setMessageRef(m.id)}
          className={`flex ${m.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'} my-3`}
        >
          <MessageItem 
            message={m} 
            isOwn={m.sender_id === currentUser?.id}
          />
        </div>
      ))}
    </div>
  );
};

export default MessageList;