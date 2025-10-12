import React from 'react';
import type { Mode } from './ChatArea';

interface MessageInputProps {
  mode: Mode;
  newMessage: string;
  onMessageChange: (msg: string) => void;
  onSendMessage: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ mode, newMessage, onMessageChange, onSendMessage }) => {
  const getPlaceholder = () => {
    switch (mode) {
      case 'latex': return 'Type LaTeX formula (e.g., $E = mc^2$)...';
      case 'markdown': return 'Type Markdown message (supports **bold**, *italic*, etc.)...';
      case 'code': return 'Type code snippet...';
      case 'diagram': return 'Paste diagram JSON...';
      default: return 'Type a message...';
    }
  };

  const getHelperText = () => {
    switch (mode) {
      case 'latex': 
        return 'Use $...$ for inline math, $$...$$ for display math';
      case 'markdown': 
        return 'Supports **bold**, *italic*, `code`, # headers, lists, etc.';
      case 'code': 
        return 'Syntax highlighting supported';
      case 'diagram': 
        return 'Use JSON format with nodes and connections. Click "Show Example" below.';
      default: 
        return null;
    }
  };

  const insertDiagramExample = () => {
    const exampleDiagram = JSON.stringify({
      nodes: [
        { id: "1", label: "Start", x: 50, y: 50, width: 100, height: 60, type: "ellipse", color: "#10B981" },
        { id: "2", label: "Process", x: 200, y: 50, width: 120, height: 60, type: "rect", color: "#3B82F6" },
        { id: "3", label: "Decision", x: 200, y: 150, width: 100, height: 80, type: "diamond", color: "#F59E0B" },
        { id: "4", label: "End", x: 350, y: 150, width: 100, height: 60, type: "ellipse", color: "#EF4444" }
      ],
      connections: [
        { from: "1", to: "2", type: "solid" },
        { from: "2", to: "3", label: "Check", type: "solid" },
        { from: "3", to: "4", label: "Yes", type: "solid" },
        { from: "3", to: "2", label: "No", type: "dashed" }
      ]
    }, null, 2);
    onMessageChange(exampleDiagram);
  };

  const helperText = getHelperText();

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      {helperText && mode !== 'plain' && (
        <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex justify-between items-center">
            <p className="text-xs text-blue-700">{helperText}</p>
            {mode === 'diagram' && (
              <button
                onClick={insertDiagramExample}
                className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition"
              >
                Show Example
              </button>
            )}
          </div>
        </div>
      )}
      <div className="flex space-x-2">
        <textarea
          value={newMessage}
          onChange={e => onMessageChange(e.target.value)}
          placeholder={getPlaceholder()}
          onKeyPress={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSendMessage();
            }
          }}
          rows={mode === 'diagram' ? 4 : 1}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <button
          onClick={onSendMessage}
          disabled={!newMessage.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed self-end"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default MessageInput;