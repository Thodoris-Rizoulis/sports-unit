/**
 * /notifications Page
 *
 * Full notification history page with infinite scroll.
 * Server component wrapper for the client-side NotificationsPage.
 */

import { Metadata } from "next";
import { NotificationsPage } from "@/components/notifications/NotificationsPage";

export const metadata: Metadata = {
  title: "Notifications | Sports Unit",
  description:
    "View your notifications from connection requests, likes, and comments.",
};

export default function Page() {
  return <NotificationsPage />;
}
