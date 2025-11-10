import { defineApp } from "convex/server";
import betterAuth from "@convex-dev/better-auth/convex.config";
import resend from "@convex-dev/resend/convex.config";
import shardedCounter from "@convex-dev/sharded-counter/convex.config";
import aggregate from "@convex-dev/aggregate/convex.config";
import migrations from "@convex-dev/migrations/convex.config";

const app = defineApp();
app.use(betterAuth);
app.use(resend);
app.use(shardedCounter);
app.use(aggregate);
app.use(migrations);

export default app;
