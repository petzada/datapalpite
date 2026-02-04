import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/subscription";
import { Metadata } from "next";
import { MinhaContaClient } from "./MinhaContaClient";

export const metadata: Metadata = {
    title: "Minha Conta | Data Palpite",
    description: "Gerencie sua conta e assinatura.",
};

export default async function MinhaContaPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const profile = await getProfile();

    const userData = {
        name: profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário",
        email: profile?.email || user.email || "",
        avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url || undefined,
        plan: profile?.plano || "trial",
        status: profile?.status || "active",
        validUntil: profile?.valid_until || null,
        createdAt: profile?.created_at || user.created_at || "",
    };

    return <MinhaContaClient user={userData} />;
}
