import typescript from 'rollup-plugin-typescript2';
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import builtins from "rollup-plugin-node-builtins";
import {terser} from 'rollup-plugin-terser';

const production = process.env.NODE_ENV === "production";

export default {
    input: './src/js/setup.ts',
    output: {
        file: "app.js",
        format: "iife"
    },
    plugins: [
        typescript({module: "CommonJS"}),
        resolve({browser: true, preferBuiltins: true}),
        commonjs({extensions: [".js", ".ts"]}),
        builtins(),
    ].concat(production ? [terser()] : [])
}
