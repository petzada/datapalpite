import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/subscription";
import { PlanosClient } from "./PlanosClient";

export default async function PlanosPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Redirect to login if not authenticated
    if (!user) {
        redirect("/login");
    }

    // Buscar perfil do usuario
    const profile = await getProfile();

    return (
        <PlanosClient
            currentPlan={profile?.plano || "trial"}
            validUntil={profile?.valid_until || new Date().toISOString()}
            userEmail={user.email || ""}
        />
    );
}
