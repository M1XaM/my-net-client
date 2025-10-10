import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface LatexMessageProps {
  content: string;
  isOwnMessage: boolean;
}

const LatexMessage: React.FC<LatexMessageProps> = ({ content, isOwnMessage }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const parts: Array<{ type: 'text' | 'inline-math' | 'display-math'; content: string }> = [];
    let currentIndex = 0;
    const mathRegex = /(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$)/g;
    let match;

    while ((match = mathRegex.exec(content)) !== null) {
      if (match.index > currentIndex) {
        parts.push({
          type: 'text',
          content: content.substring(currentIndex, match.index)
        });
      }
      const mathContent = match[0];
      if (mathContent.startsWith('$$') && mathContent.endsWith('$$')) {
        parts.push({
          type: 'display-math',
          content: mathContent.slice(2, -2).trim()
        });
      } else if (mathContent.startsWith('$') && mathContent.endsWith('$')) {
        parts.push({
          type: 'inline-math',
          content: mathContent.slice(1, -1).trim()
        });
      }
      currentIndex = match.index + mathContent.length;
    }

    if (currentIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.substring(currentIndex)
      });
    }

    if (parts.length === 0) {
      parts.push({ type: 'text', content });
    }

    containerRef.current.innerHTML = '';
    parts.forEach(part => {
      if (part.type === 'text') {
        const textSpan = document.createElement('span');
        textSpan.textContent = part.content;
        containerRef.current?.appendChild(textSpan);
      } else {
        const mathSpan = document.createElement('span');
        try {
          katex.render(part.content, mathSpan, {
            displayMode: part.type === 'display-math',
            throwOnError: false,
            output: 'html'
          });
          if (part.type === 'display-math') {
            mathSpan.style.display = 'block';
            mathSpan.style.margin = '10px 0';
          }
        } catch (error) {
          mathSpan.textContent = `[LaTeX Error: ${part.content}]`;
          mathSpan.style.color = isOwnMessage ? '#fee' : '#fcc';
        }
        containerRef.current?.appendChild(mathSpan);
      }
    });
  }, [content, isOwnMessage]);

  return <div ref={containerRef} className="latex-content" />;
};

export default LatexMessage;