"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { LucideIcon, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
    title: string;
    value: string;
    description: string;
    icon: LucideIcon;
    secondaryValue?: string;
    color?: "default" | "green" | "yellow" | "red";
    showWarning?: boolean;
}

export function KPICard({
    title,
    value,
    description,
    icon: Icon,
    secondaryValue,
    color = "default",
    showWarning = false,
}: KPICardProps) {
    const colorClasses = {
        default: "text-foreground",
        green: "text-green-600 dark:text-green-400",
        yellow: "text-yellow-600 dark:text-yellow-400",
        red: "text-red-600 dark:text-red-400",
    };

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
                                <div className="flex items-center gap-1">
                                    {showWarning && (
                                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                    )}
                                    <Icon className="w-4 h-4 text-muted-foreground" />
                                </div>
                            </div>
                            <p className={cn("text-lg sm:text-xl lg:text-2xl font-bold truncate", colorClasses[color])}>
                                {value}
                            </p>
                            {secondaryValue && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {secondaryValue}
                                </p>
                            )}
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

