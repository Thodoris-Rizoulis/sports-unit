"use client";

import Link from "next/link";

type HashtagLinkProps = {
  /** The hashtag name without # */
  tag: string;
  /** Display content (e.g., "#training") */
  content: string;
  className?: string;
};

/**
 * Clickable hashtag link component.
 * Renders a hashtag that navigates to the hashtag page.
 */
export function HashtagLink({ tag, content, className }: HashtagLinkProps) {
  return (
    <Link
      href={`/hashtag/${tag}`}
      className={`text-primary hover:text-primary/80 font-medium hover:underline ${
        className ?? ""
      }`}
    >
      {content}
    </Link>
  );
}
