import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zvpqkqffboajidpoyhwo.supabase.co';
const SUPABASE_SERVICE_KEY = 'sb_secret_J-o-iWPsFlIYhjcWS10Zdg_jbWNWzsd';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createStorageBucket() {
    console.log('Creating storage bucket "property-images"...\n');

    // Create bucket
    const { data: bucketData, error: bucketError } = await supabase
        .storage
        .createBucket('property-images', {
            public: true,
            fileSizeLimit: 52428800, // 50MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
        });

    if (bucketError) {
        if (bucketError.message.includes('already exists')) {
            console.log('[INFO] Bucket "property-images" already exists');
        } else {
            console.log('[ERROR] Failed to create bucket:', bucketError.message);
            return;
        }
    } else {
        console.log('[SUCCESS] Bucket "property-images" created successfully!');
    }

    // Verify bucket was created
    const { data: buckets, error: listError } = await supabase
        .storage
        .listBuckets();

    if (listError) {
        console.log('[ERROR] Failed to list buckets:', listError.message);
    } else {
        const propertyBucket = buckets?.find(b => b.name === 'property-images');
        if (propertyBucket) {
            console.log('[VERIFIED] Bucket "property-images" is now available');
            console.log('           Public:', propertyBucket.public);
        }
    }
}

createStorageBucket();
