import fs from 'fs/promises';
import path from 'path';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { IPaginationOptions } from '../../interfaces/pagination';
import { ILogFilterRequest, TLogItem } from './log.interface';
import { logSearchableFields } from './log.constant';

const logsDir = path.join(process.cwd(), 'logs');

const readLogFile = async (fileName: string) => {
    try {
        const filePath = path.join(logsDir, fileName);
        const data = await fs.readFile(filePath, 'utf-8');

        return data.split('\n').filter(Boolean).reverse();
    } catch {
        return [];
    }
};

const parseLogLine = (line: string): TLogItem => {
    const level = line.toLowerCase().includes('error')
        ? 'ERROR'
        : line.toLowerCase().includes('warn')
            ? 'WARN'
            : line.toLowerCase().includes('debug')
                ? 'DEBUG'
                : 'INFO';

    const methodMatch = line.match(/\b(GET|POST|PUT|PATCH|DELETE)\b/);
    const statusMatch = line.match(/\b(200|201|400|401|403|404|409|429|500)\b/);
    const timeMatch = line.match(/(\d+ms)/);
    const routeMatch = line.match(/(\/api\/[^\s]+|\/logs\/[^\s]+)/);
    const ipMatch = line.match(
        /\b(?:\d{1,3}\.){3}\d{1,3}\b/
    );

    return {
        time: line.match(/\[(.*?)\]/)?.[1] || new Date().toISOString(),
        level,
        method: methodMatch?.[1] || '-',
        route: routeMatch?.[1] || '-',
        statusCode: statusMatch?.[1] || '-',
        responseTime: timeMatch?.[1] || '-',
        message: line,
        ipAddress: ipMatch?.[0] || '127.0.0.1',
    };
};

const getLogs = async (
    filters: ILogFilterRequest,
    options: IPaginationOptions
) => {
    const { limit, page, skip } = paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = filters;

    const lines = await readLogFile('combined.log');

    let logs = lines.map(parseLogLine);

    if (searchTerm) {
        logs = logs.filter((log) =>
            logSearchableFields.some((field) =>
                String(log[field as keyof TLogItem])
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
            )
        );
    }

    if (Object.keys(filterData).length > 0) {
        Object.entries(filterData).forEach(([key, value]) => {
            if (value && value !== 'ALL') {
                logs = logs.filter(
                    (log) =>
                        String(log[key as keyof TLogItem]).toLowerCase() ===
                        String(value).toLowerCase()
                );
            }
        });
    }

    if (options.sortBy && options.sortOrder) {
        logs = logs.sort((a, b) => {
            const first = String(a[options.sortBy as keyof TLogItem]);
            const second = String(b[options.sortBy as keyof TLogItem]);

            return options.sortOrder === 'asc'
                ? first.localeCompare(second)
                : second.localeCompare(first);
        });
    }

    const total = logs.length;

    return {
        meta: {
            total,
            page,
            limit,
        },
        data: logs.slice(skip, skip + limit),
    };
};

const getStats = async () => {
    const lines = await readLogFile('combined.log');
    const logs = lines.map(parseLogLine);

    const totalRequests = logs.length;
    const errorCount = logs.filter((log) => log.level === 'ERROR').length;

    const responseTimes = logs
        .map((log) => Number(log.responseTime.replace('ms', '')))
        .filter(Boolean);

    const avgResponseTime = responseTimes.length
        ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
        : 0;

    return {
        totalRequests,
        errorRate: totalRequests
            ? Number(((errorCount / totalRequests) * 100).toFixed(2))
            : 0,
        avgResponseTime: `${avgResponseTime}ms`,
        serverUptime: process.uptime(),
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