import { Router } from 'express';
const router = Router();
import pug from 'pug';
import User, { IUser } from '../models/User.js'
import bcrypt from 'bcrypt';
const saltRounds = 10;
import passport from 'passport';
import {
  checkNotAuthReturnIndex,
  checkNotAuthReturnMarkup,
  checkAuthReturnMarkup
} from '../middleware/checkAuth.js';

router.get('/register', checkNotAuthReturnMarkup, function (req, res, next) {
  let template = pug.compileFile('views/register.pug');
  let markup = template({ error_message: '' });
  res.send(markup);
});

router.post('/register', checkNotAuthReturnMarkup, function (req, res, next) {
  User.findOne({ email: req.body.email }).then((email) => {
    if (email) {
      let template = pug.compileFile('views/register.pug');
      let markup = template({ error_message: 'Email already in use' });
      return res.send(markup);
    } else {
      bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(req.body.password, salt, function (err, hash) {
          new User({
            id: Math.floor(Math.random() * 1000),
            user_name: req.body.username,
            email: req.body.email,
            password: hash,
            is_admin: false
          }).save().then(() => {
            let template = pug.compileFile('views/login.pug');
            let markup = template();
            return res.send(markup);
          }).catch((err) => {
            let template = pug.compileFile('views/register.pug');
            let markup = template({ error_message: 'Username already in use' });
            return res.send(markup);
          });
        });
      });
    }
  }).catch((err) => { return next(err); });
});

router.get('/login', checkNotAuthReturnMarkup, function (req: any, res, next) {
  let template = pug.compileFile('views/login.pug');
  let markup = '';
  if (!req.session || !req.session.messages || !req.session.messages || req.session.messages.length <= 0) {
    markup = template();
  } else {
    const lastErrorIndex = req.session.messages.length - 1;
    const lastErrorMessage = req.session.messages[lastErrorIndex];
    markup = template({ error_message: lastErrorMessage });
  }
  return res.send(markup);
});

router.post('/login', checkNotAuthReturnIndex, passport.authenticate('local', {
  successRedirect: '/swipe',
  failureRedirect: '/auth/login', failureMessage: true
}))

router.post('/logout', checkAuthReturnMarkup, function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    let template = pug.compileFile('views/login.pug');
    let markup = template({ error_message: '' });
    return res.send(markup);
  });
});

export default router;