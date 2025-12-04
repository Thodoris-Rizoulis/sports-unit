import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complete Your Profile",
  description:
    "Set up your Sports Unit profile to connect with athletes, coaches, and sports professionals.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
