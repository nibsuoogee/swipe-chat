import User from '../models/User.js';
import pug from 'pug';
export function checkAuthReturnIndex(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.render('index');
}
export function checkAuthReturnMarkup(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    let template = pug.compileFile('views/login.pug');
    let markup = template();
    return res.send(markup);
}
export function checkAuthReturnNothing(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    let markup = '';
    return res.send(markup);
}
export function checkNotAuthReturnIndex(req, res, next) {
    if (req.isAuthenticated()) {
        return res.render('index');
    }
    return next();
}
export function checkNotAuthReturnMarkup(req, res, next) {
    if (req.isAuthenticated()) {
        let template = pug.compileFile('views/swipe.pug');
        let markup = template();
        return res.send(markup);
    }
    return next();
}
export async function getUserByEmail(email) {
    try {
        const user = await User.findOne({ email: email });
        return user;
    }
    catch (err) {
        return null;
    }
}
export async function getUserById(id) {
    try {
        const user = await User.findOne({ id: id });
        return user;
    }
    catch (err) {
        return null;
    }
}
