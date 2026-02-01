"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface Aposta {
    id: string;
    user_id: string;
    banca_id: string;
    tipo: "simples" | "multipla";
    data_aposta: string;
    stake: number;
    odds_total: number;
    status: "pendente" | "ganha" | "perdida" | "anulada";
    lucro_prejuizo: number | null;
    created_at: string;
    resolved_at: string | null;
    banca?: {
        nome: string;
    };
    eventos?: ApostaEvento[];
}

export interface ApostaEvento {
    id?: string;
    aposta_id?: string;
    esporte: string;
    evento: string;
    mercado: string;
    odd: number;
}

export interface ApostaFormData {
    banca_id: string;
    tipo: "simples" | "multipla";
    data_aposta: string;
    stake: number;
    eventos: ApostaEvento[];
    odds_total?: number; // Optional: provided for multiple bets
}

// Listar apostas do usuário
export async function getApostas(status?: "pendente" | "finalizada"): Promise<Aposta[]> {
    const supabase = await createClient();

    let query = supabase
        .from("apostas")
        .select(`
            *,
            banca:bancas(nome),
            eventos:aposta_eventos(*)
        `)
        .order("data_aposta", { ascending: false });

    if (status === "pendente") {
        query = query.eq("status", "pendente");
    } else if (status === "finalizada") {
        query = query.neq("status", "pendente");
    }

    const { data, error } = await query;

    if (error) {
        console.error("Erro ao buscar apostas:", error);
        return [];
    }

    return data || [];
}

// Criar nova aposta
export async function createAposta(formData: ApostaFormData): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Usuário não autenticado" };
    }

    // Use provided odds_total or calculate from eventos (for simple bets)
    const oddsTotal = formData.odds_total ?? formData.eventos.reduce((acc, ev) => acc * ev.odd, 1);

    // Inserir aposta
    const { data: aposta, error: apostaError } = await supabase
        .from("apostas")
        .insert({
            user_id: user.id,
            banca_id: formData.banca_id,
            tipo: formData.tipo,
            data_aposta: formData.data_aposta,
            stake: formData.stake,
            odds_total: oddsTotal,
        })
        .select()
        .single();

    if (apostaError || !aposta) {
        console.error("Erro ao criar aposta:", apostaError);
        return { success: false, error: apostaError?.message || "Erro ao criar aposta" };
    }

    // Inserir eventos
    const eventosParaInserir = formData.eventos.map((ev) => ({
        aposta_id: aposta.id,
        esporte: ev.esporte,
        evento: ev.evento,
        mercado: ev.mercado,
        odd: ev.odd,
    }));

    const { error: eventosError } = await supabase
        .from("aposta_eventos")
        .insert(eventosParaInserir);

    if (eventosError) {
        console.error("Erro ao criar eventos:", eventosError);
        // Rollback: excluir aposta criada
        await supabase.from("apostas").delete().eq("id", aposta.id);
        return { success: false, error: "Erro ao salvar eventos da aposta" };
    }

    revalidatePath("/dashboard/apostas");
    revalidatePath("/dashboard");
    return { success: true };
}

// Resolver aposta (ganha/perdida/anulada)
export async function resolverAposta(
    id: string,
    resultado: "ganha" | "perdida" | "anulada"
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    // Buscar aposta para calcular P&L
    const { data: aposta, error: fetchError } = await supabase
        .from("apostas")
        .select("stake, odds_total")
        .eq("id", id)
        .single();

    if (fetchError || !aposta) {
        return { success: false, error: "Aposta não encontrada" };
    }

    // Calcular lucro/prejuízo
    let lucro_prejuizo: number;
    if (resultado === "ganha") {
        lucro_prejuizo = (aposta.stake * aposta.odds_total) - aposta.stake;
    } else if (resultado === "perdida") {
        lucro_prejuizo = -aposta.stake;
    } else {
        lucro_prejuizo = 0; // anulada
    }

    // Atualizar aposta
    const { error } = await supabase
        .from("apostas")
        .update({
            status: resultado,
            lucro_prejuizo,
            resolved_at: new Date().toISOString(),
        })
        .eq("id", id);

    if (error) {
        console.error("Erro ao resolver aposta:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/apostas");
    revalidatePath("/dashboard");
    return { success: true };
}

// Excluir aposta
export async function deleteAposta(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { error } = await supabase
        .from("apostas")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Erro ao excluir aposta:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/apostas");
    revalidatePath("/dashboard");
    return { success: true };
}
