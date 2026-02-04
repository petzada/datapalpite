import { createClient } from "@/lib/supabase/server";
import { DashboardHeader, KPISection, ChartsSection } from "@/components/dashboard";
import { getDashboardStats, getDashboardCharts, getBancasWithPL } from "@/lib/actions/dashboard";

export const dynamic = "force-dynamic";

interface DashboardPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
    const params = await searchParams;
    const periodo = typeof params.period === "string" ? params.period : "all";
    const bancaId = typeof params.banca === "string" ? params.banca : "all";
    const filters = { periodo, bancaId };

    const supabase = await createClient();

    const [{ data: { user } }, stats, chartsData, bancas] = await Promise.all([
        supabase.auth.getUser(),
        getDashboardStats(filters),
        getDashboardCharts(filters),
        getBancasWithPL(),
    ]);

    // Get the user's first name for the header
    const firstName = user?.user_metadata?.full_name?.split(" ")[0] ||
        user?.email?.split("@")[0] ||
        undefined;

    return (
        <div className="w-full">
            {/* Header with Welcome Message and Filters */}
            <DashboardHeader userName={firstName} bancas={bancas} />

            {/* KPIs Section - 5 cards side by side */}
            <KPISection stats={stats} bancas={bancas} />

            {/* Charts Section - 2 columns */}
            <ChartsSection
                evolutionData={chartsData.evolutionData}
                roiData={chartsData.roiData}
                bancaNomes={chartsData.bancaNomes}
            />
        </div>
    );
}

