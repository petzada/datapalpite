import { Quote } from "lucide-react";

const testimonials = [
    {
        name: "Ricardo",
        quote: "O Data Palpite mudou minha forma de enxergar a banca. Saí de um descontrole total para um ROI consistente de 15% ao mês. A organização é a chave.",
    },
    {
        name: "Ana Beatriz",
        quote: "As consultas com IA me ajudam a validar minhas entradas. É como ter um assistente de dados 24h por dia. Não opero mais sem consultar o sistema.",
    },
    {
        name: "Marcos",
        quote: "Interface limpa e profissional. Finalmente uma ferramenta que não parece um cassino colorido. É ferramenta de trabalho séria.",
    },
];

export function Testimonials() {
    return (
        <section className="section-padding">
            <div className="container-main">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                        Quem usa, recomenda
                    </h2>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                        Veja o que nossos usuários têm a dizer sobre a plataforma
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="p-6 bg-white rounded-2xl border hover:shadow-lg transition-all group"
                        >
                            <Quote className="w-8 h-8 text-primary/30 mb-4 group-hover:text-primary/50 transition-colors" />

                            <p className="text-muted-foreground text-sm leading-relaxed mb-6 italic">
                                "{testimonial.quote}"
                            </p>

                            <div className="border-t pt-4">
                                <p className="font-semibold">{testimonial.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
