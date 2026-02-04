import { Metadata } from "next";
import { AiChat } from "@/components/ferramentas";

export const metadata: Metadata = {
    title: "Consulta IA | Data Palpite",
    description: "Consulte estatísticas de futebol com inteligência artificial.",
};

export default function ConsultaIaPage() {
    return (
        <div className="w-full">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Consulta IA</h1>
                <p className="text-muted-foreground mt-1">
                    Pergunte sobre classificações, resultados e estatísticas de futebol.
                </p>
            </div>
            <AiChat />
        </div>
    );
}
