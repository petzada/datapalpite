import { getApostas } from "@/lib/actions/apostas";
import { getBancas } from "@/lib/actions/bancas";
import { ApostasClient } from "@/components/apostas";

export const dynamic = "force-dynamic";

export default async function ApostasPage() {
    const [apostasPendentes, apostasFinalizadas, bancas] = await Promise.all([
        getApostas("pendente"),
        getApostas("finalizada"),
        getBancas(),
    ]);

    return (
        <ApostasClient
            apostasPendentes={apostasPendentes}
            apostasFinalizadas={apostasFinalizadas}
            bancas={bancas}
        />
    );
}
