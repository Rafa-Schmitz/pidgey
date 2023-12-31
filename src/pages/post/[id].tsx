import Head from "next/head";
import { api } from "~/utils/api";
import { PageLayout } from "~/components/layout";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";

import type { GetStaticProps, NextPage } from "next";
import { RecommendationView } from "~/components/recommendationView";

const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {
  const { data } = api.recommendations.getRecommendationById.useQuery({
    id
  });

  if (!data) return <>Something went wrong...</>;

  return (
    <>
      <Head>
        <title>{`${data.recommendation.content} - ${data.author.username} | Pidgey`}</title>
        <meta name="description" content="Rafael Schmitz | Software Developer" />
        <meta name="keywords" content="Software Developer, Front-End, Back-End, Full-Stack, Typescript, NextJS, React, Java, Spring, SQL, Mobile Development, Twitter Clone" />
      </Head>
      <PageLayout>
        <RecommendationView {...data} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();
  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("no id");

  await ssg.recommendations.getRecommendationById.prefetch({ id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id
    }
  };
};

export const getStaticPaths = () => {
  return {
    paths: [], fallback: "blocking"
  };
};

export default SinglePostPage;
