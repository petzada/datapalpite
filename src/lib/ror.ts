/**
 * Cálculos de Risco de Ruína (RoR) para gestão de bancas de apostas
 */

export interface RoRData {
    winRate: number;        // Taxa de acerto (0-1)
    oddMedia: number;       // Odd média das apostas
    stakePercent: number;   // % da banca por aposta (ex: 2 = 2%)
    totalApostas: number;   // Total de apostas finalizadas
}

export interface RoRResult {
    rorReal: number;        // RoR baseado em dados reais (%)
    rorPlanejado: number;   // RoR baseado em stake planejado (%)
    hasRealData: boolean;   // Se tem dados suficientes para cálculo real
    isWarning: boolean;     // Se RoR real está muito acima do planejado
}

/**
 * Calcula o Risco de Ruína usando a fórmula clássica
 * 
 * @param winRate - Taxa de acerto (0-1)
 * @param oddMedia - Odd média
 * @param stakePercent - % da banca por aposta
 * @returns RoR em porcentagem (0-100)
 */
export function calcularRoR(winRate: number, oddMedia: number, stakePercent: number): number {
    // Edge (vantagem matemática)
    const edge = (winRate * oddMedia) - 1;

    // Se não há edge positivo, ruína é certa
    if (edge <= 0) return 100;

    // Número de unidades na banca
    const unidades = 100 / stakePercent;

    // Fórmula do RoR
    const q = (1 - edge) / (1 + edge);
    const ror = Math.pow(q, unidades) * 100;

    // Limitar entre 0 e 100
    return Math.max(0, Math.min(100, ror));
}

/**
 * Calcula RoR planejado baseado em parâmetros conservadores
 * Assume winRate de 55% e odd média de 1.90 como baseline
 */
export function calcularRoRPlanejado(stakePercent: number): number {
    const winRateConservador = 0.55;
    const oddMediaConservadora = 1.90;
    return calcularRoR(winRateConservador, oddMediaConservadora, stakePercent);
}

/**
 * Processa dados de apostas e retorna resultado completo de RoR
 */
export function processarRoR(data: RoRData): RoRResult {
    const MIN_APOSTAS_PARA_CALCULO = 10;

    // Calcular RoR planejado (usando stake % configurado)
    const rorPlanejado = calcularRoRPlanejado(data.stakePercent);

    // Verificar se há dados suficientes para cálculo real
    const hasRealData = data.totalApostas >= MIN_APOSTAS_PARA_CALCULO;

    let rorReal: number;

    if (hasRealData && data.winRate > 0 && data.oddMedia > 0) {
        rorReal = calcularRoR(data.winRate, data.oddMedia, data.stakePercent);
    } else {
        // Sem dados suficientes, usar planejado
        rorReal = rorPlanejado;
    }

    // Verificar se há desvio significativo (real > planejado × 2)
    const isWarning = hasRealData && rorReal > rorPlanejado * 2;

    return {
        rorReal,
        rorPlanejado,
        hasRealData,
        isWarning,
    };
}

/**
 * Retorna a cor do indicador baseado no valor do RoR
 */
export function getRoRColor(ror: number): "green" | "yellow" | "red" {
    if (ror < 5) return "green";
    if (ror < 15) return "yellow";
    return "red";
}

/**
 * Formata o RoR para exibição
 */
export function formatRoR(ror: number): string {
    if (ror < 0.01) return "<0.01%";
    if (ror >= 100) return "100%";
    return `${ror.toFixed(2)}%`;
}
