import * as fs from "fs/promises";
import type { RollupOptions } from "rollup";
import civetRollupPlugin from "@danielx/civet/rollup";
import { sentryRollupPlugin } from "@sentry/rollup-plugin";

const commands = await fs.readdir("src/commands");

export default {
  input: commands
    .map((command) => `src/commands/${command}`)
    .concat("src/index.civet"),
  output: {
    sourcemap: true,
    dir: "dist",
    preserveModules: true,
    format: "es",
  },
  onwarn: ({ message }) => {
    if (/external dependency/.test(message)) return;
    console.error(message);
  },
  plugins: [
    civetRollupPlugin({
      ts: "civet",
    }),
    sentryRollupPlugin({
      org: "scumbot",
      project: "scumbot",
    }),
  ],
} satisfies RollupOptions;
