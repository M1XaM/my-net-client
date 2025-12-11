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

const UnifiedMessage: React.FC<UnifiedMessageProps> = ({ content, isOwnMessage = false }) => {
  // Process content to handle LaTeX and convert to markdown-compatible format
  const processContent = (text: string): string => {
    let processed = text;
    
    // Protect code blocks (``` blocks) from processing
    const codeBlocks: string[] = [];
    processed = processed.replace(/```[\s\S]*?```/g, (match) => {
      codeBlocks.push(match);
      return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
    });
    
    // Protect inline code (` `) from LaTeX processing
    const inlineCodes: string[] = [];
    processed = processed.replace(/`([^`]+)`/g, (match) => {
      inlineCodes.push(match);
      return `__INLINE_CODE_${inlineCodes.length - 1}__`;
    });
    
    // Handle LaTeX document environments (convert to display math)
    // \begin{equation}...\end{equation}
    processed = processed.replace(/\\begin\{equation\}([\s\S]*?)\\end\{equation\}/g, (_, math) => {
      return `\n\n___DISPLAY_MATH___${math.trim()}___END_DISPLAY_MATH___\n\n`;
    });
    
    // \begin{align}...\end{align}
    processed = processed.replace(/\\begin\{align\*?\}([\s\S]*?)\\end\{align\*?\}/g, (_, math) => {
      return `\n\n___DISPLAY_MATH___\\begin{align}${math.trim()}\\end{align}___END_DISPLAY_MATH___\n\n`;
    });
    
    // \[...\] (display math)
    processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => {
      return `\n\n___DISPLAY_MATH___${math.trim()}___END_DISPLAY_MATH___\n\n`;
    });
    
    // Replace display math ($$...$$) with custom markers
    processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
      return `\n\n___DISPLAY_MATH___${math.trim()}___END_DISPLAY_MATH___\n\n`;
    });
    
    // Replace inline math ($...$) with custom markers (but not \$ escaped)
    processed = processed.replace(/(?<!\\)\$([^\$\n]+?)(?<!\\)\$/g, (_, math) => {
      return `___INLINE_MATH___${math.trim()}___END_INLINE_MATH___`;
    });
    
    // Convert LaTeX text formatting to markdown
    processed = processed.replace(/\\textbf\{([^}]+)\}/g, '**$1**'); // bold
    processed = processed.replace(/\\textit\{([^}]+)\}/g, '*$1*'); // italic
    processed = processed.replace(/\\emph\{([^}]+)\}/g, '*$1*'); // emphasis
    
    // Remove common LaTeX document commands that don't render
    processed = processed.replace(/\\documentclass(\[.*?\])?\{.*?\}/g, '');
    processed = processed.replace(/\\usepackage(\[.*?\])?\{.*?\}/g, '');
    processed = processed.replace(/\\title\{.*?\}/g, '');
    processed = processed.replace(/\\author\{.*?\}/g, '');
    processed = processed.replace(/\\date\{.*?\}/g, '');
    processed = processed.replace(/\\maketitle/g, '');
    processed = processed.replace(/\\begin\{document\}/g, '');
    processed = processed.replace(/\\end\{document\}/g, '');
    processed = processed.replace(/\\begin\{abstract\}/g, '**Abstract:**\n');
    processed = processed.replace(/\\end\{abstract\}/g, '');
    
    // Convert LaTeX sections to markdown headers
    processed = processed.replace(/\\section\{([^}]+)\}/g, '## $1');
    processed = processed.replace(/\\subsection\{([^}]+)\}/g, '### $1');
    processed = processed.replace(/\\subsubsection\{([^}]+)\}/g, '#### $1');
    
    // Convert LaTeX itemize/enumerate to markdown lists
    processed = processed.replace(/\\begin\{itemize\}/g, '');
    processed = processed.replace(/\\end\{itemize\}/g, '');
    processed = processed.replace(/\\begin\{enumerate\}/g, '');
    processed = processed.replace(/\\end\{enumerate\}/g, '');
    processed = processed.replace(/\\item\s+/g, '- ');
    
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

  const markdownComponents = {
    code({ inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');
      
      // If it's a code block (not inline)
      if (!inline) {
        // Try to detect language from className or default to 'javascript'
        const language = match ? match[1] : 'javascript';
        
        return (
          <div className="my-2">
            <SyntaxHighlighter 
              style={vscDarkPlus} 
              language={language} 
              PreTag="div" 
              customStyle={{
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                margin: 0,
                padding: '1rem'
              }}
              wrapLines={true}
              wrapLongLines={true}
              {...props}
            >
              {codeString}
            </SyntaxHighlighter>
          </div>
        );
      }
      
      // Inline code
      return (
        <code className={`px-2 py-0.5 rounded text-sm font-mono ${
          isOwnMessage 
            ? 'bg-white/20 text-white' 
            : 'bg-purple-100 text-[#7B61FF]'
        }`} {...props}>
          {children}
        </code>
      );
    },
    p: ({ children }: any) => <span className="inline">{children}</span>,
    strong: ({ children }: any) => <strong className={`font-bold ${isOwnMessage ? 'text-white' : 'text-gray-900'}`}>{children}</strong>,
    em: ({ children }: any) => <em className="italic">{children}</em>,
    a: ({ children, href }: any) => (
      <a href={href} className={`underline ${
        isOwnMessage 
          ? 'text-white hover:text-white/80' 
          : 'text-[#7B61FF] hover:text-[#6951E0]'
      }`} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    ul: ({ children }: any) => <ul className="list-disc ml-4 my-2">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal ml-4 my-2">{children}</ol>,
    li: ({ children }: any) => <li className="mb-1">{children}</li>,
    h1: ({ children }: any) => <h1 className="text-xl font-bold my-2">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-lg font-bold my-2">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-base font-bold my-2">{children}</h3>,
  };

  const renderContent = () => {
    const processedContent = processContent(content);
    const parts: React.ReactNode[] = [];
    let key = 0;

    // Split by display math first
    const displayMathRegex = /___DISPLAY_MATH___([\s\S]*?)___END_DISPLAY_MATH___/g;
    let lastIndex = 0;
    let match;

    while ((match = displayMathRegex.exec(processedContent)) !== null) {
      // Add text before display math
      if (match.index > lastIndex) {
        const textBefore = processedContent.substring(lastIndex, match.index);
        parts.push(...renderTextWithInlineMath(textBefore, key));
        key += 100;
      }

      // Add display math
      parts.push(
        <div key={`display-math-${key++}`} className="my-2 overflow-x-auto overflow-y-hidden text-center">
          <BlockMath math={match[1]} />
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < processedContent.length) {
      const remainingText = processedContent.substring(lastIndex);
      parts.push(...renderTextWithInlineMath(remainingText, key));
    }

    return parts;
  };

  const renderTextWithInlineMath = (text: string, startKey: number): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    const inlineMathRegex = /___INLINE_MATH___(.*?)___END_INLINE_MATH___/g;
    let lastIndex = 0;
    let match;
    let key = startKey;

    while ((match = inlineMathRegex.exec(text)) !== null) {
      // Add markdown text before inline math
      if (match.index > lastIndex) {
        const textBefore = text.substring(lastIndex, match.index);
        if (textBefore.trim()) {
          parts.push(
            <ReactMarkdown key={`md-${key++}`} components={markdownComponents}>
              {textBefore}
            </ReactMarkdown>
          );
        }
      }

      // Add inline math
      parts.push(
        <span key={`inline-math-${key++}`} className="inline-block align-middle mx-0.5">
          <InlineMath math={match[1]} />
        </span>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining markdown text
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      if (remainingText.trim()) {
        parts.push(
          <ReactMarkdown key={`md-${key++}`} components={markdownComponents}>
            {remainingText}
          </ReactMarkdown>
        );
      }
    }

    return parts;
  };

  return (
    <div className="unified-message break-words">
      <div className="flex flex-col gap-1">
        {renderContent()}
      </div>
    </div>
  );
};

export default UnifiedMessage;