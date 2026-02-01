
// Grid layout verification script

import { readFileSync } from 'fs';

function verifyGrid() {
    const searchFile = 'src/pages/Search.tsx';

    try {
        const searchContent = readFileSync(searchFile, 'utf8');

        console.log('--- Grid Layout Verification Report ---');

        // Check Search.tsx for grid classes
        console.log('Search.tsx:');
        if (searchContent.includes('grid-cols-1 sm:grid-cols-2')) {
            console.log('✅ Grid columns defined (1 -> 2)');
        } else {
            console.log('❌ Grid columns MISSING');
        }

        if (searchContent.includes('xl:grid-cols-2')) {
            console.log('✅ XL Grid columns defined (2)');
        } else {
            console.log('❌ XL Grid columns MISSING');
        }

        // Check if variant="compact" was removed
        if (!searchContent.includes('variant="compact"')) {
            console.log('✅ Compact variant removed (using default vertical card)');
        } else {
            console.log('❌ Compact variant still present');
        }

    } catch (err) {
        console.error('Error reading files:', err);
    }
}

verifyGrid();
