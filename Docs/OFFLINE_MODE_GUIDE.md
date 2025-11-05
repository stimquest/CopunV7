# 📱 Guide du Mode Hors Ligne (Offline)

## 🎯 Vue d'ensemble

L'application **Cop'un de la Mer** supporte maintenant un vrai mode hors ligne (offline). Cela signifie que vous pouvez :

- ✅ Consulter vos stages même sans connexion
- ✅ Accéder aux données en cache (stages, sorties, fiches pédagogiques)
- ✅ Naviguer dans l'application
- ✅ Voir vos données de progression (stockées localement)
- ✅ Synchroniser automatiquement quand la connexion revient

## 🔧 Architecture Offline

### Composants Clés

1. **`supabase-offline.ts`** - Classe qui gère les requêtes offline
   - Détecte si l'app est online/offline
   - Utilise le cache quand offline
   - Synchronise les données quand online

2. **`offline-cache.ts`** - Système de cache localStorage
   - Cache les stages, sorties, jeux, contenu pédagogique
   - Expiration automatique après 24h
   - Queue pour les actions offline

3. **`offline-actions.ts`** - Fonctions client offline-aware
   - `getStagesOfflineAware()`
   - `getSortiesForStageOfflineAware()`
   - `getPedagogicalContentOfflineAware()`
   - `getGamesOfflineAware()`

4. **`ConnectionStatus`** - Composant UI
   - Affiche le statut de connexion
   - Notifie quand la connexion revient

### Flux de Données

```
┌─────────────────────────────────────────┐
│  Page Client (stages/page.tsx)          │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  offline-actions.ts                     │
│  (getStagesOfflineAware, etc.)          │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  supabase-offline.ts                    │
│  (Détecte online/offline)               │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
    ┌────────┐        ┌──────────┐
    │ Online │        │ Offline  │
    └────┬───┘        └────┬─────┘
         │                 │
         ▼                 ▼
    ┌─────────────┐   ┌──────────────┐
    │ Supabase    │   │ localStorage │
    │ (API)       │   │ (Cache)      │
    └─────────────┘   └──────────────┘
```

## 🧪 Comment Tester le Mode Offline

### Méthode 1 : Utiliser les DevTools du Navigateur

1. **Ouvrir l'app** : `http://localhost:3000`
2. **Charger les données** : Naviguer vers `/stages` pour charger les stages
3. **Ouvrir DevTools** : `F12` ou `Ctrl+Shift+I`
4. **Aller à l'onglet Network**
5. **Cocher "Offline"** dans les DevTools
6. **Recharger la page** : `F5`
7. **Vérifier** : Les stages doivent s'afficher depuis le cache

### Méthode 2 : Désactiver la Connexion Réseau

1. **Désactiver le WiFi/Ethernet** sur votre ordinateur
2. **Recharger l'app** : `F5`
3. **Vérifier** : L'app doit afficher "Mode hors ligne"
4. **Naviguer** : Vous pouvez consulter les données en cache

### Méthode 3 : Utiliser le Throttling

1. **DevTools** → **Network**
2. **Sélectionner "Offline"** dans le dropdown de throttling
3. **Recharger** : `F5`

## 📊 Données Cachées

Les données suivantes sont automatiquement cachées :

| Données | Clé Cache | Expiration |
|---------|-----------|-----------|
| Stages | `copun_cache_stages` | 24h |
| Stage (détail) | `copun_cache_stage_{id}` | 24h |
| Sorties | `copun_cache_sorties_{stageId}` | 24h |
| Jeux | `copun_cache_games` | 24h |
| Cartes de jeu | `copun_cache_game_cards` | 24h |
| Contenu pédagogique | `copun_cache_pedagogical_content` | 24h |
| Queue offline | `copun_cache_offline_queue` | Persistant |

## 🔄 Synchronisation Automatique

Quand la connexion revient :

1. **Détection** : L'app détecte automatiquement le retour de la connexion
2. **Notification** : Un message "Connexion rétablie" s'affiche
3. **Synchronisation** : Les actions en queue sont synchronisées
4. **Rafraîchissement** : Les données sont mises à jour

## 💾 Données Locales

Les données suivantes sont stockées localement (localStorage) :

- Progression des objectifs : `completed_objectives_{stageId}`
- Défis assignés : `assigned_defis_{stageId}`
- Historique des jeux : `game_history_{stageId}`
- Observations : `observations`

Ces données sont **toujours disponibles** même offline.

## ⚠️ Limitations Actuelles

- ❌ Créer/modifier/supprimer des stages offline (sera synchronisé quand online)
- ❌ Créer/modifier des jeux offline
- ✅ Consulter les données en cache
- ✅ Voir la progression locale
- ✅ Naviguer dans l'app

## 🚀 Prochaines Améliorations

1. **Synchronisation bidirectionnelle** - Permettre les modifications offline
2. **Indicateur de cache** - Montrer quand les données viennent du cache
3. **Gestion du stockage** - Permettre de vider le cache manuellement
4. **Sync en arrière-plan** - Synchroniser les données en background
5. **Notifications de sync** - Notifier quand la sync est complète

## 🐛 Dépannage

### L'app dit "Mode hors ligne" mais je suis connecté

- Vérifier la connexion réseau
- Vérifier les DevTools (Network tab)
- Recharger la page : `F5`

### Les données ne s'affichent pas offline

- Vérifier que vous avez d'abord chargé les données online
- Vérifier le localStorage : `DevTools` → `Application` → `Local Storage`
- Chercher les clés commençant par `copun_cache_`

### Les données ne se synchronisent pas

- Vérifier la connexion réseau
- Vérifier la console : `DevTools` → `Console`
- Chercher les erreurs Supabase

## 📝 Notes pour les Développeurs

### Ajouter une Nouvelle Fonction Offline

1. **Ajouter la méthode dans `supabase-offline.ts`**
   ```typescript
   async getMyData() {
     if (this.isOnline()) {
       // Fetch from Supabase
       // Cache the data
     } else {
       // Return cached data
     }
   }
   ```

2. **Ajouter le cache dans `offline-cache.ts`**
   ```typescript
   cacheMyData(data: any[]): void {
     this.set('my_data', data);
   }
   
   getCachedMyData(): any[] | null {
     return this.get('my_data');
   }
   ```

3. **Ajouter la fonction wrapper dans `offline-actions.ts`**
   ```typescript
   export async function getMyDataOfflineAware() {
     const { data, error } = await supabaseOffline.getMyData();
     return data || [];
   }
   ```

4. **Utiliser dans les pages client**
   ```typescript
   import { getMyDataOfflineAware } from '@/lib/offline-actions';
   
   const data = await getMyDataOfflineAware();
   ```

---

**Créé** : Octobre 2025  
**Statut** : ✅ Mode offline fonctionnel  
**Version** : 1.0.0

