import { Router } from 'express';
const router = Router();
import pug from 'pug';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
const saltRounds = 10;
import passport from 'passport';
import { checkNotAuthReturnIndex, checkNotAuthReturnMarkup, checkAuthReturnMarkup } from '../middleware/checkAuth.js';
import i18next from '../i18n.js';
router.get('/register', checkNotAuthReturnMarkup, function (req, res, next) {
    let template = pug.compileFile('views/register.pug');
    let markup = template({ t: i18next.t });
    res.send(markup);
});
router.post('/register', checkNotAuthReturnMarkup, async function (req, res, next) {
    let template = pug.compileFile('views/register.pug');
    try {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            let markup = template({
                t: i18next.t,
                error_message: i18next.t('Email') + ' ' + i18next.t('in use')
            });
            res.send(markup);
        }
        else {
            bcrypt.genSalt(saltRounds, function (err, salt) {
                bcrypt.hash(req.body.password, salt, function (err, hash) {
                    new User({
                        user_name: req.body.username,
                        email: req.body.email,
                        password: hash,
                        is_admin: false
                    }).save().then(() => {
                        template = pug.compileFile('views/login.pug');
                        let markup = template({ t: i18next.t });
                        res.send(markup);
                    }).catch((err) => {
                        let template = pug.compileFile('views/register.pug');
                        let markup = template({
                            t: i18next.t,
                            error_message: err
                        });
                        res.send(markup);
                    });
                });
            });
        }
    }
    catch (err) {
        next(err);
    }
});
router.get('/login', checkNotAuthReturnMarkup, function (req, res, next) {
    let template = pug.compileFile('views/login.pug');
    let markup = '';
    if (!req.session || !req.session.messages ||
        !req.session.messages || req.session.messages.length <= 0) {
        markup = template({ t: i18next.t });
    }
    else {
        const lastErrorIndex = req.session.messages.length - 1;
        const lastErrorMessage = req.session.messages[lastErrorIndex];
        markup = template({ t: i18next.t, error_message: lastErrorMessage });
    }
    return res.send(markup);
});
router.post('/login', checkNotAuthReturnIndex, passport.authenticate('local', {
    successRedirect: '/swipe',
    failureRedirect: '/auth/login', failureMessage: true
}));
router.post('/logout', checkAuthReturnMarkup, function (req, res, next) {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        let template = pug.compileFile('views/login.pug');
        let markup = template({ t: i18next.t, error_message: '' });
        return res.send(markup);
    });
});
export default router;
