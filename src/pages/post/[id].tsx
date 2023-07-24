import type { NextPage } from "next";
import Head from "next/head";

const SinglePostPage: NextPage = () => {

  return (
    <>
      <Head>
        <title>Cuckoo | Twitter-ish app</title>
        <meta name="description" content="Rafael Schmitz | Software Developer" />
        <meta name="keywords" content="Software Developer, Front-End, Back-End, Full-Stack, Typescript, NextJS, React, Java, Spring, SQL, Mobile Development, Twitter Clone" />
        <link rel="icon" href="/main-logo.png" />
      </Head>
      <main className="flex h-screen justify-center">
        <div>Post Page</div>
      </main>
    </>
  );
}

export default SinglePostPage;
