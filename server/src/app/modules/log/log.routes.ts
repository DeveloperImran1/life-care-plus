import express from 'express';
import { UserRole } from '@prisma/client';
import auth from '../../middlewares/auth';
import { LogController } from './log.controller';

const router = express.Router();

router.get(
    '/',
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    LogController.getLogs
);

router.get(
    '/stats',
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    LogController.getStats
);

router.get(
    '/errors',
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    LogController.getErrorLogs
);

router.get(
    '/success',
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    LogController.getSuccessLogs
);

router.get(
    '/exceptions',
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    LogController.getExceptionLogs
);

router.get(
    '/rejections',
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    LogController.getRejectionLogs
);

export const LogRoutes = router;