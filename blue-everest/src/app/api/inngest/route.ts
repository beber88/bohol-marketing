import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { marketingFunctions } from "@/lib/inngest/marketing-functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: marketingFunctions,
});
