import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { LogService } from "./log.service";

const getCombinedLogs = catchAsync(async (req, res) => {
    const result = await LogService.getCombinedLogs();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Combined logs retrieved successfully",
        data: result,
    });
});

const getErrorLogs = catchAsync(async (req, res) => {
    const result = await LogService.getErrorLogs();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Error logs retrieved successfully",
        data: result,
    });
});

const getSuccessLogs = catchAsync(async (req, res) => {
    const result = await LogService.getSuccessLogs();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Success logs retrieved successfully",
        data: result,
    });
});

const getExceptionLogs = catchAsync(async (req, res) => {
    const result = await LogService.getExceptionLogs();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Exception logs retrieved successfully",
        data: result,
    });
});

const getRejectionLogs = catchAsync(async (req, res) => {
    const result = await LogService.getRejectionLogs();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Rejection logs retrieved successfully",
        data: result,
    });
});

export const LogController = {
    getCombinedLogs,
    getErrorLogs,
    getSuccessLogs,
    getExceptionLogs,
    getRejectionLogs
};