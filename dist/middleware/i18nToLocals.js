import i18next from '../i18n.js';
export default function i18nToLocals(req, res, next) {
    res.locals.t = i18next.t;
    next();
}
