"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface Banca {
    id: string;
    user_id: string;
    nome: string;
    saldo_inicial: number;
    stake_percentual: number;
    notas: string | null;
    created_at: string;
    updated_at: string;
}

export interface BancaFormData {
    nome: string;
    saldo_inicial: number;
    stake_percentual?: number;
    notas?: string;
}

// Listar todas as bancas do usuário
export async function getBancas(): Promise<Banca[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("bancas")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Erro ao buscar bancas:", error);
        return [];
    }

    return data || [];
}

// Criar nova banca
export async function createBanca(formData: BancaFormData): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Usuário não autenticado" };
    }

    const { error } = await supabase
        .from("bancas")
        .insert({
            user_id: user.id,
            nome: formData.nome,
            saldo_inicial: formData.saldo_inicial,
            stake_percentual: formData.stake_percentual ?? 2.0,
            notas: formData.notas || null,
        });

    if (error) {
        console.error("Erro ao criar banca:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/bancas");
    revalidatePath("/dashboard");
    return { success: true };
}

// Atualizar banca existente
export async function updateBanca(id: string, formData: BancaFormData): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { error } = await supabase
        .from("bancas")
        .update({
            nome: formData.nome,
            saldo_inicial: formData.saldo_inicial,
            stake_percentual: formData.stake_percentual ?? 2.0,
            notas: formData.notas || null,
        })
        .eq("id", id);

    if (error) {
        console.error("Erro ao atualizar banca:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/bancas");
    revalidatePath("/dashboard");
    return { success: true };
}

// Excluir banca
export async function deleteBanca(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { error } = await supabase
        .from("bancas")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Erro ao excluir banca:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/bancas");
    return { success: true };
}
