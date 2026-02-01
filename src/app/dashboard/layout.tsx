import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar, MobileNav } from "@/components/dashboard";

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

    // Extract user info from Supabase Auth
    const userData = {
        name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário",
        email: user.email || "",
        avatarUrl: user.user_metadata?.avatar_url || undefined,
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
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
