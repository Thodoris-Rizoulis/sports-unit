import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getExtendedUserProfile } from "@/services/profile";
import ProfilePageWrapper from "@/components/profile/ProfilePageWrapper";
import { getProfileUrl } from "@/lib/utils";

type Params = {
  uuid: string;
  slug: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { uuid, slug } = await params;
  const profile = await getExtendedUserProfile(uuid);

  if (!profile) {
    return {
      title: "Profile Not Found",
    };
  }

  const fullName = `${profile.firstName} ${profile.lastName}`;
  const description =
    profile.bio ||
    `View ${fullName}'s professional sports profile on Sports Unit.`;
  const profileUrl = getProfileUrl(profile as any);

  return {
    title: fullName,
    description,
    openGraph: {
      title: `${fullName} | Sports Unit`,
      description,
      url: profileUrl,
      type: "profile",
      images: profile.profileImageUrl
        ? [
            {
              url: profile.profileImageUrl,
              width: 400,
              height: 400,
              alt: fullName,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary",
      title: `${fullName} | Sports Unit`,
      description,
      images: profile.profileImageUrl ? [profile.profileImageUrl] : undefined,
    },
  };
}

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
