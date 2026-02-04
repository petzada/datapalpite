import { Metadata } from "next";
import { EvCalculator } from "@/components/ferramentas";

export const metadata: Metadata = {
    title: "Calculadora EV+ | Data Palpite",
    description: "Calcule o Valor Esperado (EV) das suas apostas e identifique oportunidades de valor.",
};

export default function CalculadoraEvPage() {
    return (
        <div className="w-full">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Calculadora EV+</h1>
                <p className="text-muted-foreground mt-1">
                    Verifique matematicamente se uma aposta tem valor a longo prazo.
                </p>
            </div>
            <EvCalculator />
        </div>
    );
}
