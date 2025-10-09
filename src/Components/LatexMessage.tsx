import React, { memo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface LatexMessageProps {
  content: string;
  isOwnMessage: boolean;
  isLatexMode?: boolean;
}

const LatexMessage: React.FC<LatexMessageProps> = ({ content, isOwnMessage, isLatexMode }) => {
  // If LaTeX mode is active = no KaTeX
  if (isLatexMode) {
    return (
      <pre className={`whitespace-pre-wrap ${isOwnMessage ? 'text-white bg-blue-500 p-2 rounded-lg' : 'text-gray-800 bg-white p-2 border border-gray-200 rounded-lg'}`}>
        {content}
      </pre>
    );
  }

  // Normal KaTeX rendering mode
  const renderContent = () => {
    const parts: Array<{ type: 'text' | 'inline-math' | 'display-math'; content: string }> = [];
    let currentIndex = 0;
    const mathRegex = /(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$)/g;
    let match;

    while ((match = mathRegex.exec(content)) !== null) {
      if (match.index > currentIndex) {
        parts.push({ type: 'text', content: content.substring(currentIndex, match.index) });
      }
      const mathContent = match[0];
      if (mathContent.startsWith('$$') && mathContent.endsWith('$$')) {
        parts.push({ type: 'display-math', content: mathContent.slice(2, -2).trim() });
      } else if (mathContent.startsWith('$') && mathContent.endsWith('$')) {
        parts.push({ type: 'inline-math', content: mathContent.slice(1, -1).trim() });
      }
      currentIndex = match.index + mathContent.length;
    }
    if (currentIndex < content.length) {
      parts.push({ type: 'text', content: content.substring(currentIndex) });
    }
    return parts;
  };

  return (
    <div className="latex-content">
      {renderContent().map((part, index) => {
        if (part.type === 'text') return <span key={index}>{part.content}</span>;
        const mathSpan = document.createElement('span');
        try {
          katex.render(part.content, mathSpan, {
            displayMode: part.type === 'display-math',
            throwOnError: false,
            output: 'html',
          });
          return <span key={index} dangerouslySetInnerHTML={{ __html: mathSpan.innerHTML }} />;
        } catch (e) {
          return <span key={index} style={{ color: isOwnMessage ? '#fee' : '#fcc' }}>[LaTeX Error]</span>;
        }
      })}
    </div>
  );
};

export default memo(LatexMessage);
