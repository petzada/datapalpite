"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema de validação
const bancaFormSchema = z.object({
    nome: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
    saldo_inicial: z.number().min(0, "Saldo inicial não pode ser negativo").max(100000000, "Saldo muito alto"),
    stake_percentual: z.number().min(0.1, "Stake mínimo é 0.1%").max(100, "Stake máximo é 100%").optional(),
    notas: z.string().max(1000, "Notas muito longas").optional(),
});

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
    // Validar input com Zod
    const validationResult = bancaFormSchema.safeParse(formData);
    if (!validationResult.success) {
        const errorMessage = validationResult.error.errors[0]?.message || "Dados inválidos";
        return { success: false, error: errorMessage };
    }
    const validatedData = validationResult.data;

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Usuário não autenticado" };
    }

    const { error } = await supabase
        .from("bancas")
        .insert({
            user_id: user.id,
            nome: validatedData.nome,
            saldo_inicial: validatedData.saldo_inicial,
            stake_percentual: validatedData.stake_percentual ?? 2.0,
            notas: validatedData.notas || null,
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
    // Validar UUID
    const uuidSchema = z.string().uuid("ID da banca inválido");
    const idValidation = uuidSchema.safeParse(id);
    if (!idValidation.success) {
        return { success: false, error: "ID da banca inválido" };
    }

    // Validar form data
    const validationResult = bancaFormSchema.safeParse(formData);
    if (!validationResult.success) {
        const errorMessage = validationResult.error.errors[0]?.message || "Dados inválidos";
        return { success: false, error: errorMessage };
    }
    const validatedData = validationResult.data;

    const supabase = await createClient();

    const { error } = await supabase
        .from("bancas")
        .update({
            nome: validatedData.nome,
            saldo_inicial: validatedData.saldo_inicial,
            stake_percentual: validatedData.stake_percentual ?? 2.0,
            notas: validatedData.notas || null,
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
    // Validar UUID
    const uuidSchema = z.string().uuid("ID da banca inválido");
    const validationResult = uuidSchema.safeParse(id);
    if (!validationResult.success) {
        return { success: false, error: "ID da banca inválido" };
    }

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
