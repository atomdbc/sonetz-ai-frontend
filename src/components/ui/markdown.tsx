// components/ui/markdown.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils';

interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <ReactMarkdown
      className={cn(
        'prose dark:prose-invert max-w-none',
        'prose-p:leading-relaxed prose-pre:p-0',
        'prose-code:before:content-none prose-code:after:content-none',
        className
      )}
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        // Override pre and code rendering
        pre: ({ node, ...props }) => <div {...props} className="overflow-hidden rounded-lg my-2" />,
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : '';

          if (!inline && language) {
            return (
              <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                PreTag="div"
                customStyle={{
                  margin: 0,
                  borderRadius: '0.5rem',
                  backgroundColor: 'var(--code-bg)',
                }}
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            );
          }

          return (
            <code
              className={cn(
                'bg-muted rounded px-1.5 py-0.5 font-mono text-sm',
                className
              )}
              {...props}
            >
              {children}
            </code>
          );
        },
        // Style links
        a: ({ node, className, children, ...props }) => (
          <a
            className={cn(
              'font-medium underline underline-offset-4 text-primary',
              className
            )}
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          >
            {children}
          </a>
        ),
        // Style lists
        ul: ({ node, className, children, ...props }) => (
          <ul
            className={cn('my-2 list-disc list-inside', className)}
            {...props}
          >
            {children}
          </ul>
        ),
        ol: ({ node, className, children, ...props }) => (
          <ol
            className={cn('my-2 list-decimal list-inside', className)}
            {...props}
          >
            {children}
          </ol>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}