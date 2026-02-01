import { createClient } from "@/lib/supabase/server";
import { DashboardHeader, KPISection, ChartsSection } from "@/components/dashboard";
import { getDashboardStats, getDashboardCharts } from "@/lib/actions/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const supabase = await createClient();

    const [{ data: { user } }, stats, chartsData] = await Promise.all([
        supabase.auth.getUser(),
        getDashboardStats(),
        getDashboardCharts(),
    ]);

    // Get the user's first name for the header
    const firstName = user?.user_metadata?.full_name?.split(" ")[0] ||
        user?.email?.split("@")[0] ||
        undefined;

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header with Welcome Message and Filters */}
            <DashboardHeader userName={firstName} />

            {/* KPIs Section - 5 cards side by side */}
            <KPISection stats={stats} />

            {/* Charts Section - 2 columns */}
            <ChartsSection
                evolutionData={chartsData.evolutionData}
                roiData={chartsData.roiData}
            />
        </div>
    );
}

