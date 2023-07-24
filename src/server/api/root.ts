import { createTRPCRouter } from "~/server/api/trpc";
import { recommendationsRouter } from "./routers/recommendations";

export const appRouter = createTRPCRouter({
  recommendations: recommendationsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
