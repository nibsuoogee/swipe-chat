import { Router } from 'express';
const router = Router();
import pug from 'pug';
import User, { IUser } from '../models/User.js'
import bcrypt from 'bcrypt';
const saltRounds = 10;
import { checkAuthReturnMarkup, getUserById } from '../middleware/checkAuth.js';
import { removeMatch } from './messaging.js';
import i18next from '../i18n.js';

router.get('/', checkAuthReturnMarkup, function (req, res, next) {
  let template = pug.compileFile('views/profile.pug');
  const user = req.user as IUser | null;
  if (!user || !user.user_name) {
    let markup = template({ t: res.locals.t, username: '' });
    return res.send(markup);
  }
  let markup = template({ t: res.locals.t, username: user.user_name });
  return res.send(markup);
});

router.post('/edit-username/', checkAuthReturnMarkup,
  async function (req, res, next) {
    let template = pug.compileFile('views/profile.pug');
    let markup = '';

    const user = req.user as IUser | null;
    try {
      if (!user || !user.user_name || !user._id) {
        throw new Error('User information error');
      }

      const existingUser = await User.findOne({ user_name: req.body.username });
      if (!user) { throw new Error('user not found'); }

      if (existingUser) {

        markup = template({
          t: res.locals.t,
          username: user.user_name,
          error_message: i18next.t('Username') + ' ' + i18next.t('in use')
        });

      } else {
        await User.updateOne({ _id: user._id },
          { $set: { 'user_name': req.body.username } });
        const updatedUser = await getUserById(user._id);

        if (updatedUser && updatedUser.user_name) {
          markup = template({
            t: res.locals.t,
            username: updatedUser.user_name
          });
        }
      }
      return res.send(markup);
    } catch (err) {
      return next(err);
    }
  });

router.post('/edit-password/', checkAuthReturnMarkup,
  async function (req, res, next) {
    let template = pug.compileFile('views/profile.pug');
    let markup = '';

    const user = req.user as IUser | null;
    try {
      if (!user || !user.user_name || !user._id) {
        throw new Error('User information error');
      }

      const passwordsMatch =
        req.body.password === req.body.passwordagain ? true : false;

      if (!passwordsMatch) {
        markup = template({
          t: res.locals.t,
          username: user.user_name,
          error_message: i18next.t('Passwords must match')
        });
        res.send(markup);
      } else {
        bcrypt.genSalt(saltRounds, function (err, salt) {
          bcrypt.hash(req.body.password, salt, async function (err, hash) {
            await User.updateOne({ _id: user._id },
              { $set: { 'password': hash } });
            markup = template({
              t: res.locals.t,
              username: user.user_name
            });
            res.send(markup);
          });
        });
      }
    } catch (err) {
      return next(err);
    }
  });

router.delete('/', checkAuthReturnMarkup, async function (req, res, next) {
  let template = pug.compileFile('views/profile.pug');
  const user = req.user as IUser | null;
  if (!user || !user.user_name || !user._id) {
    let markup = template({
      t: res.locals.t, username: '',
      error_message: i18next.t('An error occured')
    });
    return res.send(markup);
  }

  user.friends.forEach((friend) => {
    removeMatch(user._id, friend, next);
  });

  User.deleteOne({ _id: user._id }
  ).catch((err) => {
    next(err);
  });

  template = pug.compileFile('views/login.pug');
  let markup = template({ t: res.locals.t });
  return res.send(markup);
});

export default router;