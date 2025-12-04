import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Your Sports Unit dashboard - view your feed, create posts, and connect with the sports community.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
