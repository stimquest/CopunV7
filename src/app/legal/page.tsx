'use client';

import Link from 'next/link';
import { Anchor, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LegalPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-2">
                        <Anchor className="h-6 w-6 text-blue-600" />
                        <span className="text-xl font-bold text-slate-900">Cop'un de la Mer</span>
                    </div>
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Retour au site
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <main className="container mx-auto px-4 md:px-6 py-12">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                            Mentions légales
                        </h1>
                        <p className="text-lg text-slate-600">
                            Mentions légales applicables au site et à l'application Cop'un de la Mer
                        </p>
                    </div>

                    <div className="prose prose-lg max-w-none">
                        <div className="bg-white rounded-lg border border-slate-200 p-8 space-y-8">
                            {/* Éditeur du site et de l'application */}
                            <section>
                                <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Éditeur du site et de l'application</h2>
                                <div className="space-y-3 text-slate-700">
                                    <p><strong>Patrick Louvel EI – Stimquest</strong></p>
                                    <p>Entrepreneur Individuel</p>
                                    <p><strong>SIREN :</strong> 522 699 776</p>
                                    <p><strong>SIRET :</strong> 522 699 776 00038</p>
                                    <p><strong>Code NAF :</strong> 6201Z – Programmation informatique</p>
                                    <p><strong>Adresse professionnelle :</strong></p>
                                    <p>2 Chemin des Landiaux, 50560 Blainville-sur-Mer, France</p>
                                    <p><strong>Nom commercial :</strong> Stimquest</p>
                                    <p><strong>Nom de l'application :</strong> Copun avec la mer</p>
                                </div>
                            </section>

                            {/* Hébergeur du site */}
                            <section>
                                <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Hébergeur du site</h2>
                                <div className="space-y-3 text-slate-700">
                                    <p><strong>Netlify, Inc.</strong></p>
                                    <p>2325 3rd Street, Suite 296, San Francisco, California 94107</p>
                                    <p><strong>Site :</strong> <a href="https://www.netlify.com/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://www.netlify.com/</a></p>
                                </div>
                            </section>

                            {/* À compléter avec d'autres sections si nécessaire */}
                            <section>
                                <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. Propriété intellectuelle</h2>
                                <div className="space-y-3 text-slate-700">
                                    <p>Tous les éléments du site et de l'application Cop'un de la Mer, notamment les textes, images, graphismes, logos, icônes, sons, logiciels, sont la propriété exclusive de Stimquest ou de ses partenaires.</p>
                                    <p>Toute reproduction, distribution, modification, adaptation, retransmission ou publication, même partielle, de ces différents éléments est strictement interdite, sauf autorisation expresse et préalable de Stimquest.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Données personnelles</h2>
                                <div className="space-y-3 text-slate-700">
                                    <p>Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez de droits d'accès, de rectification, de suppression, de limitation, de portabilité et d'opposition au traitement de vos données personnelles.</p>
                                    <p>Pour exercer ces droits, vous pouvez nous contacter via les coordonnées mentionnées ci-dessus.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Cookies</h2>
                                <div className="space-y-3 text-slate-700">
                                    <p>Le site utilise des cookies pour améliorer votre expérience de navigation, analyser l'utilisation du site et vous proposer des fonctionnalités adaptées.</p>
                                    <p>En continuant à naviguer sur notre site, vous acceptez l'utilisation de ces cookies conformément à notre politique de confidentialité.</p>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-slate-50 border-t border-slate-200 py-8 mt-16">
                <div className="container mx-auto px-4 md:px-6 text-center text-slate-600">
                    <p>&copy; {new Date().getFullYear()} Cop'un de la Mer. Tous droits réservés.</p>
                </div>
            </footer>
        </div>
    );
}