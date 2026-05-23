import fs from "fs/promises";
import path from "path";

const logsDir = path.join(process.cwd(), "logs");

const readLogFile = async (fileName: string) => {
    const filePath = path.join(logsDir, fileName);

    const data = await fs.readFile(filePath, "utf-8");

    return data
        .split("\n")
        .filter(Boolean)
        .slice(-100)
        .reverse();
};

const getCombinedLogs = async () => {
    return readLogFile("combined.log");
};

const getErrorLogs = async () => {
    return readLogFile("error.log");
};

const getSuccessLogs = async () => {
    return readLogFile("success.log");
};

const getExceptionLogs = async () => {
    return readLogFile("exceptions.log");
};

const getRejectionLogs = async () => {
    return readLogFile("rejections.log");
};

export const LogService = {
    getCombinedLogs,
    getErrorLogs,
    getSuccessLogs,
    getExceptionLogs,
    getRejectionLogs,
};