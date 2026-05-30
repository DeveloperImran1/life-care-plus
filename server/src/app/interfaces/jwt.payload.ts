import { UserRole } from '@prisma/client';

export type TJwtPayload = {
  userId: string;
  email: string;
  role: UserRole;
};
