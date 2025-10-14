
'use client';

import React from 'react';
import { Calendar, AlertTriangle, Wind, Waves, Sun } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { ContextData } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

interface InfoLineProps {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}

const InfoLine = ({ icon: Icon, label, value }: InfoLineProps) => (
  <div className="flex items-center gap-4 text-sm">
    <Icon className="w-5 h-5 text-primary" />
    <span className="w-16 text-muted-foreground">{label}</span>
    <span className="font-semibold text-foreground">{value}</span>
  </div>
);

export function ContextDisplay({ contextData }: { contextData: ContextData }) {
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Conditions Actuelles</CardTitle>
        <CardDescription className="flex items-center gap-2 pt-1">
          <Calendar className="w-4 h-4" />
          <span>Aujourd'hui - Pleine mer à {contextData.tide.high}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <InfoLine icon={Sun} label="Météo" value={`${contextData.weather.condition}, ${contextData.weather.temp}`} />
          <InfoLine icon={Wind} label="Vent" value={contextData.weather.wind} />
          <InfoLine icon={Waves} label="Marée" value={`${contextData.tide.current}, Coeff. ${contextData.tide.coefficient}`} />
        </div>

        {contextData.alerts.length > 0 && (
          <div>
            <Separator className="my-4" />
            <Alert variant="default" className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertTitle className="text-yellow-800 dark:text-yellow-200 font-semibold">Alertes & Observations</AlertTitle>
              <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  {contextData.alerts.map((alert, index) => (
                    <li key={index}>{alert}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
