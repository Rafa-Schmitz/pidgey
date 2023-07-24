import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";
import type { Recommendation } from "@prisma/client";

const addUserDataToPosts = async (post: Recommendation[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: post.map((recommendation) => recommendation.authorId),
      limit: 100,
    })
  ).map(filterUserForClient);

  return post.map((recommendation) => {
    const author = users.find((user) => user.id === recommendation.authorId);

    if (!author?.username)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Author for post not found",
      });

    return {
      recommendation,
      author: {
        ...author,
        username: author.username,
      },
    };
  });
};

// Creating a new ratelimiter that allows 5 requests per minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: false,
});

export const recommendationsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const recommendations = await ctx.prisma.recommendation.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc" }],
    });

    return addUserDataToPosts(recommendations);
  }),

  getRecommendationByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(({ ctx, input }) =>
      ctx.prisma.recommendation
        .findMany({
          where: {
            authorId: input.userId,
          },
          take: 100,
          orderBy: [{ createdAt: "desc" }],
        })
        .then(addUserDataToPosts)
    ),

  create: privateProcedure
    .input(
      z.object({
        content: z
          .string()
          .min(1, "Recommendations can't be empty")
          .max(1000, "Recommendations can't be over 1000 words long"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const { success } = await ratelimit.limit(authorId);

      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const post = ctx.prisma.recommendation.create({
        data: {
          authorId,
          content: input.content,
        },
      });

      return post;
    }),
});
