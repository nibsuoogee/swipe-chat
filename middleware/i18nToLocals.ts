import { Request, Response, NextFunction } from 'express';
import i18next from '../i18n.js';

/*
* i18nToLocals is used as a middleware function to add the 
* i18next translation function from i18n.js to res.locals
* which can be accessed at any point later in the request chain.
*
* This is useful for using the translation function in .pug files 
* when using the res.render() function. Unfortunately, it does
* not work with pug.compileFile().
*/
export default function i18nToLocals(req: Request, res: Response,
  next: NextFunction) {
  res.locals.t = i18next.t;
  next();
}