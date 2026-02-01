"use server";

import { createClient } from "@/lib/supabase/server";

// Tipos para os gráficos
export interface BankrollEvolutionData {
    date: string; // Formato "dd/mm"
    saldo: number;
}

export interface RoiBySportData {
    sport: string;
    roi: number;
    profit: number;
    volume: number;
    betsCount: number;
}

export interface DashboardChartsData {
    evolutionData: BankrollEvolutionData[];
    roiData: RoiBySportData[];
}

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

export async function getDashboardCharts(): Promise<DashboardChartsData> {
    const supabase = await createClient();

    // Buscar bancas para saldo inicial
    const { data: bancas } = await supabase
        .from("bancas")
        .select("saldo_inicial");

    const saldoInicial = bancas?.reduce((acc, b) => acc + (b.saldo_inicial || 0), 0) || 0;

    // Buscar apostas finalizadas com eventos para calcular evolução e ROI por esporte
    const { data: apostas } = await supabase
        .from("apostas")
        .select(`
            id,
            tipo,
            status,
            stake,
            lucro_prejuizo,
            created_at,
            aposta_eventos (
                esporte
            )
        `)
        .in("status", ["ganha", "perdida", "anulada"])
        .order("created_at", { ascending: true });

    // ===== EVOLUÇÃO DA BANCA =====
    const evolutionMap = new Map<string, number>();
    let saldoAtual = saldoInicial;

    apostas?.forEach((aposta) => {
        saldoAtual += aposta.lucro_prejuizo || 0;
        const dateObj = new Date(aposta.created_at);
        const dateKey = `${String(dateObj.getDate()).padStart(2, "0")}/${String(dateObj.getMonth() + 1).padStart(2, "0")}`;
        evolutionMap.set(dateKey, saldoAtual);
    });

    // Converter Map para array ordenado cronologicamente
    const evolutionData: BankrollEvolutionData[] = [];

    // Se tiver apostas, adicionar ponto inicial
    if (apostas && apostas.length > 0) {
        const firstDate = new Date(apostas[0].created_at);
        firstDate.setDate(firstDate.getDate() - 1);
        const initialDateKey = `${String(firstDate.getDate()).padStart(2, "0")}/${String(firstDate.getMonth() + 1).padStart(2, "0")}`;
        evolutionData.push({ date: initialDateKey, saldo: saldoInicial });
    }

    evolutionMap.forEach((saldo, date) => {
        evolutionData.push({ date, saldo });
    });

    // ===== ROI POR ESPORTE =====
    const sportStats = new Map<string, { profit: number; volume: number; betsCount: number }>();

    apostas?.forEach((aposta) => {
        const eventos = aposta.aposta_eventos as { esporte: string }[] | null;
        let sportCategory: string;

        if (!eventos || eventos.length === 0) {
            sportCategory = "Outros";
        } else if (aposta.tipo === "simples" || eventos.length === 1) {
            // Aposta simples: usa o esporte do único evento
            sportCategory = eventos[0].esporte || "Outros";
        } else {
            // Aposta múltipla: verificar se todos são do mesmo esporte
            const uniqueSports = [...new Set(eventos.map(e => e.esporte))];
            if (uniqueSports.length === 1) {
                sportCategory = uniqueSports[0] || "Outros";
            } else {
                sportCategory = "Combinadas";
            }
        }

        const current = sportStats.get(sportCategory) || { profit: 0, volume: 0, betsCount: 0 };
        sportStats.set(sportCategory, {
            profit: current.profit + (aposta.lucro_prejuizo || 0),
            volume: current.volume + (aposta.stake || 0),
            betsCount: current.betsCount + 1,
        });
    });

    const roiData: RoiBySportData[] = [];
    sportStats.forEach((stats, sport) => {
        const roi = stats.volume > 0 ? (stats.profit / stats.volume) * 100 : 0;
        roiData.push({
            sport,
            roi: Number(roi.toFixed(2)),
            profit: stats.profit,
            volume: stats.volume,
            betsCount: stats.betsCount,
        });
    });

    // Ordenar por ROI decrescente
    roiData.sort((a, b) => b.roi - a.roi);

    return {
        evolutionData,
        roiData,
    };
}
