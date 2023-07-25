import Head from "next/head";
import Image from "next/image";
import toast from "react-hot-toast";
import { api } from "~/utils/api";
import { useState } from "react";
import { PageLayout } from "~/components/layout";
import { SignInButton, useUser } from "@clerk/nextjs";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { RecommendationView } from "~/components/recommendationView";

import type { NextPage } from "next";

const CreatePost = () => {
  const { user } = useUser();
  const [postContent, setPostContent] = useState(""); /* should definetly change this to react-hook-form so as to control input without re-rendering and performance issues */

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.recommendations.create.useMutation({
    onSuccess: () => {
      setPostContent("");
      void ctx.recommendations.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors?.content;

      if (errorMessage?.[0]) {
        toast.error(errorMessage[0]);
      } else toast.error("Failed to create post! Try again later.");
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
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();

            if (postContent !== "") {
              mutate({ content: postContent })
            };
          }
        }}
      />
      {postContent !== "" && !isPosting && (
        <button onClick={() => mutate({ content: postContent })}>
          Send
        </button>
      )}

      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={20} />
        </div>
      )}
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

const Home: NextPage = () => {
  const { isSignedIn, isLoaded: userLoading } = useUser();

  // this makes it fetch asap so we can use the cached data within react query (since is the same information is safe to use)
  api.recommendations.getAll.useQuery();

  // if the user doesn't load we'll return a fragment for now (changing it later)
  if (!userLoading) return <></>;

  return (
    <>
      <Head>
        <title>Pidgey | Twitter inspired app created with NextJS + T3 Stack</title>
        <meta name="description" content="Rafael Schmitz | Software Developer" />
        <meta name="keywords" content="Software Developer, Front-End, Back-End, Full-Stack, Typescript, NextJS, React, Java, Spring, SQL, Mobile Development, Twitter Clone" />
      </Head>
      <PageLayout >
        <div className="border-b border-slate-400 p-4 flex">
          {isSignedIn && <CreatePost />}
          {!isSignedIn && <div className="flex justify-center"><SignInButton /></div>}
        </div>

        <Feed />
      </PageLayout>
    </>
  );
}

export default Home;
