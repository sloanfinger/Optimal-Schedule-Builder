import { defineConfig } from "orval";
import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

const env = createEnv({
  client: {
    NEXT_PUBLIC_API_BASE_URL: z.url(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
});

function outputConfig(config) {
  return {
    mode: "split",
    httpClient: "fetch",
    client: "swr",
    target: "./index.ts",
    schemas: "./models",
    clean: true,
    baseUrl: env.NEXT_PUBLIC_API_BASE_URL,
    ...config,
  };
}

export default defineConfig({
  bulletinClient: {
    input: {
      target: await import("@repo/bulletin").catch(() => ({})),
    },
    output: outputConfig({
      workspace: "./dist/client/bulletin",
    }),
  },
  bulletinServer: {
    input: {
      target: await import("@repo/bulletin").catch(() => ({})),
    },
    output: outputConfig({
      workspace: "./dist/server/bulletin",
    }),
  },
  courseInformationClient: {
    input: {
      target: await import("@repo/course-information").catch(() => ({})),
    },
    output: outputConfig({
      workspace: "./dist/client/course-information",
    }),
  },
  courseInformationServer: {
    input: {
      target: await import("@repo/course-information").catch(() => ({})),
    },
    output: outputConfig({
      workspace: "./dist/server/course-information",
    }),
  },
  professorRatingClient: {
    input: {
      target: await import("@repo/professor-rating").catch(() => ({})),
    },
    output: outputConfig({
      workspace: "./dist/client/professor-rating",
    }),
  },
  professorRatingServer: {
    input: {
      target: await import("@repo/professor-rating").catch(() => ({})),
    },
    output: outputConfig({
      workspace: "./dist/server/professor-rating",
    }),
  },
});
