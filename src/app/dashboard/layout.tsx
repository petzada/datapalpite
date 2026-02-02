import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar, MobileNav } from "@/components/dashboard";
import { SubscriptionGuard } from "@/components/subscription";
import { getProfile } from "@/lib/subscription";
import type { PlanoTier } from "@/lib/subscription";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Redirect to login if not authenticated
    if (!user) {
        redirect("/login");
    }

    // Buscar perfil do usuario (inclui info do plano)
    const profile = await getProfile();

    // Extract user info from Supabase Auth + Profile
    const userData = {
        name: profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario",
        email: profile?.email || user.email || "",
        avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url || undefined,
        plan: (profile?.plano || "trial") as PlanoTier,
        daysRemaining: profile?.valid_until
            ? Math.max(0, Math.ceil((new Date(profile.valid_until).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
            : 7,
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Desktop Sidebar */}
            <Sidebar user={userData} />

            {/* Mobile Navigation */}
            <MobileNav user={userData} />

            {/* Main Content Area */}
            <main className="lg:ml-64 min-h-screen">
                {/* Add top padding for mobile header */}
                <div className="pt-14 lg:pt-0 pb-16 lg:pb-0">
                    <div className="p-6 lg:p-8">
                        <SubscriptionGuard>
                            {children}
                        </SubscriptionGuard>
                    </div>
                </div>
            </main>
        </div>
    );
}
