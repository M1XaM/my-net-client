import React from 'react';

interface MessageInputProps {
  newMessage: string;
  onMessageChange: (msg: string) => void;
  onSendMessage: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ newMessage, onMessageChange, onSendMessage }) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      if (newMessage) {
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
      }
    }
  }, [newMessage]);

  return (
    <div className="flex flex-col px-7 py-4 flex-shrink-0 bg-[#EDF2F7] border-t border-gray-200">
      <div className="flex items-end gap-4">
        <div className="cursor-pointer hover:scale-110 transition-transform flex-shrink-0 mb-3">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="outline-none bg-white w-full rounded-lg border-2 border-gray-200 flex items-end overflow-hidden">
          <textarea
            ref={textareaRef}
            className="border-none p-3 outline-none bg-white w-full text-sm resize-none"
            placeholder="Your message..."
            value={newMessage}
            onChange={e => onMessageChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSendMessage();
              }
            }}
            rows={1}
            style={{
              minHeight: '42px',
              maxHeight: '150px',
              height: 'auto'
            }}
          />
          <button 
            className="pr-3 pb-3 cursor-pointer hover:scale-110 transition-transform flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed" 
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