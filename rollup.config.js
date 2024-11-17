import nodeResolve from '@rollup/plugin-node-resolve';

export default [{
	input: 'callbackRegistry.js',
	plugins: [nodeResolve()],
	output: [{
		file: 'callbackRegistry.cjs',
		format: 'cjs',
	}, {
		file: 'callbackRegistry.mjs',
		format: 'esm',
	}],
}, {
	input: 'callbacks.js',
	plugins: [nodeResolve()],
	output: [{
		file: 'callbacks.cjs',
		format: 'cjs',
	}],
}];
