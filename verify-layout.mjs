
// Basic layout verification script
// Since visual verification is not possible, we check if the DOM structure is correct in Search.tsx

import { readFileSync } from 'fs';

function verifyLayout() {
    const searchFile = 'src/pages/Search.tsx';
    const cssFile = 'src/index.css';
    const cardFile = 'src/components/PropertyCard.tsx';

    try {
        const searchContent = readFileSync(searchFile, 'utf8');
        const cssContent = readFileSync(cssFile, 'utf8');
        const cardContent = readFileSync(cardFile, 'utf8');

        console.log('--- Layout Verification Report ---');

        // Check Search.tsx structure
        console.log('Search.tsx:');
        if (searchContent.includes('split-view') && searchContent.includes('split-view-map') && searchContent.includes('split-view-list')) {
            console.log('✅ Split view structure present');
        } else {
            console.log('❌ Split view structure MISSING');
        }

        if (searchContent.includes('h-[calc(100vh-64px)]')) {
            console.log('✅ Full height container present');
        } else {
            console.log('❌ Full height container MISSING');
        }

        // Check CSS
        console.log('\nindex.css:');
        if (cssContent.includes('.split-view') && cssContent.includes('flex-row')) {
            console.log('✅ CSS classes defined');
        } else {
            console.log('❌ CSS classes MISSING');
        }

        // Check PropertyCard
        console.log('\nPropertyCard.tsx:');
        if (cardContent.includes("variant === 'compact'")) {
            console.log('✅ Compact variant logic present');
        } else {
            console.log('❌ Compact variant logic MISSING');
        }

    } catch (err) {
        console.error('Error reading files:', err);
    }
}

verifyLayout();
