import React from 'react';
import { PenTool } from 'lucide-react';

interface ChatHeaderProps {
  username: string;
  onOpenDiagram: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ username, onOpenDiagram }) => (
  <div className="flex justify-between items-center border-b border-gray-200 py-5 px-7 flex-shrink-0 bg-[#EDF2F7]">
    <div className="flex gap-4 items-center">
      <div className="w-12 h-12 bg-gradient-to-br from-[#7B61FF] to-[#5B47CC] rounded-lg flex items-center justify-center text-white font-bold text-lg">
        {username.charAt(0).toUpperCase()}
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-lg font-semibold text-gray-900">{username}</p>
        <div className="flex items-center gap-1">
          <div className="bg-green-400 rounded-full w-2.5 h-2.5"></div>
          <span className="text-gray-500 text-sm font-semibold">Online</span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={onOpenDiagram}
        className="flex items-center gap-2 bg-[#7B61FF19] hover:bg-[#7B61FF40] transition-colors rounded-lg px-3 py-2 cursor-pointer"
        title="Open Diagram Canvas"
      >
        <PenTool size={18} color="#7B61FF" />
        <span className="text-[#7B61FF] font-semibold text-sm">Draw</span>
      </button>
    </div>
  </div>
);

export default ChatHeader;