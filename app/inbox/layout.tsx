import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages",
  description:
    "Send and receive messages with your connections on Sports Unit.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function InboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
