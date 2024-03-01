import { Router } from 'express';
const router = Router();
import pug from 'pug';
import { checkAuthReturnIndex, checkAuthReturnNothing, } from '../middleware/checkAuth.js';
import i18next from '../i18n.js';
router.get('/', checkAuthReturnIndex, function (req, res) {
    const user = req.user;
    if (user && user.user_name) {
        return res.render('index', { username: user.user_name });
    }
    else {
        return res.render('index', { username: 'Guest' });
    }
});
router.get('/menu', checkAuthReturnNothing, function (req, res, next) {
    let template = pug.compileFile('views/menu.pug');
    let markup = template({ t: i18next.t });
    return res.send(markup);
});
router.post('/lang/:id', async function (req, res, next) {
    await i18next.changeLanguage(req.params.id);
    res.set('HX-Redirect', '/');
    return res.send();
});
export default router;
