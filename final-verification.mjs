import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zvpqkqffboajidpoyhwo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_DPngz5PjMnZiV1WEKQqrHA_0ZAMtMvJ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function finalVerification() {
    console.log('================================================================================');
    console.log('FINAL DATABASE VERIFICATION');
    console.log('================================================================================\n');

    let allPassed = true;

    // Check properties
    const { error: propertiesError } = await supabase.from('properties').select('*').limit(1);
    if (propertiesError) {
        console.log('[FAIL] Table "properties":', propertiesError.message);
        allPassed = false;
    } else {
        console.log('[PASS] Table "properties" exists');
    }

    // Check leads
    const { error: leadsError } = await supabase.from('leads').select('*').limit(1);
    if (leadsError) {
        console.log('[FAIL] Table "leads":', leadsError.message);
        allPassed = false;
    } else {
        console.log('[PASS] Table "leads" exists');
    }

    // Check profiles
    const { error: profilesError } = await supabase.from('profiles').select('*').limit(1);
    if (profilesError) {
        console.log('[FAIL] Table "profiles":', profilesError.message);
        allPassed = false;
    } else {
        console.log('[PASS] Table "profiles" exists');
    }

    // Check bucket
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
        console.log('[FAIL] Storage buckets:', bucketsError.message);
        allPassed = false;
    } else {
        const bucket = buckets?.find(b => b.name === 'property-images');
        if (bucket) {
            console.log('[PASS] Bucket "property-images" exists (Public:', bucket.public + ')');
        } else {
            console.log('[FAIL] Bucket "property-images" not found');
            allPassed = false;
        }
    }

    console.log('\n================================================================================');
    if (allPassed) {
        console.log('STATUS: ALL CHECKS PASSED - DATABASE READY FOR PRODUCTION');
    } else {
        console.log('STATUS: SOME CHECKS FAILED - REVIEW ERRORS ABOVE');
    }
    console.log('================================================================================');
}

finalVerification();
