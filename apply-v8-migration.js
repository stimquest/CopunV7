// Script pour appliquer la migration V8 à Supabase
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variables d\'environnement Supabase manquantes !');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
    try {
        console.log('📝 Lecture du fichier de migration...');
        const migrationSQL = fs.readFileSync('supabase/migrations/20250108_add_sessions_and_capsules.sql', 'utf-8');
        
        console.log('🚀 Application de la migration...');
        
        // Exécuter la migration via RPC
        const { data, error } = await supabase.rpc('exec_sql', {
            sql: migrationSQL
        });
        
        if (error) {
            console.error('❌ Erreur lors de l\'application de la migration:', error);
            
            // Essayer une approche alternative : diviser en statements
            console.log('\n🔄 Tentative avec une approche alternative...');
            const statements = migrationSQL
                .split(';')
                .map(s => s.trim())
                .filter(s => s && !s.startsWith('--'));
            
            for (const statement of statements) {
                console.log(`Exécution: ${statement.substring(0, 50)}...`);
                const { error: stmtError } = await supabase.rpc('exec_sql', {
                    sql: statement + ';'
                });
                
                if (stmtError) {
                    console.error(`❌ Erreur: ${stmtError.message}`);
                } else {
                    console.log('✅ Succès');
                }
            }
        } else {
            console.log('✅ Migration appliquée avec succès !');
        }
    } catch (err) {
        console.error('❌ Erreur:', err.message);
    }
}

applyMigration();

