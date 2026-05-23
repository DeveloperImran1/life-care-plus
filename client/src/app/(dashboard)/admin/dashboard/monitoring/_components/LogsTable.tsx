"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ILog } from "../_types";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LogsTableProps {
    logs: ILog[];
}

const getLevelBadge = (level: string) => {
    switch (level) {
        case "ERROR":
            return <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100">ERROR</Badge>;
        case "WARN":
            return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100">WARN</Badge>;
        case "INFO":
            return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100">INFO</Badge>;
        default:
            return <Badge variant="outline">{level}</Badge>;
    }
};

const getMethodBadge = (method: string) => {
    if (!method) return null;
    switch (method) {
        case "GET":
            return <span className="text-emerald-600 font-semibold text-xs">GET</span>;
        case "POST":
            return <span className="text-blue-600 font-semibold text-xs">POST</span>;
        case "PATCH":
        case "PUT":
            return <span className="text-amber-600 font-semibold text-xs">{method}</span>;
        case "DELETE":
            return <span className="text-rose-600 font-semibold text-xs">DELETE</span>;
        default:
            return <span className="text-slate-600 font-semibold text-xs">{method}</span>;
    }
};

const getStatusBadge = (status?: number) => {
    if (!status) return "-";
    if (status >= 500) {
        return <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100">{status}</Badge>;
    } else if (status >= 400) {
        return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100">{status}</Badge>;
    } else {
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100">{status}</Badge>;
    }
};

const LogsTable = ({ logs }: LogsTableProps) => {
    return (
        <div className="bg-card rounded-lg border border-border/50 shadow-sm overflow-hidden mt-6">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="font-semibold w-[200px]">Time ↑↓</TableHead>
                            <TableHead className="font-semibold">Level ↑↓</TableHead>
                            <TableHead className="font-semibold">Method ↑↓</TableHead>
                            <TableHead className="font-semibold">Route ↑↓</TableHead>
                            <TableHead className="font-semibold text-center">Status Code ↑↓</TableHead>
                            <TableHead className="font-semibold">Response Time ↑↓</TableHead>
                            <TableHead className="font-semibold max-w-[300px]">Message</TableHead>
                            <TableHead className="font-semibold">IP Address</TableHead>
                            <TableHead className="font-semibold text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs?.length > 0 ? (
                            logs.map((log, index) => (
                                <TableRow key={index} className="hover:bg-muted/30">
                                    <TableCell className="font-medium whitespace-nowrap">
                                        {log.timestamp}
                                    </TableCell>
                                    <TableCell>{getLevelBadge(log.level)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center w-fit px-2 py-1 rounded-full bg-slate-100">
                                            {getMethodBadge(log.method || "")}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground whitespace-nowrap">
                                        {log.route || "-"}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {getStatusBadge(log.statusCode)}
                                    </TableCell>
                                    <TableCell>
                                        <span className={
                                            (log.responseTime && parseInt(log.responseTime) > 300) 
                                                ? "text-rose-500 font-medium" 
                                                : "text-emerald-500 font-medium"
                                        }>
                                            {log.responseTime || "-"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="max-w-[300px] truncate" title={log.message}>
                                        {log.message}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground whitespace-nowrap">
                                        {log.ipAddress || "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(JSON.stringify(log, null, 2))}>
                                                    Copy details
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>View full trace</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                    No logs found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default LogsTable;
