import { createTRPCRouter } from "~/server/api/trpc";
import { recommendationsRouter } from "./routers/recommendations";
import { profileRouter } from "./routers/profile";

export const appRouter = createTRPCRouter({
  recommendations: recommendationsRouter,
  profile: profileRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
