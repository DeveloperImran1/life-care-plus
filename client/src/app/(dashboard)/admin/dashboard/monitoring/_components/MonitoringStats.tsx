"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon, Clock, HardDrive, AlertTriangle, Layers } from "lucide-react";
import { ILogStats } from "../_types";

interface MonitoringStatsProps {
    stats: ILogStats | undefined;
}

const MonitoringStats = ({ stats }: MonitoringStatsProps) => {
    // Calculate Error Rate
    const total = stats?.totalLogs || 0;
    const errors = stats?.errorLogs || 0;
    const errorRate = total > 0 ? ((errors / total) * 100).toFixed(1) : "0.0";

    const statCards = [
        {
            title: "Total Requests",
            value: total.toLocaleString(),
            trend: "+12.5%",
            trendUp: true,
            icon: Layers,
            iconColor: "text-emerald-500",
            iconBg: "bg-emerald-50",
        },
        {
            title: "Error Rate",
            value: `${errorRate}%`,
            trend: "+0.6%",
            trendUp: false,
            icon: AlertTriangle,
            iconColor: "text-rose-500",
            iconBg: "bg-rose-50",
        },
        {
            title: "Avg Response Time",
            value: "180ms",
            trend: "-15ms",
            trendUp: true,
            icon: Clock,
            iconColor: "text-amber-500",
            iconBg: "bg-amber-50",
        },
        {
            title: "Server Uptime",
            value: "99.9%",
            trend: "+0.1%",
            trendUp: true,
            icon: HardDrive,
            iconColor: "text-emerald-500",
            iconBg: "bg-emerald-50",
        }
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat, idx) => (
                <Card key={idx} className="border-border/50 shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className={`p-4 rounded-xl ${stat.iconBg}`}>
                            <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                            <h3 className="text-2xl font-bold tracking-tight">{stat.value}</h3>
                            <p className="text-xs text-muted-foreground flex items-center mt-1">
                                {stat.trendUp ? (
                                    <ArrowUpIcon className="h-3 w-3 mr-1 text-emerald-500" />
                                ) : (
                                    <ArrowUpIcon className="h-3 w-3 mr-1 text-rose-500" />
                                )}
                                <span className={stat.trendUp ? "text-emerald-500 font-medium" : "text-rose-500 font-medium"}>
                                    {stat.trend}
                                </span>
                                <span className="ml-1">from yesterday</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default MonitoringStats;
