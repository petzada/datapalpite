import { getBancas } from "@/lib/actions/bancas";
import { BancasClient } from "@/components/bancas/BancasClient";

export default async function BancasPage() {
    const bancas = await getBancas();

    return <BancasClient bancas={bancas} />;
}
