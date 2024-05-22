import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import replace from '@rollup/plugin-replace';

import { resolvePkgPath } from '../../../scripts/rollup/utils.ts';
console.log('resolvePkgPath', resolvePkgPath, resolvePkgPath?.toString());

export default defineConfig({
	plugins: [react(), replace({ __DEV__: true, preventAssignment: true })],
	resolve: {
		alias: [
			{
				find: 'react',
				replacement: resolvePkgPath('react', true)
			},
			{
				find: 'react-dom',
				replacement: resolvePkgPath('react-dom', true)
			}
			// {
			// 	find: 'hostConfig',
			// 	replacement: resolve(resolvePkgPath('react-dom'), './src/hostConfig.ts')
			// }
		]
	}
});
