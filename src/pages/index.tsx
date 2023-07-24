import { SignInButton, useUser } from "@clerk/nextjs";
import Head from "next/head";

import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";

dayjs.extend(relativeTime);

const CreatePost = () => {
  const { user } = useUser();

  if (!user) return null;

  return (
    <div className="flex gap-2 w-full">
      <Image
        src={user.profileImageUrl}
        alt="Profile Image"
        className="w-14 h-14 rounded-full"
        width={56}
        height={56}
      />
      <input type="text" placeholder="Create your message!" className="bg-transparent indent-4 grow outline-none" />
    </div>
  )
}

type PostWithUser = RouterOutputs["recommendations"]["getAll"][number];

const RecommendationView = (props: PostWithUser) => {
  const { recommendation, author } = props;

  return (
    <div key={recommendation.id} className="flex gap-3 p-4 border-b border-slate-400">
      <Image
        src={author.profileImageUrl}
        alt={`${author.username}'s profile image`}
        className="w-14 h-14 rounded-full"
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex gap-2 text-slate-300">
          <span>{`@${author.username}`}</span>
          <span className="font-thin">{dayjs(recommendation.createdAt).fromNow()}</span>
        </div>
        <span className="">{recommendation.content}</span>
      </div>
    </div>
  )
}

export default function Home() {
  const user = useUser();
  const { data, isLoading } = api.recommendations.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>;

  if (!data) return <div>No posts to show...</div>;

  return (
    <>
      <Head>
        <title>Rafael Schmitz | Software Developer</title>
        <meta name="description" content="Rafael Schmitz | Software Developer" />
        <meta name="keywords" content="Software Developer, Front-End, Back-End, Full-Stack, Typescript, NextJS, React, Java, Spring, SQL, Mobile Development" />
        <link rel="icon" href="/main-logo.png" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="w-full h-full md:max-w-2xl border-x border-slate-400">
          <div className="border-b border-slate-400 p-4 flex">
            {user?.isSignedIn && <CreatePost />}
            {!user?.isSignedIn && <div className="flex justify-center"><SignInButton /></div>}
          </div>
          <div className="flex flex-col">
            {data?.map((post) => (
              <RecommendationView {...post} key={post.recommendation.id} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
