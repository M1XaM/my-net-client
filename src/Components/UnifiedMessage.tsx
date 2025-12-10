import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface UnifiedMessageProps {
  content: string;
  isOwnMessage?: boolean;
}

// Add inline styles to prevent KaTeX from creating huge gaps
const mathStyles = `
  .katex-html {
    overflow: hidden !important;
    max-width: 100% !important;
  }
  .katex-display {
    margin: 0.5em 0 !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
  }
  .katex {
    font-size: 1em !important;
  }
`;

const UnifiedMessage: React.FC<UnifiedMessageProps> = ({ content, isOwnMessage = false }) => {
  // Process content to handle LaTeX and convert to markdown-compatible format
  const processContent = (text: string): string => {
    let processed = text;
    
    // Protect code blocks from LaTeX processing
    const codeBlocks: string[] = [];
    processed = processed.replace(/```[\s\S]*?```/g, (match) => {
      codeBlocks.push(match);
      return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
    });
    
    // Protect inline code from LaTeX processing
    const inlineCodes: string[] = [];
    processed = processed.replace(/`[^`]+`/g, (match) => {
      inlineCodes.push(match);
      return `__INLINE_CODE_${inlineCodes.length - 1}__`;
    });
    
    // Replace display math ($...$) with custom markers
    processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
      return `___DISPLAY_MATH___${math}___END_DISPLAY_MATH___`;
    });
    
    // Replace inline math ($...$) with custom markers
    processed = processed.replace(/\$([^\$\n]+)\$/g, (_, math) => {
      return `___INLINE_MATH___${math}___END_INLINE_MATH___`;
    });
    
    // Restore code blocks
    processed = processed.replace(/__CODE_BLOCK_(\d+)__/g, (_, index) => {
      return codeBlocks[parseInt(index)];
    });
    
    // Restore inline codes
    processed = processed.replace(/__INLINE_CODE_(\d+)__/g, (_, index) => {
      return inlineCodes[parseInt(index)];
    });
    
    return processed;
  };

  const renderContent = () => {
    const processedContent = processContent(content);
    const parts: React.ReactNode[] = [];
    let currentText = '';
    let key = 0;

    // Split by display math
    const displayMathSplit = processedContent.split(/___DISPLAY_MATH___([\s\S]*?)___END_DISPLAY_MATH___/);
    
    displayMathSplit.forEach((part, index) => {
      if (index % 2 === 0) {
        // Regular text (may contain inline math)
        const inlineMathSplit = part.split(/___INLINE_MATH___(.*?)___END_INLINE_MATH___/);
        
        inlineMathSplit.forEach((segment, segIndex) => {
          if (segIndex % 2 === 0) {
            // Regular markdown text
            if (segment) {
              currentText += segment;
            }
          } else {
            // Inline math
            if (currentText) {
              parts.push(
                <ReactMarkdown
                  key={`md-${key++}`}
                  components={{
                    code({ inline, className, children, ...props }: any) {
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
                        <code className={`px-2 py-0.5 rounded text-sm font-mono ${
                          isOwnMessage 
                            ? 'bg-white/20 text-white' 
                            : 'bg-purple-100 text-[#7B61FF]'
                        }`} {...props}>
                          {children}
                        </code>
                      );
                    },
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    strong: ({ children }) => <strong className={`font-bold ${isOwnMessage ? 'text-white' : 'text-gray-900'}`}>{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    a: ({ children, href }) => (
                      <a href={href} className={`underline ${
                        isOwnMessage 
                          ? 'text-white hover:text-white/80' 
                          : 'text-[#7B61FF] hover:text-[#6951E0]'
                      }`} target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                    ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    h1: ({ children }) => <h1 className="text-xl font-bold mb-2 mt-3">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-bold mb-2 mt-3">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-bold mb-2 mt-2">{children}</h3>,
                  }}
                >
                  {currentText}
                </ReactMarkdown>
              );
              currentText = '';
            }
            parts.push(
              <span key={`inline-math-${key++}`} style={{ display: 'inline', verticalAlign: 'middle' }}>
                <InlineMath math={segment} />
              </span>
            );
          }
        });
      } else {
        // Display math
        if (currentText) {
          parts.push(
            <ReactMarkdown key={`md-${key++}`}>
              {currentText}
            </ReactMarkdown>
          );
          currentText = '';
        }
        parts.push(
          <div key={`display-math-${key++}`} style={{ margin: '0.5rem 0', overflowX: 'auto', overflowY: 'hidden', textAlign: 'center' }}>
            <BlockMath math={part} />
          </div>
        );
      }
    });

    // Add any remaining text
    if (currentText) {
      parts.push(
        <ReactMarkdown
          key={`md-${key++}`}
          components={{
            code({ inline, className, children, ...props }: any) {
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
                <code className={`px-2 py-0.5 rounded text-sm font-mono ${
                  isOwnMessage 
                    ? 'bg-white/20 text-white' 
                    : 'bg-purple-100 text-[#7B61FF]'
                }`} {...props}>
                  {children}
                </code>
              );
            },
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            strong: ({ children }) => <strong className={`font-bold ${isOwnMessage ? 'text-white' : 'text-gray-900'}`}>{children}</strong>,
            em: ({ children }) => <em className="italic">{children}</em>,
            a: ({ children, href }) => (
              <a href={href} className={`underline ${
                isOwnMessage 
                  ? 'text-white hover:text-white/80' 
                  : 'text-[#7B61FF] hover:text-[#6951E0]'
              }`} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
            ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
            li: ({ children }) => <li className="mb-1">{children}</li>,
            h1: ({ children }) => <h1 className="text-xl font-bold mb-2 mt-3">{children}</h1>,
            h2: ({ children }) => <h2 className="text-lg font-bold mb-2 mt-3">{children}</h2>,
            h3: ({ children }) => <h3 className="text-base font-bold mb-2 mt-2">{children}</h3>,
          }}
        >
          {currentText}
        </ReactMarkdown>
      );
    }

    return <div className="prose prose-sm max-w-none">{parts}</div>;
  };

  return (
    <div className="unified-message overflow-hidden">
      <style>{mathStyles}</style>
      {renderContent()}
    </div>
  );
};

export default UnifiedMessage;