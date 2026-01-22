import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownMessageProps {
  content: string;
}

interface CodeProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content }) => (
  <div className="markdown-content prose prose-sm prose-invert max-w-none">
    <ReactMarkdown
      components={{
        code({ inline, className, children, ...props }: CodeProps) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter 
              style={vscDarkPlus} 
              language={match[1]} 
              PreTag="div" 
              customStyle={{
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                margin: '0.5rem 0'
              }}
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className="bg-white/10 text-[#a78bfa] px-2 py-0.5 rounded text-sm font-mono" {...props}>
              {children}
            </code>
          );
        },
        p: ({ children }) => <p className="mb-2 last:mb-0 text-gray-200">{children}</p>,
        strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
        em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
        a: ({ children, href }) => (
          <a href={href} className="text-[#7B61FF] hover:text-[#a78bfa] underline" target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        )
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);

export default MarkdownMessage;