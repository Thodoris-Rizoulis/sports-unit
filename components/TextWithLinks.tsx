"use client";

import { parseTextWithLinks } from "@/lib/utils";

interface TextWithLinksProps {
  text: string;
  className?: string;
}

export function TextWithLinks({ text, className }: TextWithLinksProps) {
  const parts = parseTextWithLinks(text);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === "link") {
          return (
            <a
              key={index}
              href={part.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline underline-offset-2"
            >
              {part.content}
            </a>
          );
        }
        return <span key={index}>{part.content}</span>;
      })}
    </span>
  );
}
