import { Wallet, TrendingUp, BarChart3 } from "lucide-react";

const benefits = [
    {
        title: "Gestão de Banca",
        description: "Controle total das suas apostas, sem planilhas complexas. Visão clara do seu patrimônio.",
        icon: Wallet,
    },
    {
        title: "Inteligência Artificial",
        description: "Utilize ferramentas de consultas avançadas ao seu favor para tomar decisões baseadas em dados.",
        icon: TrendingUp,
    },
    {
        title: "Histórico de Performance",
        description: "Acompanhe seus indicadores (como ROI e Yield) em tempo real com gráficos precisos.",
        icon: BarChart3,
    },
];

export function Benefits() {
    return (
        <section className="section-padding">
            <div className="container-main">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {/* Card 1 - Gestão de Banca Mockup */}
                    <div className="p-6 lg:p-8 bg-white rounded-2xl border hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                        <div className="bg-muted/50 rounded-xl p-4 mb-5">
                            {/* Mini dashboard mockup */}
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-medium text-muted-foreground">Minhas Bancas</span>
                                <span className="w-2 h-2 rounded-full bg-primary" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                                            <Wallet className="w-3 h-3 text-primary" />
                                        </div>
                                        <span className="text-xs font-medium">Bet365</span>
                                    </div>
                                    <span className="text-xs font-bold">R$ 5.200</span>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                                            <Wallet className="w-3 h-3 text-primary" />
                                        </div>
                                        <span className="text-xs font-medium">Betano</span>
                                    </div>
                                    <span className="text-xs font-bold">R$ 3.100</span>
                                </div>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Gestão de Banca</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Controle total das suas apostas, sem planilhas complexas.
                        </p>
                    </div>

                    {/* Card 2 - IA Mockup */}
                    <div className="p-6 lg:p-8 bg-white rounded-2xl border hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                        <div className="bg-muted/50 rounded-xl p-4 mb-5">
                            {/* Chat/AI mockup */}
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                    <span className="text-white text-[10px] font-bold">IA</span>
                                </div>
                                <span className="text-xs font-medium text-muted-foreground">Consulta com IA</span>
                            </div>
                            <div className="space-y-2">
                                <div className="bg-white rounded-lg p-2">
                                    <p className="text-[10px] text-muted-foreground">Qual o melhor momento para...</p>
                                </div>
                                <div className="bg-primary/10 rounded-lg p-2 ml-4">
                                    <p className="text-[10px] text-primary">Baseado nos dados, recomendo...</p>
                                </div>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Inteligência Artificial</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Consultas avançadas para decisões baseadas em dados.
                        </p>
                    </div>

                    {/* Card 3 - Performance Mockup */}
                    <div className="p-6 lg:p-8 bg-white rounded-2xl border hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                        <div className="bg-muted/50 rounded-xl p-4 mb-5">
                            {/* Chart mockup */}
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-medium text-muted-foreground">Performance</span>
                                <span className="text-xs font-bold text-primary">+18.5%</span>
                            </div>
                            <div className="flex items-end gap-1 h-16">
                                {[35, 45, 40, 55, 50, 65, 60, 75].map((h, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 bg-primary/60 rounded-t"
                                        style={{ height: `${h}%` }}
                                    />
                                ))}
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Histórico de Performance</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Acompanhe ROI e Yield em tempo real com gráficos precisos.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
