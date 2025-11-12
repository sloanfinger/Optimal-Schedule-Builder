import { defineConfig } from "orval";

export default defineConfig({
  bulletinClient: {
    input: {
      target: await import("@repo/bulletin").catch(() => ({})),
    },
    output: {
      mode: "split",
      httpClient: "fetch",
      client: "swr",
      workspace: "./dist/client/bulletin",
      target: "./index.ts",
      schemas: "./models",
      clean: true,
      baseUrl: "http://localhost:8080",
    },
  },
  bulletinServer: {
    input: {
      target: await import("@repo/bulletin").catch(() => ({})),
    },
    output: {
      mode: "split",
      httpClient: "fetch",
      client: "fetch",
      workspace: "./dist/server/bulletin",
      target: "./index.ts",
      schemas: "./models",
      clean: true,
      baseUrl: "http://localhost:8080",
    },
  },
  courseInformationClient: {
    input: {
      target: await import("@repo/course-information").catch(() => ({})),
    },
    output: {
      mode: "split",
      httpClient: "fetch",
      client: "swr",
      workspace: "./dist/client/course-information",
      target: "./index.ts",
      schemas: "./models",
      clean: true,
      baseUrl: "http://localhost:8080",
    },
  },
  courseInformationServer: {
    input: {
      target: await import("@repo/course-information").catch(() => ({})),
    },
    output: {
      mode: "split",
      httpClient: "fetch",
      client: "fetch",
      workspace: "./dist/server/course-information",
      target: "./index.ts",
      schemas: "./models",
      clean: true,
      baseUrl: "http://localhost:8080",
    },
  },
  professorRatingClient: {
    input: {
      target: await import("@repo/professor-rating").catch(() => ({})),
    },
    output: {
      mode: "split",
      httpClient: "fetch",
      client: "swr",
      workspace: "./dist/client/professor-rating",
      target: "./index.ts",
      schemas: "./models",
      clean: true,
      baseUrl: "http://localhost:8080",
    },
  },
  professorRatingServer: {
    input: {
      target: await import("@repo/professor-rating").catch(() => ({})),
    },
    output: {
      mode: "split",
      httpClient: "fetch",
      client: "fetch",
      workspace: "./dist/server/professor-rating",
      target: "./index.ts",
      schemas: "./models",
      clean: true,
      baseUrl: "http://localhost:8080",
    },
  },
});
