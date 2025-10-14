

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, User, Users, Trophy } from 'lucide-react';
import type { Stage, Structure, StageExploit, Rank } from '@/lib/types';
import { rankConfig, getRankForDefis } from '@/lib/ranks';
import { structures } from '@/data/structures';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


interface MoniteurStats {
    username: string;
    clubId: string;
    clubName: string;
    defiCount: number; 
    rank: Rank;
}

interface ClubStats {
    clubId: string;
    clubName: string;
    defiCount: number;
    moniteurCount: number;
}


export default function ClassementPage() {
  const [loading, setLoading] = useState(true);
  const [moniteurStats, setMoniteurStats] = useState<MoniteurStats[]>([]);
  const [clubStats, setClubStats] = useState<ClubStats[]>([]);

  useEffect(() => {
    const calculateRankings = async () => {
        setLoading(true);

        // This is a simulation. In a real app, you'd fetch users and their clubs.
        // Here, we'll simulate a few users.
        const simulatedUsers = [
            { username: localStorage.getItem('econav_username') || 'Moniteur_Demo', structureId: localStorage.getItem('econav_structureId') || 'cnp' },
            { username: 'Alex', structureId: 'ycm' },
            { username: 'Sam', structureId: 'evb' },
            { username: 'Morgan', structureId: 'cnp' },
            { username: 'Charlie', structureId: 'sng' },
        ];
        
        // This is also a simulation. In a real app, you would fetch completed defis from a DB.
        const storedDefis = localStorage.getItem('user_completed_defis');
        const completedDefis = storedDefis ? JSON.parse(storedDefis) : [];
        const totalCompletedDefis = completedDefis.length;

        const defiCountByUser: { [username: string]: number } = {};

        // Distribute points for simulation
        simulatedUsers.forEach((user) => {
            let count = user.username === (localStorage.getItem('econav_username') || 'Moniteur_Demo') ? totalCompletedDefis : 0;
            if (user.username !== (localStorage.getItem('econav_username') || 'Moniteur_Demo')) {
                count += Math.floor(Math.random() * (totalCompletedDefis + 20)); // Give other users some random defis
            }
            defiCountByUser[user.username] = count;
        });

        const moniteurs = simulatedUsers.map(user => {
            const defiCount = defiCountByUser[user.username] || 0;
            const rank = getRankForDefis(defiCount);
            const club = structures.find(s => s.id === user.structureId);
            return {
                username: user.username,
                clubId: user.structureId,
                clubName: club?.name || 'Inconnu',
                defiCount,
                rank,
            };
        }).sort((a, b) => b.defiCount - a.defiCount);
        
        setMoniteurStats(moniteurs);
        
        // --- Calculate Club Stats ---
        const clubData: { [id: string]: { name: string; defiCount: number; moniteurCount: number } } = {};
        structures.forEach(s => {
            clubData[s.id] = { name: s.name, defiCount: 0, moniteurCount: 0 };
        });

        moniteurs.forEach(m => {
            if (clubData[m.clubId]) {
                clubData[m.clubId].defiCount += m.defiCount;
                clubData[m.clubId].moniteurCount++;
            }
        });
        
        const clubs = Object.entries(clubData)
            .map(([id, data]) => ({ clubId: id, ...data}))
            .filter(c => c.moniteurCount > 0)
            .sort((a,b) => b.defiCount - a.defiCount);

        setClubStats(clubs);
        setLoading(false);
    }
    
    calculateRankings();
  }, []);


  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground font-headline">Classements</h1>
        <p className="text-muted-foreground">Suivez la progression et la motivation des moniteurs et des clubs.</p>
      </div>
      
       <Tabs defaultValue="moniteurs">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="moniteurs">
            <User className="mr-2 h-4 w-4"/>Moniteurs
          </TabsTrigger>
          <TabsTrigger value="clubs">
            <Users className="mr-2 h-4 w-4" />Clubs
          </TabsTrigger>
        </TabsList>
        <TabsContent value="moniteurs">
          <Card>
            <CardHeader>
                <CardTitle>Classement des Moniteurs</CardTitle>
                <CardDescription>Basé sur le nombre de défis accomplis.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">Rang</TableHead>
                            <TableHead>Moniteur</TableHead>
                            <TableHead>Club</TableHead>
                            <TableHead className="text-right">Défis</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {moniteurStats.map((moniteur, index) => {
                            const RankIcon = moniteur.rank.icon;
                            return (
                                <TableRow key={moniteur.username}>
                                    <TableCell className="text-center">{index + 1}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <RankIcon className="w-6 h-6" style={{color: moniteur.rank.color}}/>
                                            <div>
                                                <div className="font-medium">{moniteur.username}</div>
                                                <div className="text-xs text-muted-foreground">{moniteur.rank.name}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{moniteur.clubName}</TableCell>
                                    <TableCell className="text-right font-semibold">{moniteur.defiCount}</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="clubs">
             <Card>
                <CardHeader>
                    <CardTitle>Classement des Clubs</CardTitle>
                    <CardDescription>Basé sur le nombre total de défis accomplis par tous les moniteurs du club.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">Rang</TableHead>
                                <TableHead>Club</TableHead>
                                <TableHead>Moniteurs</TableHead>
                                <TableHead className="text-right">Défis Totals</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clubStats.map((club, index) => (
                                <TableRow key={club.clubId}>
                                    <TableCell className="text-center">{index + 1}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                             <Avatar className="h-9 w-9">
                                                <AvatarFallback>{club.clubName ? club.clubName.substring(0, 2).toUpperCase() : '?'}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{club.clubName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{club.moniteurCount}</TableCell>
                                    <TableCell className="text-right font-semibold">{club.defiCount}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
