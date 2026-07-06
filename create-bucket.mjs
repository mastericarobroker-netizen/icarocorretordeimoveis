import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zvpqkqffboajidpoyhwo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_DPngz5PjMnZiV1WEKQqrHA_0ZAMtMvJ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createStorageBucket() {
    console.log('Creating storage bucket "property-images"...\n');

    const { data, error } = await supabase
        .storage
        .createBucket('property-images', {
            public: true,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
        });

    if (error) {
        console.log('[ERROR] Failed to create bucket:', error.message);
        console.log('\nNOTE: You need to create the bucket manually in Supabase Dashboard:');
        console.log('1. Go to: https://supabase.com/dashboard/project/zvpqkqffboajidpoyhwo/storage/buckets');
        console.log('2. Click "New bucket"');
        console.log('3. Name: property-images');
        console.log('4. Check "Public bucket"');
        console.log('5. Click "Create bucket"');
    } else {
        console.log('[SUCCESS] Bucket "property-images" created successfully!');
    }
}

createStorageBucket();
