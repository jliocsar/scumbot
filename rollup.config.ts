import * as fs from "fs/promises";
import type { RollupOptions } from "rollup";
import civetRollupPlugin from "@danielx/civet/rollup";

const commands = await fs.readdir("src/commands");

export default {
  input: commands
    .map((command) => `src/commands/${command}`)
    .concat("src/index.civet"),
  output: {
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
  ],
} satisfies RollupOptions;
