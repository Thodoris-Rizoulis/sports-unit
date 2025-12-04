import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved Posts",
  description: "View your bookmarked posts on Sports Unit.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SavedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
