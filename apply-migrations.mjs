import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = 'https://zvpqkqffboajidpoyhwo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_DPngz5PjMnZiV1WEKQqrHA_0ZAMtMvJ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('⚠️  ATENÇÃO: Para aplicar migrations, você precisa usar a Service Role Key, não a Anon Key.');
console.log('⚠️  A Anon Key não tem permissões para criar tabelas.\n');
console.log('📋 INSTRUÇÕES PARA APLICAR AS MIGRATIONS:\n');
console.log('1. Acesse: https://supabase.com/dashboard/project/zvpqkqffboajidpoyhwo/editor/sql');
console.log('2. Copie e cole cada arquivo SQL na ordem abaixo:\n');

const migrations = [
    '20260126084450_4adc6e88-63ce-4109-8145-0bfd2577715f.sql',
    '20260127021055_0732f659-e97f-4044-9994-8df72b975d21.sql',
    '20260128003209_3c527e99-f11b-42a2-b0f2-3341ea4b2245.sql',
    '20260128004003_73499f11-6535-496f-ab79-8dbeff3ea227.sql'
];

migrations.forEach((file, index) => {
    const filePath = join('supabase', 'migrations', file);
    const sql = readFileSync(filePath, 'utf-8');

    console.log(`\n${'='.repeat(80)}`);
    console.log(`MIGRATION ${index + 1}/${migrations.length}: ${file}`);
    console.log('='.repeat(80));
    console.log(sql);
});

console.log('\n' + '='.repeat(80));
console.log('✅ Após executar todos os SQLs acima, execute novamente: node verify-db.mjs');
console.log('='.repeat(80));
