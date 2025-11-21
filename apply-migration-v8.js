// Script pour appliquer la migration V8 à Supabase via SQL Editor
import fs from 'fs';
import path from 'path';

// Lire le fichier de migration
const migrationPath = path.join(process.cwd(), 'supabase/migrations/20250108_add_sessions_and_capsules.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

console.log('📋 Migration V8 - Sessions and Capsules');
console.log('=' .repeat(60));
console.log('\n✅ Fichier de migration lu avec succès');
console.log(`📁 Chemin: ${migrationPath}`);
console.log(`📊 Taille: ${migrationSQL.length} caractères`);

console.log('\n🚀 Instructions pour appliquer la migration:');
console.log('=' .repeat(60));

console.log('\n1️⃣  Ouvrir Supabase Studio:');
console.log('   → https://app.supabase.com');
console.log('   → Connectez-vous à votre projet');

console.log('\n2️⃣  Créer une nouvelle requête SQL:');
console.log('   → Cliquez sur "SQL Editor" dans le menu de gauche');
console.log('   → Cliquez sur "New Query"');
console.log('   → Donnez-lui un nom: "V8 Migration - Sessions and Capsules"');

console.log('\n3️⃣  Copier le SQL ci-dessous:');
console.log('=' .repeat(60));
console.log(migrationSQL);
console.log('=' .repeat(60));

console.log('\n4️⃣  Exécuter la migration:');
console.log('   → Collez le SQL dans l\'éditeur');
console.log('   → Cliquez sur "Run" (ou Ctrl+Enter)');
console.log('   → Attendez que la migration se termine');

console.log('\n5️⃣  Vérifier le succès:');
console.log('   → Allez dans "Table Editor"');
console.log('   → Vous devriez voir les 5 nouvelles tables:');
console.log('     • sessions');
console.log('     • session_structure');
console.log('     • environment_capsules');
console.log('     • capsule_content');
console.log('     • session_capsules');

console.log('\n6️⃣  Tester les tables:');
console.log('   → Exécutez: node test-v8-tables.js');

console.log('\n✨ Migration prête à être appliquée!');

