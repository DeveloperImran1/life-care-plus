import { Response } from 'express';

export const cookieSet = (res: Response, key: string, token: string, maxAge: number) => {
  res.cookie(key, token, {
    secure: true,
    httpOnly: true,
    sameSite: 'none',
    maxAge,
  });
};
