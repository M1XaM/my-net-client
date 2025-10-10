import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidMessageProps {
  content: string;
}

const MermaidMessage: React.FC<MermaidMessageProps> = ({ content }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    try {
      ref.current.innerHTML = '';
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      const div = document.createElement('div');
      div.className = 'mermaid';
      div.id = id;
      div.textContent = content;
      ref.current.appendChild(div);
      mermaid.init(undefined, div);
    } catch {
      ref.current.innerHTML = `[Mermaid Error]`;
    }
  }, [content]);

  return <div ref={ref} />;
};

export default MermaidMessage;
