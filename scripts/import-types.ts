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

function generateImportStatement(importPath: string): string {
    return `export * from '${importPath}';`;
}

function getExistingImports(content: string): Set<string> {
    const imports = new Set<string>();
    const exportRegex = /export \* from '([^']+)';/g;
    let match;
    
    while ((match = exportRegex.exec(content)) !== null) {
        imports.add(match[1]);
    }
    
    return imports;
}

function updateTypesFile() {
    try {
        const typeFiles = findTypeFiles(SRC_DIR);
        console.log(`Found ${typeFiles.length} type files:`);
        
        const importPaths = typeFiles.map(getRelativeImportPath);
        
        let existingContent = '';
        if (fs.existsSync(TYPES_FILE)) {
            existingContent = fs.readFileSync(TYPES_FILE, 'utf-8');
        }
        
        const existingImports = getExistingImports(existingContent);
        
        const header = `// Auto-generated file - DO NOT EDIT MANUALLY
// This file exports all type definitions from across the application

`;
        
        const imports = importPaths.map(path => generateImportStatement(path));
        imports.sort();
        
        const newContent = header + imports.join('\n') + '\n';
        
        if (newContent !== existingContent) {
            fs.writeFileSync(TYPES_FILE, newContent, 'utf-8');
            console.log(`✅ Updated ${TYPES_FILE} with ${imports.length} exports`);
            
            const newImports = new Set(importPaths);
            const added = Array.from(newImports).filter(x => !existingImports.has(x));
            const removed = Array.from(existingImports).filter(x => !newImports.has(x));
            
            if (added.length > 0) {
                console.log('➕ Added imports:');
                added.forEach(imp => console.log(`   ${imp}`));
            }
            if (removed.length > 0) {
                console.log('➖ Removed imports:');
                removed.forEach(imp => console.log(`   ${imp}`));
            }
        } else {
            console.log('✅ No changes needed - types file is up to date');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Error updating types file:', error);
        return false;
    }
}

if (require.main === module) {
    updateTypesFile();
}

export { updateTypesFile };
