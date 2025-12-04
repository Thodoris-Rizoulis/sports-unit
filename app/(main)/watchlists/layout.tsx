import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Watchlists",
  description:
    "Organize and track athletes you're interested in with custom watchlists.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function WatchlistsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
