import svelte from 'rollup-plugin-svelte';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';
import buble from 'rollup-plugin-buble';

const dev = !!process.env.DEVELOPMENT;

export default {
	entry: 'client/main.js',
	dest: 'public/bundle.js',
	format: 'iife',
	plugins: [
		nodeResolve(),
		commonjs(),
		svelte({
			// in development mode, we want to ship the CSS so that
			// changes to components don't result in a hash mismatch
			css: dev
		}),
		buble(),
		!dev && uglify()
	]
};