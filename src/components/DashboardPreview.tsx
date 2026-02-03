import { Wallet, TrendingUp, Bot, Globe, Calculator, History } from "lucide-react";

const features = [
    {
        title: "Gestão de Banca",
        description: "Organize múltiplas bancas e controle cada centavo investido.",
        icon: Wallet,
    },
    {
        title: "Indicadores Inteligentes",
        description: "ROI, Win Rate, Profit/Loss e outros indicadores profissionais automáticos.",
        icon: TrendingUp,
    },
    {
        title: "Consulta com IA",
        description: "Analise tendências e probabilidades com nossa inteligência artificial.",
        icon: Bot,
    },
    {
        title: "Análises de Mercado",
        description: "Dados em tempo real sobre as principais ligas e eventos do mundo.",
        icon: Globe,
    },
    {
        title: "Calculadora EV+",
        description: "Identifique apostas de valor com vantagem matemática sobre a casa.",
        icon: Calculator,
    },
    {
        title: "Histórico de Confrontos",
        description: "Histórico completo de confrontos para análises mais precisas.",
        icon: History,
    },
];

export function DashboardPreview() {
    return (
        <section id="features" className="section-padding bg-muted/30">
            <div className="container-main">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                        Tudo que você precisa em um só lugar
                    </h2>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                        Ferramentas profissionais desenvolvidas por quem entende o mercado de apostas.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="p-6 bg-white rounded-2xl border hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                <feature.icon className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
