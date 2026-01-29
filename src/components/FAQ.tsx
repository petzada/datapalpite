"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
    {
        question: "O Data Palpite serve para qualquer casa de aposta?",
        answer: "Sim! Como somos uma ferramenta de gestão e inteligência, você pode utilizar os dados e as análises em qualquer casa de apostas legalizada no Brasil ou no exterior.",
    },
    {
        question: "Consigo usar pelo celular?",
        answer: "Com certeza. Nossa plataforma é totalmente responsiva e foi otimizada para oferecer uma experiência fluida tanto em computadores quanto em dispositivos móveis.",
    },
    {
        question: "A inteligência artificial garante lucro?",
        answer: "Nenhuma ferramenta garante lucro no mercado de renda variável. A nossa IA fornece dados, tendências e probabilidades para que você tome decisões mais fundamentadas e profissionais.",
    },
    {
        question: "As casas de apostas são legalizadas no Brasil?",
        answer: "Existem casas de apostas já licenciadas e operando legalmente no Brasil. Para informações atualizadas sobre regulamentação, consulte os órgãos competentes responsáveis pela fiscalização do setor.",
    },
    {
        question: "Posso cancelar minha assinatura a qualquer momento?",
        answer: "Sim, não temos período de fidelidade. Você pode cancelar sua renovação diretamente no seu painel de controle com apenas um clique.",
    },
];

export function FAQ() {
    return (
        <section id="faq" className="section-padding">
            <div className="container-main">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
                        Dúvidas frequentes
                    </h2>

                    <Accordion type="single" collapsible className="space-y-3">
                        {faqs.map((faq, index) => (
                            <AccordionItem
                                key={index}
                                value={`item-${index}`}
                                className="bg-white border rounded-xl px-6 data-[state=open]:shadow-sm"
                            >
                                <AccordionTrigger className="text-left font-medium py-5 hover:no-underline">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground pb-5">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    );
}
