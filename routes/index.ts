import { Router } from 'express';
const router = Router();
import pug from 'pug';
import User, { IUser } from '../models/User.js'
import {
  checkAuthReturnIndex,
  checkAuthReturnNothing,
} from '../middleware/checkAuth.js';

router.get('/', checkAuthReturnIndex, function (req, res) {
  const user = req.user as IUser | null;
  if (user && user.user_name) {
    return res.render('index', { username: user.user_name });
  } else {
    return res.render('index', { username: 'Guest' });
  }
});

router.get('/menu', checkAuthReturnNothing, function (req, res, next) {
  let template = pug.compileFile('views/menu.pug');
  let markup = template();
  return res.send(markup);
});

export default router;