import { Router } from 'express';
const router = Router();
import pug from 'pug';
import { checkAuthReturnIndex, checkAuthReturnNothing, } from '../middleware/checkAuth.js';
import i18next from '../i18n.js';
/*
* Apart from the auth middleware, / is the only route which
* supplies an entire html page (index.pug). Other routes
* return markup (html snippets which HTMX uses to insert into
* selected places in the DOM).
*/
router.get('/', checkAuthReturnIndex, function (req, res) {
    const user = req.user;
    if (user && user.user_name) {
        return res.render('index', { username: user.user_name });
    }
    else {
        return res.render('index', { username: 'Guest' });
    }
});
/*
* /menu return the navigation items for authenticated users
* checkAuthReturnNothing will mean it returns no markup
* if authentication fails.
*/
router.get('/menu', checkAuthReturnNothing, function (req, res, next) {
    let template = pug.compileFile('views/menu.pug');
    let markup = template({ t: i18next.t });
    return res.send(markup);
});
/*
* /lang/:id changes the language of the application to the
* identifier (en, fi). Change takes effect on reload, so redirects
* to /
*/
router.post('/lang/:id', async function (req, res, next) {
    await i18next.changeLanguage(req.params.id);
    res.set('HX-Redirect', '/');
    return res.send();
});
router.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});
export default router;
