import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Network",
  description:
    "Manage your professional sports connections and network on Sports Unit.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NetworkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
