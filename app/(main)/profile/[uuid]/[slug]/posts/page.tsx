import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { UserService } from "@/services/profile";
import { getProfileUrl } from "@/lib/utils";
import UserPostsPageContent from "./UserPostsPageContent";

type Params = {
  uuid: string;
  slug: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { uuid } = await params;
  const profile = await UserService.getUserProfileByUuid(uuid);

  if (!profile) {
    return { title: "Posts Not Found" };
  }

  const displayName = `${profile.firstName} ${profile.lastName}`;

  return {
    title: `${displayName}'s Posts | Sports Unit`,
    description: `View all posts from ${displayName}`,
  };
}

export default async function UserPostsPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { uuid, slug } = await params;

  // Verify user exists
  const profile = await UserService.getUserProfileByUuid(uuid);
  if (!profile) return notFound();

  // Redirect to canonical slug if mismatch
  if (profile.username !== slug) {
    return redirect(`${getProfileUrl(profile as any)}/posts`);
  }

  return <UserPostsPageContent />;
}
