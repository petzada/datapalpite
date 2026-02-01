"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
    title: string;
    value: string;
    description: string;
    icon: LucideIcon;
}

export function KPICard({ title, value, description, icon: Icon }: KPICardProps) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Card className="cursor-default hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-muted-foreground">
                                    {title}
                                </span>
                                <Icon className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <p className="text-2xl font-bold text-foreground">
                                {value}
                            </p>
                        </CardContent>
                    </Card>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[250px] text-center">
                    <p>{description}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
