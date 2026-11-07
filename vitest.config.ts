import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "istanbul",
      include: ["src/lib/**/*.ts"],
      exclude: [
        "src/lib/amplify-client.ts",
        "src/lib/constants.ts",
        "src/lib/debounce.ts",
      ],
      thresholds: { branches: 80, functions: 80, lines: 80, statements: 80 },
    },
  },
});
