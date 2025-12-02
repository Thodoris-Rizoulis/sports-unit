import { Hash } from "lucide-react";
import { HashtagFeed } from "@/components/posts/HashtagFeed";

type HashtagPageProps = {
  params: Promise<{ hashtag: string }>;
};

export default async function HashtagPage({ params }: HashtagPageProps) {
  const { hashtag } = await params;

  // Decode and normalize the hashtag
  const decodedHashtag = decodeURIComponent(hashtag).toLowerCase();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
          <Hash className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            #{decodedHashtag}
          </h1>
          <p className="text-sm text-muted-foreground">
            Posts with this hashtag
          </p>
        </div>
      </div>

      {/* Post Feed */}
      <HashtagFeed hashtag={decodedHashtag} />
    </div>
  );
}
