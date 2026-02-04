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

export interface BancaWithPL {
    id: string;
    nome: string;
    saldo_inicial: number;
    stake_percentual: number;
    totalPL: number;
    saldoAtual: number;
}

export async function getBancasWithPL(): Promise<BancaWithPL[]> {
    const supabase = await createClient();

    const [{ data: bancas }, { data: apostas }] = await Promise.all([
        supabase.from("bancas").select("id, nome, saldo_inicial, stake_percentual"),
        supabase.from("apostas").select("banca_id, lucro_prejuizo").neq("status", "pendente"),
    ]);

    if (!bancas) return [];

    const plByBanca = new Map<string, number>();
    apostas?.forEach((a) => {
        const current = plByBanca.get(a.banca_id) || 0;
        plByBanca.set(a.banca_id, current + (a.lucro_prejuizo || 0));
    });

    return bancas.map((b) => ({
        id: b.id,
        nome: b.nome,
        saldo_inicial: b.saldo_inicial,
        stake_percentual: b.stake_percentual,
        totalPL: plByBanca.get(b.id) || 0,
        saldoAtual: b.saldo_inicial + (plByBanca.get(b.id) || 0),
    }));
}

export interface DashboardFilters {
    periodo?: string;  // "7" | "30" | "90" | "365" | "all"
    bancaId?: string;  // UUID or "all"
}

function getDateFilter(periodo: string): Date | null {
    if (periodo === "all") return null;
    const days = parseInt(periodo, 10);
    if (isNaN(days)) return null;
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
}

export async function getDashboardStats(filters?: DashboardFilters): Promise<DashboardStats> {
    const supabase = await createClient();
    const periodo = filters?.periodo || "all";
    const bancaId = filters?.bancaId || "all";

    // Buscar bancas para saldo e stake %
    let bancasQuery = supabase
        .from("bancas")
        .select("id, saldo_inicial, stake_percentual");
    if (bancaId !== "all") {
        bancasQuery = bancasQuery.eq("id", bancaId);
    }
    const { data: bancas } = await bancasQuery;

    // Buscar apostas finalizadas
    let apostasQuery = supabase
        .from("apostas")
        .select("status, stake, odds_total, lucro_prejuizo, banca_id, created_at")
        .neq("status", "pendente");
    if (bancaId !== "all") {
        apostasQuery = apostasQuery.eq("banca_id", bancaId);
    }
    const dateFilter = getDateFilter(periodo);
    if (dateFilter) {
        apostasQuery = apostasQuery.gte("created_at", dateFilter.toISOString());
    }
    const { data: apostas } = await apostasQuery;

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

export interface MultiSeriesEvolutionData {
    date: string;
    total: number;
    [bancaNome: string]: number | string; // dynamic keys per banca
}

export interface DashboardChartsDataV2 {
    evolutionData: MultiSeriesEvolutionData[];
    roiData: RoiBySportData[];
    bancaNomes: string[]; // list of banca names for chart legend
}

export async function getDashboardCharts(filters?: DashboardFilters): Promise<DashboardChartsDataV2> {
    const supabase = await createClient();
    const periodo = filters?.periodo || "all";
    const bancaId = filters?.bancaId || "all";

    // Buscar bancas para saldo inicial
    let bancasQuery = supabase
        .from("bancas")
        .select("id, nome, saldo_inicial");
    if (bancaId !== "all") {
        bancasQuery = bancasQuery.eq("id", bancaId);
    }
    const { data: bancas } = await bancasQuery;

    const bancaMap = new Map<string, { nome: string; saldo_inicial: number }>();
    bancas?.forEach((b) => bancaMap.set(b.id, { nome: b.nome, saldo_inicial: b.saldo_inicial }));

    const saldoInicial = bancas?.reduce((acc, b) => acc + (b.saldo_inicial || 0), 0) || 0;

    // Buscar apostas finalizadas com eventos para calcular evolução e ROI por esporte
    let apostasQuery = supabase
        .from("apostas")
        .select(`
            id,
            tipo,
            status,
            stake,
            lucro_prejuizo,
            created_at,
            banca_id,
            aposta_eventos (
                esporte
            )
        `)
        .in("status", ["ganha", "perdida", "anulada"])
        .order("created_at", { ascending: true });
    if (bancaId !== "all") {
        apostasQuery = apostasQuery.eq("banca_id", bancaId);
    }
    const dateFilter = getDateFilter(periodo);
    if (dateFilter) {
        apostasQuery = apostasQuery.gte("created_at", dateFilter.toISOString());
    }
    const { data: apostas } = await apostasQuery;

    // ===== EVOLUÇÃO DA BANCA (MULTI-SÉRIES) =====
    // Track running saldo per banca and total
    const saldoPorBanca = new Map<string, number>();
    bancas?.forEach((b) => saldoPorBanca.set(b.id, b.saldo_inicial));
    let saldoTotal = saldoInicial;

    // Map date -> snapshot of all saldos
    const dateOrder: string[] = [];
    const snapshots = new Map<string, { total: number; byBanca: Map<string, number> }>();

    apostas?.forEach((aposta) => {
        const pl = aposta.lucro_prejuizo || 0;
        saldoTotal += pl;

        const currentBancaSaldo = saldoPorBanca.get(aposta.banca_id) || 0;
        saldoPorBanca.set(aposta.banca_id, currentBancaSaldo + pl);

        const dateObj = new Date(aposta.created_at);
        const dateKey = `${String(dateObj.getDate()).padStart(2, "0")}/${String(dateObj.getMonth() + 1).padStart(2, "0")}`;

        if (!snapshots.has(dateKey)) {
            dateOrder.push(dateKey);
        }

        snapshots.set(dateKey, {
            total: saldoTotal,
            byBanca: new Map(saldoPorBanca),
        });
    });

    const bancaNomes = bancas?.map((b) => b.nome) || [];
    const evolutionData: MultiSeriesEvolutionData[] = [];

    // Add initial data point
    if (apostas && apostas.length > 0) {
        const firstDate = new Date(apostas[0].created_at);
        firstDate.setDate(firstDate.getDate() - 1);
        const initialDateKey = `${String(firstDate.getDate()).padStart(2, "0")}/${String(firstDate.getMonth() + 1).padStart(2, "0")}`;
        const initialPoint: MultiSeriesEvolutionData = { date: initialDateKey, total: saldoInicial };
        bancas?.forEach((b) => {
            initialPoint[b.nome] = b.saldo_inicial;
        });
        evolutionData.push(initialPoint);
    }

    dateOrder.forEach((dateKey) => {
        const snapshot = snapshots.get(dateKey)!;
        const point: MultiSeriesEvolutionData = { date: dateKey, total: snapshot.total };
        bancas?.forEach((b) => {
            point[b.nome] = snapshot.byBanca.get(b.id) || b.saldo_inicial;
        });
        evolutionData.push(point);
    });

    // ===== ROI POR ESPORTE =====
    const sportStats = new Map<string, { profit: number; volume: number; betsCount: number }>();

    apostas?.forEach((aposta) => {
        const eventos = aposta.aposta_eventos as { esporte: string }[] | null;
        let sportCategory: string;

        if (!eventos || eventos.length === 0) {
            sportCategory = "Outros";
        } else if (aposta.tipo === "simples" || eventos.length === 1) {
            sportCategory = eventos[0].esporte || "Outros";
        } else {
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

    roiData.sort((a, b) => b.roi - a.roi);

    return {
        evolutionData,
        roiData,
        bancaNomes,
    };
}
