import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zvpqkqffboajidpoyhwo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_DPngz5PjMnZiV1WEKQqrHA_0ZAMtMvJ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verifyDatabaseTables() {
    console.log('🔍 Verificando estrutura do banco de dados...\n');

    // Check if properties table exists
    const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .limit(1);

    if (propertiesError) {
        console.log('❌ Tabela "properties" não encontrada ou erro:', propertiesError.message);
    } else {
        console.log('✅ Tabela "properties" existe');
    }

    // Check if leads table exists
    const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .limit(1);

    if (leadsError) {
        console.log('❌ Tabela "leads" não encontrada ou erro:', leadsError.message);
    } else {
        console.log('✅ Tabela "leads" existe');
    }

    // Check if profiles table exists
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

    if (profilesError) {
        console.log('❌ Tabela "profiles" não encontrada ou erro:', profilesError.message);
    } else {
        console.log('✅ Tabela "profiles" existe');
    }

    // Check storage bucket
    const { data: buckets, error: bucketsError } = await supabase
        .storage
        .listBuckets();

    if (bucketsError) {
        console.log('❌ Erro ao verificar buckets:', bucketsError.message);
    } else {
        const propertyImagesBucket = buckets?.find(b => b.name === 'property-images');
        if (propertyImagesBucket) {
            console.log('✅ Bucket "property-images" existe');
        } else {
            console.log('❌ Bucket "property-images" não encontrado');
        }
    }

    console.log('\n✨ Verificação concluída!');
}

verifyDatabaseTables();
