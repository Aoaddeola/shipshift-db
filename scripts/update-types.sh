#!/bin/bash

# update-types.sh - Shell script version for updating type imports

set -e

echo "🔍 Finding all .types.ts files..."

# Find all .types.ts files, exclude node_modules and dist, and the main types.ts file
find src -name "*.types.ts" | grep -v node_modules | grep -v dist | while read -r file; do
    if [ "$file" != "src/types.ts" ]; then
        # Convert file path to relative import path
        relative_path=$(echo "$file" | sed 's|^src/||' | sed 's|\.ts$||')
        echo "export * from './$relative_path';"
    fi
done | sort > /tmp/type-imports.txt

# Create the new types.ts file
{
    echo "// Auto-generated file - DO NOT EDIT MANUALLY"
    echo "// This file exports all type definitions from across the application"
    echo ""
    cat /tmp/type-imports.txt
} > src/types.ts.new

# Check if the file changed
if cmp -s src/types.ts src/types.ts.new 2>/dev/null; then
    echo "✅ No changes needed - types file is up to date"
    rm src/types.ts.new
else
    mv src/types.ts.new src/types.ts
    echo "✅ Updated src/types.ts"
    cat /tmp/type-imports.txt | while read line; do
        echo "   $line"
    done
    rm /tmp/type-imports.txt
fi
