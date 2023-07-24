import { clerkClient } from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/dist/types/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.profileImageUrl,
  };
};

export const recommendationsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const recommendations = await ctx.prisma.recommendation.findMany({
      take: 100,
    });

    const users = (
      await clerkClient.users.getUserList({
        userId: recommendations.map(
          (recommendation) => recommendation.authorId
        ),
        limit: 100,
      })
    ).map(filterUserForClient);

    return recommendations.map((recommendation) => {
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
  }),
});
