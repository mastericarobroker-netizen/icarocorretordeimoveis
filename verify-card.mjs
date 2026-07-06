
// Card verification script

import { readFileSync } from 'fs';

function verifyCardStyles() {
    const cardFile = 'src/components/PropertyCard.tsx';

    try {
        const cardContent = readFileSync(cardFile, 'utf8');

        console.log('--- Property Card Style Verification ---');

        // Check for bold price
        if (cardContent.includes('text-2xl font-bold')) {
            console.log('✅ Price Styling: Bold & Large (text-2xl)');
        } else {
            console.log('❌ Price Styling MISSING');
        }

        // Check for pipe separators
        if (cardContent.includes('<span className="text-border mx-1">|</span>')) {
            console.log('✅ Stats formatting: Pipe separators present');
        } else {
            console.log('❌ Stats formatting MISSING');
        }

        // Check for exclusion of heart/agent
        if (!cardContent.includes('Heart') && !cardContent.includes('REALTY')) {
            console.log('✅ User preferences respected (No Heart icon/Agent footer)');
        } else {
            console.log('❌ Elements found that should have been excluded');
        }

    } catch (err) {
        console.error('Error reading file:', err);
    }
}

verifyCardStyles();
