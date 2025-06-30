'use client';

import React, { FC, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { JSONContent } from '@tiptap/react';

type IRichContentRendererProps = {
  content: JSONContent | null;
  className?: string;
  maxImageWidth?: number;
  showFullImages?: boolean;
};

type IRenderNodeProps = {
  node: JSONContent;
  maxImageWidth: number;
  showFullImages: boolean;
};

const RenderNode: FC<IRenderNodeProps> = ({ node, maxImageWidth, showFullImages }) => {
  const renderMarks = (text: string, marks?: any[]) => {
    if (!marks || marks.length === 0) return text;

    return marks.reduce((content: React.ReactNode, mark) => {
      switch (mark.type) {
        case 'bold':
          return <strong className="font-semibold">{content}</strong>;
        case 'italic':
          return <em className="italic">{content}</em>;
        case 'underline':
          return <u className="underline">{content}</u>;
        case 'code':
          return <code className="bg-gray-100 px-1 rounded text-sm">{content}</code>;
        default:
          return content;
      }
    }, text);
  };

  const renderContent = (content?: JSONContent[]): React.ReactNode[] => {
    if (!content) return [];

    return content.map((childNode, index) => (
      <RenderNode
        key={index}
        node={childNode}
        maxImageWidth={maxImageWidth}
        showFullImages={showFullImages}
      />
    ));
  };

  switch (node.type) {
    case 'doc':
      return <>{renderContent(node.content)}</>;

    case 'paragraph':
      return <p className="mb-2 leading-relaxed">{renderContent(node.content)}</p>;

    case 'text':
      return <span>{renderMarks(node.text || '', node.marks)}</span>;

    case 'hardBreak':
      return <br />;

    case 'image':
      const imageStyle = showFullImages
        ? {
            maxWidth: '100%',
            height: 'auto',
            borderRadius: '8px',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            marginTop: '8px',
            marginBottom: '8px',
          }
        : {
            maxWidth: `${maxImageWidth}px`,
            height: 'auto',
            borderRadius: '4px',
            border: '1px solid rgba(0, 0, 0, 0.1)',
          };

      return (
        <img
          src={node.attrs?.src}
          alt={node.attrs?.alt || ''}
          style={imageStyle}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      );

    case 'heading':
      const level = node.attrs?.level || 1;
      const headingClass = cn(
        'font-semibold mb-2',
        level === 1 && 'text-xl',
        level === 2 && 'text-lg',
        level === 3 && 'text-base',
      );

      if (level === 1) return <h1 className={headingClass}>{renderContent(node.content)}</h1>;
      if (level === 2) return <h2 className={headingClass}>{renderContent(node.content)}</h2>;
      if (level === 3) return <h3 className={headingClass}>{renderContent(node.content)}</h3>;
      if (level === 4) return <h4 className={headingClass}>{renderContent(node.content)}</h4>;
      if (level === 5) return <h5 className={headingClass}>{renderContent(node.content)}</h5>;
      return <h6 className={headingClass}>{renderContent(node.content)}</h6>;

    case 'bulletList':
      return <ul className="mb-2 ml-4 list-disc">{renderContent(node.content)}</ul>;

    case 'orderedList':
      return <ol className="mb-2 ml-4 list-decimal">{renderContent(node.content)}</ol>;

    case 'listItem':
      return <li className="mb-1">{renderContent(node.content)}</li>;

    case 'blockquote':
      return (
        <blockquote className="border-l-4 border-gray-300 pl-4 mb-2 italic">
          {renderContent(node.content)}
        </blockquote>
      );

    case 'codeBlock':
      return (
        <pre className="bg-gray-100 p-3 rounded mb-2 overflow-x-auto">
          <code>{node.content?.[0]?.text || ''}</code>
        </pre>
      );

    default:
      // Fallback for unknown node types
      return renderContent(node.content) || null;
  }
};

export const RichContentRenderer: FC<IRichContentRendererProps> = ({
  content,
  className,
  maxImageWidth = 200,
  showFullImages = false,
}) => {
  const renderedContent = useMemo(() => {
    if (!content) {
      return null;
    }

    return (
      <RenderNode node={content} maxImageWidth={maxImageWidth} showFullImages={showFullImages} />
    );
  }, [content, maxImageWidth, showFullImages]);

  if (!renderedContent) {
    return null;
  }

  return (
    <div className={cn('prose prose-sm max-w-none', 'text-gray-900 dark:text-gray-100', className)}>
      {renderedContent}
    </div>
  );
};
