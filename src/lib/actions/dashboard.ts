"use server";

import { createClient } from "@/lib/supabase/server";

export interface DashboardStats {
    // Saldo
    saldoTotal: number;

    // Apostas
    totalApostas: number;
    apostasGanhas: number;
    apostasPerdidas: number;
    apostasAnuladas: number;

    // Financial
    totalStakes: number;
    totalPL: number;

    // Odds
    oddMedia: number;

    // Config
    stakePercentualMedio: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const supabase = await createClient();

    // Buscar bancas para saldo e stake %
    const { data: bancas } = await supabase
        .from("bancas")
        .select("saldo_inicial, stake_percentual");

    // Buscar apostas finalizadas
    const { data: apostas } = await supabase
        .from("apostas")
        .select("status, stake, odds_total, lucro_prejuizo")
        .neq("status", "pendente");

    // Calcular métricas
    const saldoInicial = bancas?.reduce((acc, b) => acc + (b.saldo_inicial || 0), 0) || 0;
    const stakePercentualMedio = bancas?.length
        ? bancas.reduce((acc, b) => acc + (b.stake_percentual || 2), 0) / bancas.length
        : 2;

    const totalApostas = apostas?.length || 0;
    const apostasGanhas = apostas?.filter(a => a.status === "ganha").length || 0;
    const apostasPerdidas = apostas?.filter(a => a.status === "perdida").length || 0;
    const apostasAnuladas = apostas?.filter(a => a.status === "anulada").length || 0;

    const totalStakes = apostas?.reduce((acc, a) => acc + (a.stake || 0), 0) || 0;
    const totalPL = apostas?.reduce((acc, a) => acc + (a.lucro_prejuizo || 0), 0) || 0;

    const oddsSum = apostas?.reduce((acc, a) => acc + (a.odds_total || 0), 0) || 0;
    const oddMedia = totalApostas > 0 ? oddsSum / totalApostas : 1.9;

    return {
        saldoTotal: saldoInicial + totalPL,
        totalApostas,
        apostasGanhas,
        apostasPerdidas,
        apostasAnuladas,
        totalStakes,
        totalPL,
        oddMedia,
        stakePercentualMedio,
    };
}
