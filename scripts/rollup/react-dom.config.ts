import alias from '@rollup/plugin-alias';
import generatePackageJson from 'rollup-plugin-generate-package-json';

import { getBaseRollupPlugins, getPackageJSON, resolvePkgPath } from './utils.ts';
// import { customResolveExtensions } from './customResolveExtensions';

const { name, module, peerDependencies } = getPackageJSON('react-dom');

const pkgPath = resolvePkgPath(name);

const pkgDistPath = resolvePkgPath(name, true);

export default [
	{
		input: `${pkgPath}/${module}`,
		output: [
			{
				file: `${pkgDistPath}/index.js`,
				name: 'reactDom',
				format: 'umd'
			},
			{
				file: `${pkgDistPath}/client.js`,
				name: 'client',
				format: 'umd'
			}
		],
		external: [...Object.keys(peerDependencies)],
		plugins: [
			...getBaseRollupPlugins(),
			alias({
				entries: {
					hostConfig: `${pkgPath}/src/hostConfig.ts`
				}
			}),
			generatePackageJson({
				inputFolder: pkgPath,
				outputFolder: pkgDistPath,
				baseContents: ({ name, description, version }) => ({
					name,
					description,
					version,
					peerDependencies: {
						react: version
					},
					main: 'index.js'
				})
			}),
			// customResolveExtensions()
		]
	}
];
