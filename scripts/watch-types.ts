import * as chokidar from 'chokidar';
import { updateTypesFile } from './import-types';

console.log('👀 Watching for changes to type files...');

chokidar.watch('src/**/*.types.ts', {
    ignored: /(^|[\/\\])\../,
    persistent: true
}).on('change', (path) => {
    console.log(`📁 ${path} changed, updating types...`);
    updateTypesFile();
});
