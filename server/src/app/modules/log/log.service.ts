import fs from 'fs/promises';
import path from 'path';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { IPaginationOptions } from '../../interfaces/pagination';
import { logSearchableFields } from './log.constant';

export type TLogLevel = "ERROR" | "WARN" | "INFO" | "DEBUG";

export type ILogFilterRequest = {
    searchTerm?: string;
    level?: TLogLevel;
    method?: string;
    statusCode?: string;
};

const logsDir = path.join(process.cwd(), 'logs');

// Strip ANSI codes
const stripAnsi = (str: string) => str.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, '');

const parseLogData = (data: string) => {
    const lines = data.split('\n');
    const logs = [];
    let currentLog: any = null;
    let metaBuffer: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = stripAnsi(lines[i]);
        if (!line.trim()) continue;

        const logStartRegex = /^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]\s*(\w+):\s*(.*)$/;
        const match = line.match(logStartRegex);

        if (match) {
            if (currentLog) {
                if (metaBuffer.length > 0) {
                    try {
                        currentLog.meta = JSON.parse(metaBuffer.join('\n'));
                    } catch (e) {
                        currentLog.metaString = metaBuffer.join('\n');
                    }
                    metaBuffer = [];
                }
                logs.push(currentLog);
            }

            const timestamp = match[1];
            const level = match[2];
            const message = match[3];

            currentLog = {
                timestamp,
                level: level.toUpperCase(),
                message,
            };
        } else {
            if (currentLog) {
                metaBuffer.push(line);
            }
        }
    }
    
    if (currentLog) {
        if (metaBuffer.length > 0) {
            try {
                currentLog.meta = JSON.parse(metaBuffer.join('\n'));
            } catch (e) {
                currentLog.metaString = metaBuffer.join('\n');
            }
        }
        logs.push(currentLog);
    }

    return logs.map(log => {
        let method, route, statusCode, responseTime, ipAddress;
        
        const httpRegex = /^([A-Z]+)\s+(\S+)\s+(\d{3})/;
        const httpMatch = log.message.match(httpRegex);
        
        if (httpMatch) {
            method = httpMatch[1];
            route = httpMatch[2];
            statusCode = parseInt(httpMatch[3]);
            
            const timeMatch = log.message.match(/- ([\d.]+ms)/);
            if(timeMatch) responseTime = timeMatch[1];
            
            const ipMatch = log.message.match(/IP: ([\d\.:]+)/);
            if(ipMatch) ipAddress = ipMatch[1];
        } else {
            if (log.meta?.method) method = log.meta.method;
            if (log.meta?.path) route = log.meta.path;
            if (log.meta?.statusCode) statusCode = log.meta.statusCode;
            if (log.meta?.duration) responseTime = `${log.meta.duration}ms`;
            if (log.meta?.ip) ipAddress = log.meta.ip;
        }

        return {
            ...log,
            method,
            route,
            statusCode,
            responseTime,
            ipAddress,
        };
    }).reverse();
};

const readLogFile = async (fileName: string) => {
    try {
        const filePath = path.join(logsDir, fileName);
        const data = await fs.readFile(filePath, 'utf-8');

        return parseLogData(data);
    } catch {
        return [];
    }
};

const getLogs = async (
    filters: ILogFilterRequest,
    options: IPaginationOptions
) => {
    const { limit, page, skip } = paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = filters;

    let result = await readLogFile('combined.log');

    // Apply searchTerm
    if (searchTerm) {
        result = result.filter(log => {
            return logSearchableFields.some(field => {
                const value = log[field as keyof typeof log];
                return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
            });
        });
    }

    // Apply exact filters
    if (Object.keys(filterData).length > 0) {
        result = result.filter(log => {
            return Object.entries(filterData).every(([field, value]) => {
                if (value === undefined || value === null || value === '') return true;
                const logValue = log[field as keyof typeof log];
                return logValue !== undefined && logValue !== null && logValue.toString().toLowerCase() === value.toString().toLowerCase();
            });
        });
    }

    // Sort logs (Default by timestamp desc)
    const sortBy = options.sortBy || 'timestamp';
    const sortOrder = options.sortOrder || 'desc';

    result.sort((a, b) => {
        let valA = a[sortBy as keyof typeof a];
        let valB = b[sortBy as keyof typeof b];

        if (valA === undefined) valA = '';
        if (valB === undefined) valB = '';

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    const total = result.length;
    const paginatedData = result.slice(skip, skip + limit);

    return {
        meta: {
            page,
            limit,
            total,
        },
        data: paginatedData,
    };
};

const getStats = async () => {
    const logs = await readLogFile('combined.log');

    const totalLogs = logs.length;
    const errorLogs = logs.filter(log => log.level === 'ERROR').length;
    const infoLogs = logs.filter(log => log.level === 'INFO').length;
    const warnLogs = logs.filter(log => log.level === 'WARN').length;

    return {
        totalLogs,
        errorLogs,
        infoLogs,
        warnLogs,
    };
};

const getErrorLogs = async () => readLogFile('error.log');
const getSuccessLogs = async () => readLogFile('success.log');
const getExceptionLogs = async () => readLogFile('exceptions.log');
const getRejectionLogs = async () => readLogFile('rejections.log');

export const LogService = {
    getLogs,
    getStats,
    getErrorLogs,
    getSuccessLogs,
    getExceptionLogs,
    getRejectionLogs,
};