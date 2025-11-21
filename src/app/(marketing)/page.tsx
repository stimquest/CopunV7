'use client';

import Link from 'next/link';
import {
    BookOpen,
    Shield,
    Eye,
    Smartphone,
    Zap,
    Users,
    Trophy,
    ArrowRight,
    Menu,
    Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';

export default function MarketingPage() {
    const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-2">
                        <img
                            src="/assets/logoBaleine.png"
                            alt="Logo Cop'un avec la Mer"
                            className="h-8 w-auto"
                        />
                        <span className="text-xl font-bold text-blue-800">Cop'un avec la Mer</span>
                    </div>
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600">
                            Fonctionnalités
                        </Link>
                        <Link href="#method" className="text-sm font-medium text-slate-600 hover:text-blue-600">
                            Méthode
                        </Link>
                        <Link href="#about" className="text-sm font-medium text-slate-600 hover:text-blue-600">
                            À propos
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login">
                            <Button variant="ghost" className="text-slate-700 hover:text-blue-600">
                                Connexion
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                Commencer
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-slate-50 pt-16 md:pt-24 lg:pt-32 pb-16">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
                        <div className="flex flex-col justify-center space-y-8">
                            <div className="space-y-4">
                                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl xl:text-6xl">
                                    L'outil pédagogique pour une pratique nautique <span className="text-blue-600">consciente et durable</span>.
                                </h1>
                                <p className="max-w-[600px] text-lg text-slate-600 md:text-xl leading-relaxed">
                                    Transformez chaque sortie en mer en une opportunité d'apprentissage.
                                    Aidez vos moniteurs à devenir des ambassadeurs de l'environnement sans alourdir leur charge de travail.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/login">
                                    <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 text-lg">
                                        Essayer gratuitement
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <Link href="#features">
                                    <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-lg border-slate-300 text-slate-700 hover:bg-slate-50">
                                        En savoir plus
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        <div className="relative mx-auto w-full max-w-[800px] lg:max-w-none flex justify-center items-center lg:justify-end">
                            <img
                                src="/assets/COPUNMER01.png"
                                alt="Interface Cop'un de la Mer"
                                className="w-full h-auto object-contain lg:w-[140%] lg:max-w-none lg:translate-x-24"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Constat Section */}
            <section className="py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            Un Terrain de Jeu à Préserver
                        </h2>
                        <p className="mt-4 text-lg text-slate-600">
                            Le littoral est un espace exceptionnel mais fragile. Aujourd'hui, il manque un outil simple pour lier l'apprentissage technique à la conscience environnementale.
                        </p>
                    </div>
                    <div className="grid gap-8 md:grid-cols-3">
                        {[
                            {
                                icon: Zap,
                                title: "Gain de temps",
                                description: "Fini les fiches papier et la préparation fastidieuse. Tout est prêt et structuré."
                            },
                            {
                                icon: BookOpen,
                                title: "Pédagogie Cohérente",
                                description: "Un lien direct entre la technique sportive et la découverte du milieu marin."
                            },
                            {
                                icon: Users,
                                title: "Engagement Fort",
                                description: "Des outils ludiques pour motiver les pratiquants et valoriser les moniteurs."
                            }
                        ].map((feature, index) => (
                            <div key={index} className="flex flex-col items-center text-center p-6 rounded-xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
                                <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                                    <feature.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                                <p className="text-slate-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Méthode Section */}
            <section id="method" className="py-16 md:py-24 bg-slate-900 text-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            La Méthode : Comprendre, Observer, Protéger
                        </h2>
                        <p className="mt-4 text-lg text-slate-300">
                            Notre approche s'articule autour de trois piliers fondamentaux pour une connaissance complète du milieu marin.
                        </p>
                    </div>
                    <div className="grid gap-8 md:grid-cols-3">
                        <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 hover:bg-slate-800 transition-colors">
                            <BookOpen className="h-10 w-10 text-blue-400 mb-6" />
                            <h3 className="text-2xl font-bold mb-4">Comprendre</h3>
                            <p className="text-slate-300 leading-relaxed">
                                Acquérir les savoirs essentiels sur le lieu géographique : marées, météo, activités humaines, biodiversité...
                            </p>
                        </div>
                        <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 hover:bg-slate-800 transition-colors">
                            <Eye className="h-10 w-10 text-emerald-400 mb-6" />
                            <h3 className="text-2xl font-bold mb-4">Observer</h3>
                            <p className="text-slate-300 leading-relaxed">
                                Développer la capacité à lire l'espace d'évolution : amers, courants, état de la mer, faune...
                            </p>
                        </div>
                        <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 hover:bg-slate-800 transition-colors">
                            <Shield className="h-10 w-10 text-amber-400 mb-6" />
                            <h3 className="text-2xl font-bold mb-4">Protéger</h3>
                            <p className="text-slate-300 leading-relaxed">
                                Agir concrètement pour préserver le site naturel : éco-gestes, zones sensibles, sciences participatives...
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-16 md:py-24 bg-blue-50">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid gap-12 lg:grid-cols-2 items-center mb-24">
                        <div className="space-y-6">
                            <div className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-800">
                                Gestion Simplifiée
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900">Gestion des Stages & Séances</h3>
                            <p className="text-lg text-slate-600">
                                Un outil centralisé pour organiser vos stages, planifier vos séances et suivre vos groupes efficacement.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Création intuitive de stages",
                                    "Planification flexible des séances",
                                    "Gestion des groupes et niveaux",
                                    "Vue d'ensemble du calendrier"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                                            <ArrowRight className="h-3 w-3" />
                                        </div>
                                        <span className="text-slate-700">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-200 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                            <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden relative">
                                <img
                                    src="/assets/cap1stages.png"
                                    alt="Interface de Gestion des Stages"
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-12 lg:grid-cols-2 items-center mb-24">
                        <div className="order-2 lg:order-1">
                            <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-200 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                                <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden relative">
                                    <img
                                        src="/assets/cap5prog.png"
                                        alt="Interface Constructeur de Programme"
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2 space-y-6">
                            <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800">
                                Fonctionnalité Clé
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900">Le Constructeur de Programme Environnement</h3>
                            <p className="text-lg text-slate-600">
                                En 4 étapes simples, créez un programme pédagogique complet et sur-mesure.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Choix du niveau du groupe",
                                    "Sélection des thèmes principaux",
                                    "Sélection des fiches-objectifs (65+ disponibles)",
                                    "Validation et auto-évaluation"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                                            <ArrowRight className="h-3 w-3" />
                                        </div>
                                        <span className="text-slate-700">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="grid gap-12 lg:grid-cols-2 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800">
                                Sur le Terrain
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900">Suivi Simplifié & Gamification</h3>
                            <p className="text-lg text-slate-600">
                                Fini les fiches papier ! Une interface claire, interactive et ludique pour animer vos séances.
                            </p>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                                    <Trophy className="h-6 w-6 text-amber-500 mb-2" />
                                    <h4 className="font-semibold text-slate-900">Défis & Exploits</h4>
                                    <p className="text-sm text-slate-500">Motivez vos groupes avec des challenges ludiques.</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                                    <Eye className="h-6 w-6 text-blue-500 mb-2" />
                                    <h4 className="font-semibold text-slate-900">Sciences Participatives</h4>
                                    <p className="text-sm text-slate-500">Transformez les moniteurs en sentinelles de la mer.</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-200 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                            <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden relative">
                                <img
                                    src="/assets/cap4suivi.png"
                                    alt="Interface Mobile de Suivi"
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="bg-blue-600 rounded-3xl p-8 md:p-16 text-center text-white overflow-hidden relative">
                        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                            <h2 className="text-3xl font-bold sm:text-4xl">
                                Rejoignez le mouvement Cop'un de la Mer
                            </h2>
                            <p className="text-blue-100 text-lg">
                                Faites de chaque vague une vague de conscience. Commencez dès aujourd'hui à transformer vos stages.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Link href="/login">
                                    <Button size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 h-12 px-8 font-semibold">
                                        Se connecter
                                    </Button>
                                </Link>
                                <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="lg" variant="outline" className="w-full sm:w-auto border-blue-400 text-blue-700 hover:bg-blue-700 h-12 px-8">
                                            Nous contacter
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle className="flex items-center gap-2">
                                                <Mail className="h-5 w-5" />
                                                Contactez-nous
                                            </DialogTitle>
                                            <DialogDescription>
                                                Pour toute question ou demande d'information, n'hésitez pas à nous contacter par email.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="py-4">
                                            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                                                <Mail className="h-6 w-6 text-blue-600" />
                                                <div>
                                                    <p className="font-medium text-blue-900">Email</p>
                                                    <a
                                                        href="mailto:contact@copundelamer.com"
                                                        className="text-blue-700 hover:text-blue-900 hover:underline"
                                                    >
                                                        contact@copundelamer.com
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button onClick={() => setIsContactDialogOpen(false)} variant="outline">
                                                Fermer
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                        {/* Decorative circles */}
                        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500 rounded-full opacity-50 blur-3xl"></div>
                        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-64 h-64 bg-blue-400 rounded-full opacity-50 blur-3xl"></div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-50 border-t border-slate-200 py-12 text-slate-600">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid gap-8 md:grid-cols-4">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <img
                                    src="/assets/logoBaleine.png"
                                    alt="Logo Cop'un de la Mer"
                                    className="h-6 w-6 text-blue-600"
                                />
                                <span className="text-xl font-bold text-slate-900">Cop'un avec la Mer</span>
                            </div>
                            <p className="text-sm">
                                L'application de référence pour l'enseignement nautique durable.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-900 mb-4">Produit</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="#" className="hover:text-blue-600">Fonctionnalités</Link></li>
                                <li><Link href="#" className="hover:text-blue-600">Tarifs</Link></li>
                                <li><Link href="#" className="hover:text-blue-600">Témoignages</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-900 mb-4">Ressources</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="#" className="hover:text-blue-600">Documentation</Link></li>
                                <li><Link href="#" className="hover:text-blue-600">Blog</Link></li>
                                <li><Link href="#" className="hover:text-blue-600">Support</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-900 mb-4">Légal</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/legal" className="hover:text-blue-600">Mentions légales</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-slate-200 text-center text-sm">
                        <p>&copy; {new Date().getFullYear()} Cop'un de la Mer. Tous droits réservés.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
