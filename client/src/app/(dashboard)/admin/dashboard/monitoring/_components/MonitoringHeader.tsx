"use client";

import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

const MonitoringHeader = () => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleRefresh = () => {
        startTransition(() => {
            router.refresh();
        });
    };

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">System Monitoring</h1>
                <p className="text-muted-foreground mt-1">
                    Monitor API logs, errors, server health and user activity
                </p>
            </div>
            <div className="flex items-center gap-3">
                <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export Logs
                </Button>
                <Button 
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700" 
                    onClick={handleRefresh}
                    disabled={isPending}
                >
                    <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>
        </div>
    );
};

export default MonitoringHeader;
