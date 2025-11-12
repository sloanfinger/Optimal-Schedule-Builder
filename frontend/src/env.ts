import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_COURSE_INFORMATION_SERVICE: z.string().url(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_COURSE_INFORMATION_SERVICE:
      process.env.NEXT_PUBLIC_COURSE_INFORMATION_SERVICE,
  },
});
