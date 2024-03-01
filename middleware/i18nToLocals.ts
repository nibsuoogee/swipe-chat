import { Request, Response, NextFunction } from 'express';
import i18next from '../i18n.js';

export default function i18nToLocals(req: Request, res: Response,
  next: NextFunction) {
  res.locals.t = i18next.t;
  next();
}