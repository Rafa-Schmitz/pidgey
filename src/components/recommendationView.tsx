import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";

dayjs.extend(relativeTime);

import type { RouterOutputs } from "~/utils/api";

type PostWithUser = RouterOutputs["recommendations"]["getAll"][number];

export const RecommendationView = (props: PostWithUser) => {
  const { recommendation, author } = props;

  return (
    <div key={recommendation.id} className="flex gap-3 p-4 border-b border-slate-400">
      <Link href={`/@${author.username}`}>
        <Image
          src={author.profileImageUrl}
          alt={`${author.username}'s profile image`}
          className="w-14 h-14 rounded-full"
          width={56}
          height={56}
        />
      </Link>
      <div className="flex flex-col">
        <div className="flex gap-2 text-slate-300">
          <Link href={`/@${author.username}`}>
            <span>{`@${author.username}`}</span>
          </Link>
          <Link href={`/post/${recommendation.id}`}>
            <span className="font-thin">{dayjs(recommendation.createdAt).fromNow()}</span>
          </Link>
        </div>
        <Link href={`/post/${recommendation.id}`}>
          <span className="text-xl">{recommendation.content}</span>
        </Link>
      </div>
    </div>
  )
}