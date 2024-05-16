import { resolve } from 'path';
import fs from 'fs';

export function customResolveExtensions(
	extensions = ['.ts', '.tsx', '.js', '.jsx']
) {
	return {
		name: 'custom-resolve-extensions',
		resolveId(source, importer) {
			if (!importer) return null;

            const baseDir = resolve(importer, '..');
            for(const ext of extensions) {
                const filePath = resolve(baseDir, `${source}/${ext}`)
                if(fs.existsSync(filePath)) {
                    return filePath;
                }
            }

            return null;
		}
	};
}
