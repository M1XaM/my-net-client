import React from 'react';
import { PenTool } from 'lucide-react';

interface ChatHeaderProps {
  username: string;
  onOpenDiagram: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ username, onOpenDiagram }) => (
  <div className="flex justify-between items-center border-b border-white/[0.06] py-5 px-7 flex-shrink-0 bg-[#0a0a0f]/80 backdrop-blur-sm">
    <div className="flex gap-4 items-center">
      <div className="w-12 h-12 bg-gradient-to-br from-[#7B61FF] to-[#5B47CC] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#7B61FF]/20">
        {username.charAt(0).toUpperCase()}
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-lg font-semibold text-white">{username}</p>
        <div className="flex items-center gap-1.5">
          <div className="bg-emerald-400 rounded-full w-2 h-2 animate-pulse"></div>
          <span className="text-gray-400 text-sm">Online</span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={onOpenDiagram}
        className="flex items-center gap-2 bg-[#7B61FF]/10 hover:bg-[#7B61FF]/20 border border-[#7B61FF]/30 transition-all rounded-xl px-4 py-2 cursor-pointer group"
        title="Open Diagram Canvas"
      >
        <PenTool size={18} className="text-[#7B61FF] group-hover:scale-110 transition-transform" />
        <span className="text-[#7B61FF] font-medium text-sm">Draw</span>
      </button>
    </div>
  </div>
);

export default ChatHeader;