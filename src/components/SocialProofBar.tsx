const houses = [
    "Bet365",
    "Betano",
    "Sportingbet",
    "Pinnacle",
    "Betfair",
    "Esportes da Sorte",
];

export function SocialProofBar() {
    return (
        <section className="py-12 bg-muted/50 border-y">
            <div className="container-main">
                <p className="text-center text-sm text-muted-foreground mb-6">
                    Compatível com as principais casas de apostas
                </p>
                <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10">
                    {houses.map((house) => (
                        <span
                            key={house}
                            className="text-sm sm:text-base font-semibold text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                        >
                            {house}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}
