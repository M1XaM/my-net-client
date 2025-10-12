import React from 'react';
import { PenTool } from 'lucide-react';
import type { Mode } from './ChatArea';

interface ChatHeaderProps {
  username: string;
  mode: Mode;
  setMode: (mode: Mode) => void;
  onOpenDiagram: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ username, mode, setMode, onOpenDiagram }) => (
  <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
    <h3 className="font-semibold text-gray-800">Chat with {username}</h3>
    <div className="flex items-center space-x-2">
      <button
        onClick={onOpenDiagram}
        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition shadow-md"
        title="Open Diagram Canvas"
      >
        <PenTool size={16} />
        <span className="text-sm font-medium">Draw UML</span>
      </button>
      <span className="text-sm text-gray-600">Mode:</span>
      <select
        value={mode}
        onChange={e => setMode(e.target.value as Mode)}
        className="px-3 py-1 rounded-lg border border-gray-300 bg-white text-sm font-medium focus:ring-2 focus:ring-blue-500"
      >
        <option value="plain">Plain</option>
        <option value="latex">LaTeX</option>
        <option value="markdown">Markdown</option>
        <option value="code">Code</option>
      </select>
    </div>
  </div>
);

export default ChatHeader;