"use client";

import { Input } from "@/components/ui/input";
import { Search, RefreshCw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const MonitoringFilters = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [searchTerm, setSearchTerm] = useState(searchParams.get("searchTerm") || "");
    const [level, setLevel] = useState(searchParams.get("level") || "all");
    const [method, setMethod] = useState(searchParams.get("method") || "all");
    const [statusCode, setStatusCode] = useState(searchParams.get("statusCode") || "");

    useEffect(() => {
        const handler = setTimeout(() => {
            handleFilterChange({ searchTerm, level, method, statusCode });
        }, 300); // Debounce search

        return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, level, method, statusCode]);

    const handleFilterChange = (filters: { [key: string]: string }) => {
        const params = new URLSearchParams(searchParams.toString());
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== "all") {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });

        params.set("page", "1"); // Reset to page 1 on filter

        startTransition(() => {
            router.push(`?${params.toString()}`, { scroll: false });
        });
    };

    const handleRefresh = () => {
        startTransition(() => {
            router.refresh();
        });
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border border-border/50 shadow-sm">
            <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-background"
                />
                <p className="text-[10px] text-muted-foreground absolute -bottom-5 left-1">
                    Example: GET /logs/search?q=database
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger className="w-[140px] bg-background">
                        <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="INFO">INFO</SelectItem>
                        <SelectItem value="WARN">WARN</SelectItem>
                        <SelectItem value="ERROR">ERROR</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger className="w-[140px] bg-background">
                        <SelectValue placeholder="All Methods" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Methods</SelectItem>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                </Select>

                <Input
                    placeholder="Status Code"
                    value={statusCode}
                    onChange={(e) => setStatusCode(e.target.value)}
                    className="w-[120px] bg-background"
                />

                <Select defaultValue="today">
                    <SelectTrigger className="w-[200px] bg-background">
                        <SelectValue placeholder="Date Range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="yesterday">Yesterday</SelectItem>
                        <SelectItem value="7days">Last 7 Days</SelectItem>
                        <SelectItem value="30days">Last 30 Days</SelectItem>
                    </SelectContent>
                </Select>

                <Button 
                    variant="default" 
                    className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"
                    onClick={handleRefresh}
                    disabled={isPending}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isPending ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>
        </div>
    );
};

export default MonitoringFilters;
