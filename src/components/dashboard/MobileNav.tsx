"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Menu, X, Settings, LogOut, User, Wallet } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";

interface MobileNavProps {
    user: {
        name: string;
        email: string;
        avatarUrl?: string;
    };
}

const bottomNavItems = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Bancas", href: "/dashboard/bancas", icon: Wallet },
];

export function MobileNav({ user }: MobileNavProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/");
    };

    // Get user initials for avatar fallback
    const getInitials = (name: string) => {
        const parts = name.split(" ");
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <>
            {/* Top Header with Hamburger Menu */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground h-14 flex items-center justify-between px-4">
                <Link href="/dashboard" className="text-lg font-bold font-sans">
                    Data Palpite
                </Link>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </Button>
            </header>

            {/* Hamburger Menu Overlay */}
            {menuOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMenuOpen(false)}>
                    <div
                        className="absolute top-14 right-0 w-64 bg-card shadow-xl rounded-bl-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* User Info */}
                        <div className="p-4 border-b">
                            <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {user.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <nav className="p-2">
                            <Link
                                href="/dashboard/configuracoes"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground hover:bg-muted transition-colors"
                                onClick={() => setMenuOpen(false)}
                            >
                                <Settings className="w-5 h-5" />
                                Configurações
                            </Link>
                            <Link
                                href="/dashboard/perfil"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground hover:bg-muted transition-colors"
                                onClick={() => setMenuOpen(false)}
                            >
                                <User className="w-5 h-5" />
                                Perfil
                            </Link>
                            <Separator className="my-2" />
                            <button
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
                                onClick={handleLogout}
                            >
                                <LogOut className="w-5 h-5" />
                                Sair
                            </button>
                        </nav>
                    </div>
                </div>
            )}

            {/* Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t h-16 flex items-center justify-around">
                {bottomNavItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${isActive
                                ? "text-primary"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="text-xs font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
