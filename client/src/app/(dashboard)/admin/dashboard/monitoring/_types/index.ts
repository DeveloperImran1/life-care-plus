export type TLogLevel = "ERROR" | "WARN" | "INFO" | "DEBUG";

export interface ILog {
    timestamp: string;
    level: TLogLevel;
    message: string;
    meta?: Record<string, any>;
    method?: string;
    route?: string;
    statusCode?: number;
    responseTime?: string;
    ipAddress?: string;
}

export interface ILogStats {
    totalLogs: number;
    errorLogs: number;
    infoLogs: number;
    warnLogs: number;
}
