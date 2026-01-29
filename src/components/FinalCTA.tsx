import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function FinalCTA() {
    return (
        <section className="section-padding bg-white border-t">
            <div className="container-main text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                    Pronto para profissionalizar suas apostas?
                </h2>
                <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                    Comece agora e tenha controle total da sua banca em minutos.
                </p>
                <Link href="/login?mode=signup">
                    <Button size="lg" className="rounded-full px-8 h-12 text-base">
                        Comece agora
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
            </div>
        </section>
    );
}
