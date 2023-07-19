import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const recommendationsRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.recommendation.findMany();
  }),
});
