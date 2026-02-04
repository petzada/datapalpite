import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CookieConsentProvider } from "@/components/cookies";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Data Palpite | Gestão de Banca e Apostas com IA",
  description: "Gestão de banca automatizada e consulta com IA avançada, rápido e fácil. A ferramenta definitiva para o apostador profissional.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="overflow-x-hidden scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased overflow-x-hidden`}>
        <CookieConsentProvider>
          {children}
        </CookieConsentProvider>
      </body>
    </html>
  );
}
