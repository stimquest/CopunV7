
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CardEditor } from '@/components/admin/card-editor';
import { getPedagogicalContentById, updatePedagogicalContent } from '@/app/actions';
import type { PedagogicalContent } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function EditCardPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const cardId = params.cardId as string;
  const [card, setCard] = useState<PedagogicalContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (cardId) {
      getPedagogicalContentById(parseInt(cardId, 10)).then(cardData => {
        setCard(cardData);
        setLoading(false);
      });
    }
  }, [cardId]);

  const handleSave = async (data: Omit<PedagogicalContent, 'id'>) => {
    if (!card) return;
    setIsSaving(true);
    const success = await updatePedagogicalContent({ ...data, id: card.id });
    if (success) {
      toast({
        title: "Fiche mise à jour",
        description: "Les modifications ont été enregistrées.",
      });
      router.push('/admin/contenu');
    } else {
      toast({
        title: "Erreur",
        description: "La mise à jour de la fiche a échoué.",
        variant: "destructive",
      });
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!card) {
    return <p>Fiche non trouvée.</p>;
  }

  return (
    <CardEditor 
      initialData={card}
      onSave={handleSave}
      isSaving={isSaving}
    />
  );
}
