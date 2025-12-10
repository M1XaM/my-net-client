import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeMessageProps {
  content: string;
  language?: string;
}

const CodeMessage: React.FC<CodeMessageProps> = ({ content, language = 'javascript' }) => {
  // Try to detect language from first line if it looks like ```language
  const detectLanguage = () => {
    const match = content.match(/^```(\w+)\n/);
    if (match) return match[1];
    return language;
  };

  // Remove language marker if present
  const cleanContent = content.replace(/^```\w+\n/, '').replace(/```$/, '');

  return (
    <div className="code-message">
      <SyntaxHighlighter 
        style={vscDarkPlus} 
        language={detectLanguage()}
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          padding: '1rem'
        }}
        wrapLines={true}
        wrapLongLines={true}
      >
        {cleanContent}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeMessage;