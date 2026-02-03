import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Wallet, TrendingUp, Target } from "lucide-react";

export function Hero() {
    return (
        <section className="pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-40 lg:pb-28">
            <div className="container-main">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left - Text Content */}
                    <div className="max-w-xl">
                        {/* Headline */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
                            Pare de quebrar a banca.{" "}
                            <span className="text-primary">Aposte com inteligência.</span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                            Gestão de banca automatizada e consulta com IA avançada, rápido e fácil. A ferramenta definitiva para o apostador casual e profissional.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/login?mode=signup">
                                <Button size="lg" className="rounded-full px-8 h-12 text-base">
                                    Comece agora
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                            <Link href="#features">
                                <Button variant="outline" size="lg" className="rounded-full px-8 h-12 text-base">
                                    Ver funcionalidades
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Right - Dashboard Mockup (the one with sidebar - user's favorite) */}
                    <div className="relative lg:pl-8">
                        <div className="bg-white rounded-2xl border shadow-xl overflow-hidden">
                            {/* Sidebar + Main Area */}
                            <div className="flex">
                                {/* Sidebar */}
                                <div className="w-16 sm:w-20 bg-primary p-3 sm:p-4 hidden sm:flex flex-col gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">DP</span>
                                    </div>
                                    <div className="space-y-3 mt-4">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className={`w-8 h-8 rounded-lg ${i === 1 ? 'bg-white/30' : 'bg-white/10'}`} />
                                        ))}
                                    </div>
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 p-4 sm:p-6">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h4 className="font-semibold text-sm sm:text-base">Dashboard</h4>
                                            <p className="text-xs text-muted-foreground">Bem-vindo de volta!</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-primary" />
                                            <span className="text-xs text-muted-foreground">Online</span>
                                        </div>
                                    </div>

                                    {/* Stats Row */}
                                    <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
                                        <div className="p-3 sm:p-4 bg-muted/50 rounded-xl">
                                            <Wallet className="w-4 h-4 text-primary mb-2" />
                                            <p className="text-[10px] sm:text-xs text-muted-foreground">Banca</p>
                                            <p className="text-sm sm:text-lg font-bold">R$ 15.200</p>
                                        </div>
                                        <div className="p-3 sm:p-4 bg-primary/10 rounded-xl">
                                            <TrendingUp className="w-4 h-4 text-primary mb-2" />
                                            <p className="text-[10px] sm:text-xs text-muted-foreground">ROI</p>
                                            <p className="text-sm sm:text-lg font-bold text-primary">+18.5%</p>
                                        </div>
                                        <div className="p-3 sm:p-4 bg-muted/50 rounded-xl">
                                            <Target className="w-4 h-4 text-primary mb-2" />
                                            <p className="text-[10px] sm:text-xs text-muted-foreground">Apostas</p>
                                            <p className="text-sm sm:text-lg font-bold">127</p>
                                        </div>
                                    </div>

                                    {/* Chart Area */}
                                    <div className="bg-muted/30 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-medium">Performance</span>
                                            <span className="text-xs text-primary font-semibold">+23.5%</span>
                                        </div>
                                        <div className="flex items-end gap-1 h-20">
                                            {[40, 55, 45, 65, 55, 70, 60, 80, 70, 85, 75, 95].map((h, i) => (
                                                <div
                                                    key={i}
                                                    className="flex-1 bg-primary/70 rounded-t"
                                                    style={{ height: `${h}%` }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
