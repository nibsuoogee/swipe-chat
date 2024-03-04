import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User.js'
import pug from 'pug';
import { Types } from 'mongoose';
import i18next from '../i18n.js';

/*
* checkAuthReturnIndex is intended for routes that target 
* the entire page, and thus the whole index page is returned
* on authentication failure.
*/
export function checkAuthReturnIndex(req: Request,
  res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next()
  }
  return res.render('index');
}

/*
* checkAuthReturnMarkup is intended for routes that target 
* the main content, so the login view component can be 
* returned on authentication failure.
*/
export function checkAuthReturnMarkup(req: Request,
  res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next()
  }
  let template = pug.compileFile('views/login.pug');
  let markup = template({ t: res.locals.t });
  return res.send(markup);
}

/*
* checkAuthReturnNothing is intended for routes that target
* non-main content, so nothing is returned on
* authentication failure.
*/
export function checkAuthReturnNothing(req: Request,
  res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next()
  }
  let markup = '';
  return res.send(markup);
}

/*
* checkNotAuthReturnIndex functions similarly to
* checkAuthReturnIndex, but returns the page
* on authentication success.
*/
export function checkNotAuthReturnIndex(req: Request,
  res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return res.render('index');
  }
  return next()
}

/*
* checkNotAuthReturnMarkup functions similarly to
* checkAuthReturnMarkup, but returns main content
* on authentication success 
*/
export function checkNotAuthReturnMarkup(req: Request,
  res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    let template = pug.compileFile('views/swipe.pug');
    let markup = template({ t: i18next.t });
    return res.send(markup);
  }
  return next()
}

export async function getUserByEmail(email: string) {
  try {
    const user: IUser | null = await User.findOne({ email: email });
    return user;
  } catch (err) {
    return null;
  }
}

export async function getUserById(id: Types.ObjectId) {
  try {
    const user: IUser | null = await User.findOne({ _id: id });
    return user;
  } catch (err) {
    return null;
  }
}
