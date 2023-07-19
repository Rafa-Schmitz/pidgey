import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Head from "next/head";
import { api } from "~/utils/api";

export default function Home() {
  const user = useUser();
  const { data } = api.recommendations.getAll.useQuery();

  return (
    <>
      <Head>
        <title>Rafael Schmitz | Software Developer</title>
        <meta name="description" content="Rafael Schmitz | Software Developer" />
        <meta name="keywords" content="Software Developer, Front-End, Back-End, Full-Stack, Typescript, NextJS, React, Java, Spring, SQL, Mobile Development" />
        <link rel="icon" href="/main-logo.png" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div>
          {user?.isSignedIn && <SignOutButton />}
          {!user?.isSignedIn && <SignInButton />}
        </div>
        <div>
          {data?.map((recommendations) => (
            <div key={recommendations?.id}>{recommendations?.content}</div>
          ))}
        </div>
      </main>
    </>
  );
}
