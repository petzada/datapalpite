import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { SocialProofBar } from "@/components/SocialProofBar";
import { Benefits } from "@/components/Benefits";
import { DashboardPreview } from "@/components/DashboardPreview";
import { Testimonials } from "@/components/Testimonials";
import { Pricing } from "@/components/Pricing";
import { FAQ } from "@/components/FAQ";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";

export default function Home() {
    return (
        <main className="min-h-screen">
            <Navbar />
            <Hero />
            <SocialProofBar />
            <Benefits />
            <DashboardPreview />
            <Testimonials />
            <Pricing />
            <FAQ />
            <FinalCTA />
            <Footer />
        </main>
    );
}
