// Test script pour vérifier les tables V8 Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variables d\'environnement Supabase manquantes !');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTables() {
    console.log('🔍 Test des tables V8 Supabase...\n');

    const tables = [
        'sessions',
        'session_structure',
        'environment_capsules',
        'capsule_content',
        'session_capsules'
    ];

    for (const table of tables) {
        console.log(`Testing table: ${table}...`);
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);
        
        if (error) {
            console.error(`❌ ${table}: ${error.message}`);
        } else {
            console.log(`✅ ${table}: Table exists!`);
        }
    }

    console.log('\n✅ Test terminé !');
}

testTables().catch(console.error);

