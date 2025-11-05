// Test script pour vérifier les tables Supabase
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
    console.log('🔍 Test des tables Supabase...\n');

    // Test 1: stage_objectives_completion
    console.log('1️⃣ Test de la table stage_objectives_completion...');
    const { data: objectives, error: objError } = await supabase
        .from('stage_objectives_completion')
        .select('*')
        .limit(5);
    
    if (objError) {
        console.error('❌ Erreur:', objError.message);
    } else {
        console.log(`✅ Table existe ! ${objectives.length} enregistrements trouvés`);
        if (objectives.length > 0) {
            console.log('   Exemple:', objectives[0]);
        }
    }

    // Test 2: stages_exploits
    console.log('\n2️⃣ Test de la table stages_exploits...');
    const { data: exploits, error: expError } = await supabase
        .from('stages_exploits')
        .select('*')
        .limit(5);
    
    if (expError) {
        console.error('❌ Erreur:', expError.message);
    } else {
        console.log(`✅ Table existe ! ${exploits.length} enregistrements trouvés`);
        if (exploits.length > 0) {
            console.log('   Exemple:', exploits[0]);
        }
    }

    // Test 3: stage_game_history
    console.log('\n3️⃣ Test de la table stage_game_history...');
    const { data: gameHistory, error: gameError } = await supabase
        .from('stage_game_history')
        .select('*')
        .limit(5);
    
    if (gameError) {
        console.error('❌ Erreur:', gameError.message);
    } else {
        console.log(`✅ Table existe ! ${gameHistory.length} enregistrements trouvés`);
        if (gameHistory.length > 0) {
            console.log('   Exemple:', gameHistory[0]);
        }
    }

    console.log('\n✅ Test terminé !');
}

testTables().catch(console.error);

