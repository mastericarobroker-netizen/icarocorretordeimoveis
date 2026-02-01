import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';

const SUPABASE_URL = 'https://zvpqkqffboajidpoyhwo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_DPngz5PjMnZiV1WEKQqrHA_0ZAMtMvJ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verifyDatabaseTables() {
    const results = [];

    results.push('='.repeat(80));
    results.push('DATABASE VERIFICATION REPORT');
    results.push('='.repeat(80));
    results.push('');

    // Check if properties table exists
    const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .limit(1);

    if (propertiesError) {
        results.push('[FAIL] Table "properties" - Error: ' + propertiesError.message);
    } else {
        results.push('[PASS] Table "properties" exists');
    }

    // Check if leads table exists
    const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .limit(1);

    if (leadsError) {
        results.push('[FAIL] Table "leads" - Error: ' + leadsError.message);
    } else {
        results.push('[PASS] Table "leads" exists');
    }

    // Check if profiles table exists
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

    if (profilesError) {
        results.push('[FAIL] Table "profiles" - Error: ' + profilesError.message);
    } else {
        results.push('[PASS] Table "profiles" exists');
    }

    // Check storage bucket
    const { data: buckets, error: bucketsError } = await supabase
        .storage
        .listBuckets();

    if (bucketsError) {
        results.push('[FAIL] Storage buckets - Error: ' + bucketsError.message);
    } else {
        const propertyImagesBucket = buckets?.find(b => b.name === 'property-images');
        if (propertyImagesBucket) {
            results.push('[PASS] Bucket "property-images" exists');
        } else {
            results.push('[FAIL] Bucket "property-images" not found');
        }
    }

    results.push('');
    results.push('='.repeat(80));
    results.push('VERIFICATION COMPLETE');
    results.push('='.repeat(80));

    const report = results.join('\n');
    console.log(report);
    writeFileSync('verification-report.txt', report, 'utf-8');

    return report;
}

verifyDatabaseTables();
