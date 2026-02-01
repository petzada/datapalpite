"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, Wallet } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface SidebarProps {
    user: {
        name: string;
        email: string;
        avatarUrl?: string;
    };
}

const menuItems = [
    {
        section: "Principal",
        items: [
            { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { name: "Bancas", href: "/dashboard/bancas", icon: Wallet },
        ],
    },
];

export function Sidebar({ user }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

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
        <aside className="hidden lg:flex flex-col w-64 bg-primary text-primary-foreground h-screen fixed left-0 top-0">
            {/* Logo */}
            <div className="p-6">
                <Link href="/dashboard" className="text-xl font-bold font-sans">
                    Data Palpite
                </Link>
            </div>

            <Separator className="bg-white/20" />

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-6">
                {menuItems.map((section) => (
                    <div key={section.section}>
                        <span className="text-xs font-medium text-white/60 uppercase tracking-wider px-3">
                            {section.section}
                        </span>
                        <ul className="mt-2 space-y-1">
                            {section.items.map((item) => {
                                const isActive = pathname === item.href;
                                const Icon = item.icon;
                                return (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                                                    ? "bg-white/20 text-white font-medium"
                                                    : "text-white/80 hover:bg-white/10 hover:text-white"
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            {item.name}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            <Separator className="bg-white/20" />

            {/* User Menu */}
            <div className="p-4">
                <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border-2 border-white/30">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback className="bg-white/20 text-white text-sm font-medium">
                            {getInitials(user.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            {user.name}
                        </p>
                        <p className="text-xs text-white/60 truncate">
                            {user.email}
                        </p>
                    </div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white/80 hover:text-white hover:bg-white/10"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="w-5 h-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                <p>Sair</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </aside>
    );
}
