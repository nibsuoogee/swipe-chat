import { Router } from 'express';
const router = Router();
import pug from 'pug';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
const saltRounds = 10;
import { checkAuthReturnMarkup } from '../middleware/checkAuth.js';
import { removeMatch } from './messaging.js';
router.get('/', checkAuthReturnMarkup, function (req, res, next) {
    let template = pug.compileFile('views/profile.pug');
    const user = req.user;
    if (!user || !user.user_name) {
        let markup = template({ username: '' });
        return res.send(markup);
    }
    let markup = template({ username: user.user_name });
    return res.send(markup);
});
router.post('/edit-username/', checkAuthReturnMarkup, async function (req, res, next) {
    let template = pug.compileFile('views/profile.pug');
    const user = req.user;
    if (!user || !user.user_name || !user.id) {
        let markup = template({ username: '', error_message: 'An error occured' });
        return res.send(markup);
    }
    User.findOne({ user_name: req.body.username }).then((user) => {
        if (user) {
            let markup = template({ username: user.user_name, error_message: 'Name occupied' });
            return res.send(markup);
        }
    }).catch((err) => {
        return next(err);
    });
    User.updateOne({ id: user.id }, { $set: { 'user_name': req.body.username } }).catch((err) => {
        return next(err);
    });
    let markup = template({ username: user.user_name });
    return res.send(markup);
});
router.post('/edit-password/', checkAuthReturnMarkup, async function (req, res, next) {
    let template = pug.compileFile('views/profile.pug');
    const user = req.user;
    if (!user || !user.user_name || !user.id) {
        let markup = template({ username: '', error_message: 'An error occured' });
        return res.send(markup);
    }
    if (req.body.password !== req.body.passwordagain) {
        let markup = template({ username: user.user_name, error_message: 'Passwords must match' });
        return res.send(markup);
    }
    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(req.body.password, salt, function (err, hash) {
            User.updateOne({ id: user.id }, { $set: { 'password': hash } }).catch((err) => {
                return next(err);
            });
        });
    });
    let markup = template();
    return res.send(markup);
});
router.delete('/', checkAuthReturnMarkup, async function (req, res, next) {
    let template = pug.compileFile('views/profile.pug');
    const user = req.user;
    if (!user || !user.user_name || !user.id) {
        let markup = template({ username: '', error_message: 'An error occured' });
        return res.send(markup);
    }
    user.friends.forEach((friend) => {
        removeMatch(user.id, friend, next);
    });
    User.deleteOne({ id: user.id }).catch((err) => {
        next(err);
    });
    template = pug.compileFile('views/login.pug');
    let markup = template();
    return res.send(markup);
});
export default router;
