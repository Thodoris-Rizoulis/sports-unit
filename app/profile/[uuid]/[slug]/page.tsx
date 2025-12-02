import { notFound, redirect } from "next/navigation";
import { getExtendedUserProfile } from "@/services/profile";
import ProfilePageWrapper from "@/components/profile/ProfilePageWrapper";
import { getProfileUrl } from "@/lib/utils";

type Params = {
  uuid: string;
  slug: string;
};

export default async function ProfileByUuidPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { uuid, slug } = await params;

  const profile = await getExtendedUserProfile(uuid);
  if (!profile) return notFound();

  if (profile.username !== slug) {
    // Redirect to canonical slug
    return redirect(getProfileUrl(profile as any));
  }

  return <ProfilePageWrapper profile={profile} />;
}
