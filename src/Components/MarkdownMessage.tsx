import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownMessageProps {
  content: string;
}

const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content }) => (
  <div className="markdown-content prose prose-sm max-w-none">
    <ReactMarkdown
      components={{
        code({ inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter 
              style={vscDarkPlus} 
              language={match[1]} 
              PreTag="div" 
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className="bg-gray-200 px-1 py-0.5 rounded text-sm" {...props}>
              {children}
            </code>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);

export default MarkdownMessage;