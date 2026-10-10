import type { ComponentPropsWithoutRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useUi } from './UiProvider';

export function Markdown({children, className = 'md'}: {children: string; className?: string}) {
  const {openDoc} = useUi();
  return <div className={className}><ReactMarkdown remarkPlugins={[remarkGfm]} components={{
    a: ({href = '', children: label, ...props}: ComponentPropsWithoutRef<'a'>) => {
      const internal = href.startsWith('/') && href.endsWith('.md');
      return internal ? <a href={href} onClick={(event) => {event.preventDefault(); openDoc(href.slice(1));}}>{label}</a>
        : <a href={href} target="_blank" rel="noreferrer" {...props}>{label}</a>;
    },
    img: ({src, alt}) => <img src={src} alt={alt || ''} loading="lazy"/>,
  }}>{children.replace(/\[(\/[^\]\s]+\.md)\](?!\()/g, (_, path: string) => `[${path}](${path})`)}</ReactMarkdown></div>;
}
