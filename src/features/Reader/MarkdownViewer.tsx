import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css'; // Ensure CSS is imported in App or here
import { ScrollArea } from '../../components/ui/scroll-area';

interface MarkdownViewerProps {
  content: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
  return (
    <ScrollArea className="h-full w-full p-6">
      <div className="prose prose-sm dark:prose-invert max-w-none pb-20">
        <ReactMarkdown
          remarkPlugins={[remarkMath, remarkGfm]}
          rehypePlugins={[rehypeKatex]}
          components={{
            code({ className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '');
              const inline = !match; 
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
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            table({ children }) {
              return <div className="overflow-x-auto my-4"><table className="min-w-full divide-y divide-border border">{children}</table></div>
            },
            th({ children }) {
              return <th className="bg-muted px-4 py-2 text-left font-bold">{children}</th>
            },
            td({ children }) {
              return <td className="border-t px-4 py-2">{children}</td>
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </ScrollArea>
  );
};
