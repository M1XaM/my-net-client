import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { okaidia } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeMessageProps {
  content: string;
  language?: string;
}

const CodeMessage: React.FC<CodeMessageProps> = ({ content, language = 'javascript' }) => (
  <SyntaxHighlighter style={okaidia} language={language}>
    {content}
  </SyntaxHighlighter>
);

export default CodeMessage;
