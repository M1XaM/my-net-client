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
      className="flex-1 overflow-y-scroll w-full min-h-0 px-7 py-4" 
      id="messageContainer"
    >
      {messages.map(m => (
        <div 
          key={m.id} 
          ref={setMessageRef(m.id)}
          className={`flex ${m.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'} my-4`}
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