import { Router } from 'express';
const router = Router();
import pug from 'pug';
import User from '../models/User.js';
import Chat from '../models/Chat.js';
import { checkAuthReturnMarkup } from '../middleware/checkAuth.js';
router.get('/', checkAuthReturnMarkup, function (req, res, next) {
    let template = pug.compileFile('views/swipe.pug');
    let markup;
    const user = req.user;
    if (user && user.user_name) {
        markup = template({ t: res.locals.t, username: user.user_name });
    }
    else {
        markup = template({ t: res.locals.t, username: 'Guest' });
    }
    return res.send(markup);
});
router.get('/new-swipe-profile', checkAuthReturnMarkup, function (req, res, next) {
    const user = req.user;
    if (!user || !user._id || !user.friends) {
        return res.send();
    }
    User.find({
        $and: [
            { _id: { $nin: user.likes } },
            { _id: { $nin: user.friends } },
            { _id: { $ne: user._id } }
        ]
    }).then((users) => {
        if (users.length > 0) {
            const random_profile = Math.floor(Math.random() * users.length);
            let template = pug.compileFile('views/swipe-profile.pug');
            let images = users[random_profile].images;
            if (users[random_profile].images.length < 1) {
                images.push('default.png');
                images.push('wide.png');
                images.push('tall.png');
            }
            let markup = template({
                t: res.locals.t,
                images: images,
                username: users[random_profile].user_name,
                id: users[random_profile]._id
            });
            return res.send(markup);
        }
        else {
            let template = pug.compileFile('views/swipe-profile-error.pug');
            let markup = template({ t: res.locals.t });
            return res.send(markup);
        }
    }).catch((err) => { return next(err); });
});
router.post('/like/:id', checkAuthReturnMarkup, function (req, res, next) {
    const user = req.user;
    if (!user || !user._id) {
        res.set('HX-Location', JSON.stringify({
            'path': '/swipe/new-swipe-profile', 'target': '.swipe-profile'
        }));
        return res.send();
    }
    User.findOne({ _id: req.params.id }).then((friend) => {
        if (friend) {
            User.updateOne({ _id: user._id }, {
                $push: { 'likes': friend._id }
            }).catch((err) => {
                return next(err);
            });
            const match = friend.likes.includes(user._id);
            if (match) {
                User.updateOne({ _id: user._id }, {
                    $push: { 'friends': friend._id }
                }).catch((err) => {
                    return next(err);
                });
                User.updateOne({ _id: friend._id }, {
                    $push: { 'friends': user._id }
                }).catch((err) => {
                    return next(err);
                });
                initializeChat(user._id, friend._id);
                let template = pug.compileFile('views/match-start-chat.pug');
                let markup = template({
                    t: res.locals.t,
                    match_name: friend.user_name,
                    friend_id: friend._id
                });
                res.set('HX-Retarget', '.match-start-chat');
                res.set('HX-Reswap', 'innerHTML transition:true');
                return res.send(markup);
            }
        }
        else {
            const error = new Error('user not found');
            return next(error);
        }
        res.set('HX-Location', JSON.stringify({
            'path': '/swipe/new-swipe-profile', 'target': '.swipe-profile'
        }));
        return res.send();
    }).catch((err) => { return next(err); });
});
export async function initializeChat(id1, id2) {
    try {
        const chat = await new Chat({
            participant_ids: [id1, id2],
            messages: [],
            last_edited: new Date()
        }).save();
        await Promise.all([
            addChatToUser(id1, chat.id),
            addChatToUser(id2, chat.id)
        ]);
        return chat.id;
    }
    catch (err) {
        return undefined;
    }
}
export async function addChatToUser(userid, chatid) {
    try {
        const match = await User.updateOne({ _id: userid }, { $push: { 'chat_ids': chatid } });
        if (match.modifiedCount > 0) {
            return;
        }
        else {
            const error = new Error('Chat add to user failed');
            throw error;
        }
    }
    catch (err) {
        throw err;
    }
}
export default router;
