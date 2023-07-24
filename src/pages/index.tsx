import { SignInButton, useUser } from "@clerk/nextjs";
import Head from "next/head";

import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { LoadingPage } from "~/components/Loading";
import { useState } from "react";

dayjs.extend(relativeTime);

const CreatePost = () => {
  const { user } = useUser();
  const [postContent, setPostContent] = useState("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.recommendations.create.useMutation({
    onSuccess: () => {
      setPostContent("");
      void ctx.recommendations.getAll.invalidate();
    }
  });

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
      <input
        type="text"
        placeholder="Create your message!"
        className="bg-transparent indent-4 grow outline-none"
        value={postContent}
        onChange={(e) => setPostContent(e.target.value)}
        disabled={isPosting}
      />
      <button
        onClick={() => mutate({ content: postContent })}
        disabled={isPosting}
      >
        Send
      </button>
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
        <span className="text-xl">{recommendation.content}</span>
      </div>
    </div>
  )
}

const Feed = () => {
  const { data, isLoading: postsLoading } = api.recommendations.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>No posts to show...</div>;

  return (
    <div className="flex flex-col">
      {data.map((post) => (
        <RecommendationView {...post} key={post.recommendation.id} />
      ))}
    </div>
  )
}

const Home = () => {
  const { isSignedIn, isLoaded: userLoading } = useUser();

  // this makes it fetch asap so we can use the cached data within react query (since is the same information is safe to use)
  api.recommendations.getAll.useQuery();

  // if the user doesn't load we'll return a fragment for now (changing it later)
  if (!userLoading) return <></>;

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
            {isSignedIn && <CreatePost />}
            {!isSignedIn && <div className="flex justify-center"><SignInButton /></div>}
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
}

export default Home;
