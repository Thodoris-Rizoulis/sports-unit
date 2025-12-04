import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discover Athletes",
  description:
    "Find and connect with professional athletes, coaches, and sports professionals. Filter by sport, position, location, and more.",
  openGraph: {
    title: "Discover Athletes | Sports Unit",
    description:
      "Find and connect with professional athletes, coaches, and sports professionals.",
  },
};

export default function DiscoveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
