export type TLogLevel = "ERROR" | "WARN" | "INFO" | "DEBUG";

export type ILogFilterRequest = {
    searchTerm?: string;
    level?: string;
    method?: string;
    statusCode?: string;
};

export type TLogItem = {
    time: string;
    level: string;
    method: string;
    route: string;
    statusCode: string;
    responseTime: string;
    message: string;
    ipAddress: string;
};