import copy from "rollup-plugin-copy";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import ts from "rollup-plugin-typescript2";
import commonjs from "@rollup/plugin-commonjs";

import { builtinModules } from "module";

const pkg = require("./package.json");

export default {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
      sourcemap: true
    }
  ],
  external: [
    ...builtinModules.filter(m => !m.startsWith("_")),
    ...Object.keys(pkg.dependencies)
  ],
  plugins: [
    json(),
    ts({
      tsconfig: require.resolve("./tsconfig.json"),
      rollupCommonJSResolveHack: true
    }),
    commonjs({ sourceMap: true }),
    resolve({ extensions: [".js", ".cjs", ".mjs"] }),
    copy({
      targets: [{ src: "./misc/*", dest: "./dist" }]
    })
  ]
};
