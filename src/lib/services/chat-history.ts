/**
 * Serviço de histórico de chat no Supabase
 */
import { SupabaseClient } from "@supabase/supabase-js";

export interface Chat {
    id: string;
    user_id: string;
    title: string;
    created_at: string;
    updated_at: string;
}

export interface Message {
    id: string;
    chat_id: string;
    role: "user" | "assistant" | "system";
    content: string;
    metadata?: Record<string, unknown>;
    created_at: string;
}

/**
 * Cria um novo chat
 */
export async function createChat(
    supabase: SupabaseClient,
    userId: string,
    title = "Nova conversa"
): Promise<Chat | null> {
    const { data, error } = await supabase
        .from("chats")
        .insert({ user_id: userId, title })
        .select()
        .single();

    if (error) {
        console.error("[ChatHistory] Erro ao criar chat:", error);
        return null;
    }

    return data as Chat;
}

/**
 * Lista todos os chats de um usuário
 */
export async function listChats(
    supabase: SupabaseClient,
    userId: string
): Promise<Chat[]> {
    const { data, error } = await supabase
        .from("chats")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

    if (error) {
        console.error("[ChatHistory] Erro ao listar chats:", error);
        return [];
    }

    return data as Chat[];
}

/**
 * Busca mensagens de um chat
 */
export async function getMessages(
    supabase: SupabaseClient,
    chatId: string
): Promise<Message[]> {
    const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("[ChatHistory] Erro ao buscar mensagens:", error);
        return [];
    }

    return data as Message[];
}

/**
 * Salva uma mensagem no histórico
 */
export async function saveMessage(
    supabase: SupabaseClient,
    chatId: string,
    role: "user" | "assistant" | "system",
    content: string,
    metadata?: Record<string, unknown>
): Promise<Message | null> {
    const { data, error } = await supabase
        .from("messages")
        .insert({ chat_id: chatId, role, content, metadata })
        .select()
        .single();

    if (error) {
        console.error("[ChatHistory] Erro ao salvar mensagem:", error);
        return null;
    }

    // Atualiza o updated_at do chat
    await supabase
        .from("chats")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", chatId);

    return data as Message;
}

/**
 * Atualiza o título do chat baseado na primeira mensagem
 */
export async function updateChatTitle(
    supabase: SupabaseClient,
    chatId: string,
    title: string
): Promise<void> {
    const truncatedTitle = title.length > 50
        ? title.substring(0, 47) + "..."
        : title;

    await supabase
        .from("chats")
        .update({ title: truncatedTitle })
        .eq("id", chatId);
}

/**
 * Deleta um chat e suas mensagens (cascade)
 */
export async function deleteChat(
    supabase: SupabaseClient,
    chatId: string
): Promise<boolean> {
    const { error } = await supabase
        .from("chats")
        .delete()
        .eq("id", chatId);

    if (error) {
        console.error("[ChatHistory] Erro ao deletar chat:", error);
        return false;
    }

    return true;
}
