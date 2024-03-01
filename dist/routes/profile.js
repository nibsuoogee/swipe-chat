import { Router } from 'express';
const router = Router();
import pug from 'pug';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
const saltRounds = 10;
import { checkAuthReturnMarkup } from '../middleware/checkAuth.js';
import { removeMatch } from './messaging.js';
import i18next from '../i18n.js';
router.get('/', checkAuthReturnMarkup, function (req, res, next) {
    let template = pug.compileFile('views/profile.pug');
    const user = req.user;
    if (!user || !user.user_name) {
        let markup = template({ t: res.locals.t, username: '' });
        return res.send(markup);
    }
    let markup = template({ t: res.locals.t, username: user.user_name });
    return res.send(markup);
});
router.post('/edit-username/', checkAuthReturnMarkup, async function (req, res, next) {
    let template = pug.compileFile('views/profile.pug');
    const user = req.user;
    if (!user || !user.user_name || !user._id) {
        let markup = template({
            t: res.locals.t,
            username: '',
            error_message: i18next.t('An error occured')
        });
        return res.send(markup);
    }
    User.findOne({ user_name: req.body.username }).then((user) => {
        if (user) {
            let markup = template({
                t: res.locals.t,
                username: user.user_name,
                error_message: i18next.t('Username') + ' ' + i18next.t('in use')
            });
            return res.send(markup);
        }
    }).catch((err) => {
        return next(err);
    });
    User.updateOne({ id: user._id }, { $set: { 'user_name': req.body.username } }).catch((err) => {
        return next(err);
    });
    let markup = template({ t: res.locals.t, username: user.user_name });
    return res.send(markup);
});
router.post('/edit-password/', checkAuthReturnMarkup, async function (req, res, next) {
    let template = pug.compileFile('views/profile.pug');
    const user = req.user;
    if (!user || !user.user_name || !user._id) {
        let markup = template({
            t: res.locals.t,
            username: '',
            error_message: i18next.t('An error occured')
        });
        return res.send(markup);
    }
    if (req.body.password !== req.body.passwordagain) {
        let markup = template({
            t: res.locals.t,
            username: user.user_name,
            error_message: i18next.t('Passwords must match')
        });
        return res.send(markup);
    }
    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(req.body.password, salt, function (err, hash) {
            User.updateOne({ id: user._id }, { $set: { 'password': hash } }).catch((err) => {
                return next(err);
            });
        });
    });
    let markup = template({ t: res.locals.t });
    return res.send(markup);
});
router.delete('/', checkAuthReturnMarkup, async function (req, res, next) {
    let template = pug.compileFile('views/profile.pug');
    const user = req.user;
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
    User.deleteOne({ _id: user._id }).catch((err) => {
        next(err);
    });
    template = pug.compileFile('views/login.pug');
    let markup = template({ t: res.locals.t });
    return res.send(markup);
});
export default router;
