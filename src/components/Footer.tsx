"use client"

import Link from "next/link";
import { useCookieConsent } from "@/contexts/CookieConsentContext";

const footerLinks = {
    produto: [
        { name: "Funcionalidades", href: "#features" },
        { name: "Planos", href: "#pricing" },
        { name: "Dúvidas", href: "#faq" },
    ],
    legal: [
        { name: "Termos de Uso", href: "/termos" },
        { name: "Privacidade", href: "/privacidade" },
    ],
};

export function Footer() {
    const { openPreferences } = useCookieConsent();

    return (
        <footer className="bg-primary text-white">
            <div className="container-main py-12 sm:py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {/* Brand */}
                    <div className="sm:col-span-2 lg:col-span-2">
                        <span className="text-xl font-bold mb-4 block">Data Palpite</span>
                        <p className="text-white/70 text-sm leading-relaxed max-w-sm">
                            A ferramenta definitiva para o apostador profissional. Gestão de banca automatizada e consulta com IA avançada.
                        </p>
                    </div>

                    {/* Produto */}
                    <div>
                        <h4 className="font-semibold mb-4">Produto</h4>
                        <ul className="space-y-3">
                            {footerLinks.produto.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-white/70 hover:text-white text-sm transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-semibold mb-4">Legal</h4>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-white/70 hover:text-white text-sm transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <button
                                    onClick={openPreferences}
                                    className="text-white/70 hover:text-white text-sm transition-colors"
                                >
                                    Preferências de Cookies
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider + Copyright */}
                <div className="border-t border-white/20 mt-12 pt-6 pb-2">
                    <p className="text-white/60 text-sm text-center">
                        © {new Date().getFullYear()} Data Palpite. Todos os direitos reservados.
                    </p>
                </div>
            </div>

            {/* Discrete Responsible Gaming Notice */}
            <div className="border-t border-white/10 py-3">
                <p className="text-white/40 text-xs text-center px-6">
                    Jogo Responsável: Apostas esportivas são entretenimento. Nunca aposte o que não pode perder.
                </p>
            </div>
        </footer>
    );
}
