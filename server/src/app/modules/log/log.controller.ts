import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { logFilterableFields } from './log.constant';
import { LogService } from './log.service';

const getLogs = catchAsync(async (req, res) => {
    const filters = pick(req.query, logFilterableFields);

    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

    const result = await LogService.getLogs(filters, options);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Logs retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});

const getStats = catchAsync(async (req, res) => {
    const result = await LogService.getStats();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Log stats retrieved successfully',
        data: result,
    });
});

const getErrorLogs = catchAsync(async (req, res) => {
    const result = await LogService.getErrorLogs();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Error logs retrieved successfully',
        data: result,
    });
});

const getSuccessLogs = catchAsync(async (req, res) => {
    const result = await LogService.getSuccessLogs();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Success logs retrieved successfully',
        data: result,
    });
});

const getExceptionLogs = catchAsync(async (req, res) => {
    const result = await LogService.getExceptionLogs();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Exception logs retrieved successfully',
        data: result,
    });
});

const getRejectionLogs = catchAsync(async (req, res) => {
    const result = await LogService.getRejectionLogs();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Rejection logs retrieved successfully',
        data: result,
    });
});

export const LogController = {
    getLogs,
    getStats,
    getErrorLogs,
    getSuccessLogs,
    getExceptionLogs,
    getRejectionLogs,
};