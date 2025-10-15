// Charger les variables d'environnement
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importGameCards() {
  try {
    console.log('🔍 Vérification de la table game_cards...');
    
    // Test de connexion
    const { data: testData, error: testError } = await supabase
      .from('game_cards')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erreur de connexion à la table game_cards:', testError.message);
      
      // Essayer de créer la table
      console.log('🔧 Tentative de création de la table...');
      const { error: createError } = await supabase.rpc('create_game_cards_table');
      
      if (createError) {
        console.error('❌ Impossible de créer la table:', createError.message);
        return;
      }
    }
    
    // Compter les cartes existantes
    const { count, error: countError } = await supabase
      .from('game_cards')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erreur lors du comptage:', countError.message);
      return;
    }
    
    console.log(`📊 Cartes existantes dans la base: ${count}`);
    
    // Lire le fichier CSV (si fourni)
    const csvPath = process.argv[2];
    if (csvPath && fs.existsSync(csvPath)) {
      console.log(`📁 Lecture du fichier CSV: ${csvPath}`);
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      console.log('📄 Contenu CSV (premiers 500 caractères):');
      console.log(csvContent.substring(0, 500) + '...');
      
      // TODO: Parser le CSV et insérer les données
      console.log('⚠️  Parsing CSV non implémenté - à faire manuellement');
    }
    
    // Créer quelques cartes de test
    console.log('🧪 Création de cartes de test...');
    
    const testCards = [
      {
        type: 'quizz',
        data: {
          theme: 'Marées',
          question: 'Que signifie un coefficient de marée de 120 ?',
          options: ['Marée très forte', 'Marée moyenne', 'Marée faible', 'Marée exceptionnelle'],
          correctAnswer: 0,
          explanation: 'Un coefficient de 120 indique une très grande marée (vive-eau exceptionnelle).',
          related_objective_id: 'q1'
        }
      },
      {
        type: 'triage',
        data: {
          theme: 'Sécurité',
          statement: 'Il faut toujours porter un gilet de sauvetage en mer',
          isTrue: true,
          related_objective_id: 'q2'
        }
      },
      {
        type: 'mots',
        data: {
          theme: 'Vocabulaire marin',
          definition: 'Partie avant d\'un bateau',
          answer: 'Proue',
          related_objective_id: 'q3'
        }
      }
    ];
    
    for (const card of testCards) {
      const { data, error } = await supabase
        .from('game_cards')
        .insert(card)
        .select()
        .single();
      
      if (error) {
        console.error(`❌ Erreur insertion carte ${card.type}:`, error.message);
      } else {
        console.log(`✅ Carte ${card.type} créée avec ID: ${data.id}`);
      }
    }
    
    // Vérification finale
    const { count: finalCount } = await supabase
      .from('game_cards')
      .select('*', { count: 'exact', head: true });
    
    console.log(`🎉 Import terminé! Total cartes: ${finalCount}`);
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Lancer l'import
importGameCards();
