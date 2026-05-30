/* eslint-disable @typescript-eslint/no-namespace */
import type { JwtPayload } from 'jsonwebtoken';
import { TJwtPayload } from './jwt.payload';

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload & TJwtPayload;
    }
    interface ProcessEnv {
      JWT_ACCESS_SECRET: string;
      JWT_REFRESH_SECRET: string;
      JWT_ACCESS_EXPIRES_IN: string;
      JWT_REFRESH_EXPIRES_IN: string;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */
