import { Router, Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import User, { IUser } from '../models/User.js'
import pug from 'pug';

export function checkAuthReturnIndex(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next()
  }
  return res.render('index');
}

export function checkAuthReturnMarkup(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next()
  }
  let template = pug.compileFile('views/login.pug');
  let markup = template();
  return res.send(markup);
}

export function checkAuthReturnNothing(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next()
  }
  let markup = '';
  return res.send(markup);
}

export function checkNotAuthReturnIndex(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return res.render('index');
  }
  return next()
}

export function checkNotAuthReturnMarkup(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    let template = pug.compileFile('views/swipe.pug');
    let markup = template();
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

export async function getUserById(id: string) {
  try {
    const user: IUser | null = await User.findOne({ id: id });
    return user;
  } catch (err) {
    return null;
  }
}
