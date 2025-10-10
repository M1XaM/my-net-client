import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid once
let mermaidInitialized = false;
if (!mermaidInitialized) {
  mermaid.initialize({ 
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    logLevel: 'error', // Suppress console logs
  });
  mermaidInitialized = true;
}

interface MermaidMessageProps {
  content: string;
}

const MermaidMessage: React.FC<MermaidMessageProps> = ({ content }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    
    const renderDiagram = async () => {
      try {
        setError(null);
        ref.current!.innerHTML = '';
        
        // Generate unique ID for this diagram
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Validate content is not empty
        if (!content || content.trim() === '') {
          setError('Empty diagram content');
          return;
        }

        // Render the diagram
        const { svg } = await mermaid.render(id, content.trim());
        
        if (ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError('Invalid diagram syntax');
      }
    };

    renderDiagram();
  }, [content]);

  if (error) {
    return (
      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-xs text-red-600 font-medium">⚠️ {error}</p>
        <p className="text-xs text-red-500 mt-1">Check your Mermaid syntax</p>
      </div>
    );
  }

  return <div ref={ref} className="mermaid-diagram my-2" />;
};

export default MermaidMessage;