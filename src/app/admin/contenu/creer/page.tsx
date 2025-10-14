
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CardEditor } from '@/components/admin/card-editor';
import { createPedagogicalContent } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { PedagogicalContent } from '@/lib/types';

export default function CreateCardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (data: Omit<PedagogicalContent, 'id'>) => {
    setIsSaving(true);
    const newContent = await createPedagogicalContent(data);
    if (newContent) {
      toast({
        title: "Fiche créée",
        description: "La nouvelle fiche pédagogique a été ajoutée.",
      });
      router.push('/admin/contenu');
    } else {
      toast({
        title: "Erreur",
        description: "La création de la fiche a échoué.",
        variant: "destructive",
      });
      setIsSaving(false);
    }
  };

  return (
    <CardEditor 
      onSave={handleSave}
      isSaving={isSaving}
    />
  );
}
