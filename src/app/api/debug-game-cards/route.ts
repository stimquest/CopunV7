import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    if (action === 'pedagogical') {
      // Debug pour le contenu pédagogique
      console.log('=== DEBUG: Contenu pédagogique ===');

      const { data, error } = await supabase
        .from('pedagogical_content')
        .select('id, question, dimension, tags_theme')
        .limit(10);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        pedagogicalContent: data,
        message: `${data?.length || 0} fiches pédagogiques trouvées`
      });
    }

    console.log('=== DEBUG: Test connexion Supabase ===');
    console.log('URL Supabase:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Clé Supabase (premiers chars):', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...');

    // Test 1: Connexion basique
    const { data: testData, error: testError } = await supabase
      .from('game_cards')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('Erreur connexion Supabase:', testError);
      return NextResponse.json({ 
        error: 'Erreur connexion', 
        details: testError.message 
      }, { status: 500 });
    }
    
    // Test 2: Compter les cartes
    const { count, error: countError } = await supabase
      .from('game_cards')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Erreur count:', countError);
      return NextResponse.json({ 
        error: 'Erreur count', 
        details: countError.message 
      }, { status: 500 });
    }
    
    // Test 3: Récupérer quelques cartes
    const { data: cards, error: cardsError } = await supabase
      .from('game_cards')
      .select('*')
      .limit(5);
    
    if (cardsError) {
      console.error('Erreur récupération cartes:', cardsError);
      return NextResponse.json({ 
        error: 'Erreur récupération', 
        details: cardsError.message 
      }, { status: 500 });
    }
    
    console.log(`Nombre total de cartes: ${count}`);
    console.log('Premières cartes:', cards);
    
    // Test 4: Vérifier toutes les tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    return NextResponse.json({
      success: true,
      totalCards: count,
      sampleCards: cards,
      availableTables: tables?.map(t => t.table_name) || [],
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      message: `${count} cartes trouvées dans la base`
    });
    
  } catch (error) {
    console.error('Erreur générale:', error);
    return NextResponse.json({ 
      error: 'Erreur générale', 
      details: error instanceof Error ? error.message : 'Erreur inconnue' 
    }, { status: 500 });
  }
}
