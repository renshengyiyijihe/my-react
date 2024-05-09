import path from 'path';
import fs from 'fs';
import ts from 'rollup-plugin-typescript2';
import cjs from '@rollup/plugin-commonjs';

const pkgPath = path.resolve(__dirname, '../../packages');
const distPath = path.resolve(__dirname, '../../dist');

export const resolvePkgPath = (pkgName, isDist = false) => {
	if (isDist) return `${distPath}/${pkgName}`;
	return `${pkgPath}/${pkgName}`;
};

export const getPackageJSON = (pkgName) => {
	const path = `${resolvePkgPath(pkgName)}/package.json`;
	const str = fs.readFileSync(path, 'utf-8');
	console.log('str', str)
	return JSON.parse(str);
};

export const getBaseRollupPlugins = ({ typescript } = { typescript: {} }) => {
	return [(cjs(), ts(typescript))];
};
