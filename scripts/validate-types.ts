import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const TYPES_FILE = path.join(SRC_DIR, 'types.ts');

function findTypeFiles(dir: string): string[] {
    const typeFiles: string[] = [];
    
    function scanDirectory(currentDir: string) {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                if (!item.includes('node_modules') && !item.includes('dist')) {
                    scanDirectory(fullPath);
                }
            } else if (item.endsWith('.types.ts') && fullPath !== TYPES_FILE) {
                typeFiles.push(fullPath);
            }
        }
    }
    
    scanDirectory(dir);
    return typeFiles;
}

function getRelativeImportPath(typeFile: string): string {
    const relativePath = path.relative(SRC_DIR, typeFile);
    return './' + relativePath.replace(/\.ts$/, '');
}

function validateTypesFile() {
    const typeFiles = findTypeFiles(SRC_DIR);
    
    if (!fs.existsSync(TYPES_FILE)) {
        console.error('❌ src/types.ts does not exist');
        process.exit(1);
    }
    
    const content = fs.readFileSync(TYPES_FILE, 'utf-8');
    const missingImports: string[] = [];
    
    for (const typeFile of typeFiles) {
        const importPath = getRelativeImportPath(typeFile);
        const exportStatement = `export * from '${importPath}';`;
        
        if (!content.includes(exportStatement)) {
            missingImports.push(importPath);
        }
    }
    
    if (missingImports.length > 0) {
        console.error('❌ Missing imports in src/types.ts:');
        missingImports.forEach(imp => console.log(`   ${imp}`));
        process.exit(1);
    } else {
        console.log('✅ All type files are properly imported in src/types.ts');
    }
}

validateTypesFile();
