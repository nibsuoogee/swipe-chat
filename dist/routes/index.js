import { Router } from 'express';
const router = Router();
import pug from 'pug';
import User from '../models/User.js';
import Chat from '../models/Chat.js';
import bcrypt from 'bcrypt';
const saltRounds = 10;
import passport from 'passport';
router.get('/', checkAuthReturnIndex, function (req, res) {
    const user = req.user;
    if (user && user.user_name) {
        return res.render('index', { username: user.user_name });
    }
    else {
        return res.render('index', { username: 'Guest' });
    }
});
router.get('/user/register', checkNotAuthReturnMarkup, function (req, res, next) {
    let template = pug.compileFile('views/register.pug');
    let markup = template({ error_message: '' });
    res.send(markup);
});
router.post('/user/register', checkNotAuthReturnMarkup, function (req, res, next) {
    User.findOne({ email: req.body.email }).then((email) => {
        if (email) {
            let template = pug.compileFile('views/register.pug');
            let markup = template({ error_message: 'Email already in use' });
            return res.send(markup);
        }
        else {
            bcrypt.genSalt(saltRounds, function (err, salt) {
                bcrypt.hash(req.body.password, salt, function (err, hash) {
                    new User({
                        user_name: req.body.username,
                        email: req.body.email,
                        password: hash,
                        is_admin: false,
                        images: [],
                        chatids: []
                    }).save().then(() => {
                        let template = pug.compileFile('views/login.pug');
                        let markup = template();
                        return res.send(markup);
                    }).catch((err) => {
                        console.log(err);
                        let template = pug.compileFile('views/register.pug');
                        let markup = template({ error_message: 'Username already in use' });
                        return res.send(markup);
                    });
                });
            });
        }
    }).catch((err) => { console.log(err); return next(err); });
});
router.get('/user/login', checkNotAuthReturnMarkup, function (req, res, next) {
    let template = pug.compileFile('views/login.pug');
    let markup = template({ error_message: '' });
    res.send(markup);
});
router.post('/user/login', checkNotAuthReturnIndex, passport.authenticate('local', {
    successRedirect: '/user/swipe',
    failureRedirect: '/user/login'
}));
router.get('/user/swipe', checkAuthReturnMarkup, function (req, res, next) {
    let template = pug.compileFile('views/swipe.pug');
    let markup;
    const user = req.user;
    if (user && user.user_name) {
        markup = template({ username: user.user_name });
    }
    else {
        markup = template({ username: 'Guest' });
    }
    return res.send(markup);
});
router.get('/user/new-swipe-profile', checkAuthReturnMarkup, function (req, res, next) {
    const user = req.user;
    if (!user || !user.id || !user.friends) {
        return res.send();
    }
    User.find({ $and: [{ 'id': { $nin: user.friends } }, { 'id': { $ne: user.id } }] }).then((users) => {
        if (users.length > 0) {
            const random_profile = Math.floor(Math.random() * users.length);
            let template = pug.compileFile('views/swipe-profile.pug');
            let markup = template({ username: users[random_profile].user_name, id: users[random_profile].id });
            return res.send(markup);
        }
        else {
            let template = pug.compileFile('views/swipe-profile-error.pug');
            let markup = template();
            return res.send(markup);
        }
    }).catch((err) => { console.log(err); return next(err); });
});
router.get('/user/like/:id', checkAuthReturnMarkup, function (req, res, next) {
    res.set('HX-Location', JSON.stringify({ 'path': '/user/new-swipe-profile', 'target': '.swipe-profile' }));
    const user = req.user;
    if (!user || !user.id) {
        return res.send();
    }
    User.updateOne({ 'id': user.id }, { $push: { 'friends': req.params.id } }).then((match) => {
        if (match.modifiedCount > 0) {
            User.findOne({ 'id': req.params.id }).then((friend) => {
                if (friend) {
                    const match = friend.friends.includes(user.id);
                    if (match) {
                        initializeChat(user.id, friend.id);
                    }
                }
                else {
                    console.log('user not found');
                }
            }).catch((err) => { console.log(err); return next(err); });
            return res.send();
        }
        else {
            console.log('/user/like/:id user not found');
        }
    }).catch((err) => { console.log(err); return next(err); });
});
router.post('/user/logout', checkAuthReturnMarkup, function (req, res, next) {
    req.logout(function (err) {
        if (err) {
            console.log(err);
            return next(err);
        }
        let template = pug.compileFile('views/login.pug');
        let markup = template({ error_message: '' });
        return res.send(markup);
    });
});
router.get('/user/messaging', checkAuthReturnMarkup, function (req, res, next) {
    let template = pug.compileFile('views/messaging.pug');
    let markup = template();
    return res.send(markup);
});
router.get('/user/chats', checkAuthReturnMarkup, async function (req, res, next) {
    let template = pug.compileFile('views/chat.pug');
    let markup = '';
    const user = req.user;
    if (!user || !user.id) {
        let markup = template({ username: 'Error', id: '' });
        return res.send(markup);
    }
    try {
        let promises = user.friends.map(async (id) => {
            const friend = await User.findOne({ id: id });
            if (friend) {
                markup += template({ username: friend.user_name, id: friend.id });
            }
        });
        await Promise.all(promises);
        return res.send(markup);
    }
    catch (err) {
        console.error(err);
        return next(err);
    }
});
router.get('/user/chat/:id', checkAuthReturnMarkup, async function (req, res, next) {
    User.findOne({ 'id': req.params.id }).then((friend) => {
        if (friend) {
            let template = pug.compileFile('views/chat-area.pug');
            let markup = template({ friend: friend.user_name, friendid: friend.id });
            return res.send(markup);
        }
        else {
            console.log('user not found');
        }
    }).catch((err) => { console.log(err); return next(err); });
});
router.get('/user/messages/:id', checkAuthReturnMarkup, async function (req, res, next) {
    const template = pug.compileFile('views/message.pug');
    let markup = '';
    const user = req.user;
    if (!user || !user.id) {
        let markup = template({ username: '' });
        return res.send(markup);
    }
    Chat.findOne({ participantids: { $all: [user.id, req.params.id] } }).then((chat) => {
        if (chat) {
            try {
                chat.messages.forEach((message) => {
                    markup += template({ sender_name: message.sender_id, text: message.text, date: message.date });
                });
                return res.send(markup);
            }
            catch (err) {
                console.error(err);
                return next(err);
            }
        }
        else {
            console.log('chat not found');
        }
    }).catch((err) => { console.log(err); return next(err); });
});
router.post('/user/send-chat/:id', checkAuthReturnMarkup, async function (req, res, next) {
    res.set('HX-Location', JSON.stringify({
        'path': `/user/messages/${req.params.id}`,
        'target': '.chat-feed',
        'swap': 'innerHTML'
    }));
    const user = req.user;
    if (!user || !user.user_name || !user.id) {
        return res.send();
    }
    const date = new Date();
    const message = {
        text: req.body.chatInput,
        senderid: user.id,
        sender_name: user.user_name,
        date: date
    };
    let match = await Chat.updateOne({ participantids: { $all: [user.id, req.params.id] } }, { $push: { 'messages': message } }).catch((err) => {
        console.log(err);
        return next(err);
    });
    match = await Chat.updateOne({ participantids: { $all: [user.id, req.params.id] } }, { $set: { 'last_edited': date } }).catch((err) => {
        console.log(err);
        return next(err);
    });
    return res.send();
});
router.get('/user/profile', checkAuthReturnMarkup, function (req, res, next) {
    let template = pug.compileFile('views/profile.pug');
    const user = req.user;
    if (!user || !user.user_name) {
        let markup = template({ username: '' });
        return res.send(markup);
    }
    let markup = template({ username: user.user_name });
    return res.send(markup);
});
router.get('/user/image', checkAuthReturnMarkup, function (req, res, next) {
    let template = pug.compileFile('views/image.pug');
    let markup = template();
    return res.send(markup);
});
router.post('/user/edit-username/', checkAuthReturnMarkup, async function (req, res, next) {
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
        console.log(err);
        return next(err);
    });
    User.updateOne({ id: user.id }, { $set: { 'user_name': req.body.username } }).catch((err) => {
        console.log(err);
        return next(err);
    });
    let markup = template({ username: user.user_name });
    return res.send(markup);
});
router.post('/user/edit-password/', checkAuthReturnMarkup, async function (req, res, next) {
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
                console.log(err);
                return next(err);
            });
        });
    });
    let markup = template();
    return res.send(markup);
});
function checkAuthReturnIndex(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.render('login_index');
}
function checkAuthReturnMarkup(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    let template = pug.compileFile('views/login.pug');
    let markup = template();
    return res.send(markup);
}
function checkNotAuthReturnIndex(req, res, next) {
    if (req.isAuthenticated()) {
        return res.render('index');
    }
    return next();
}
function checkNotAuthReturnMarkup(req, res, next) {
    if (req.isAuthenticated()) {
        let template = pug.compileFile('views/swipe.pug');
        let markup = template();
        return res.send(markup);
    }
    return next();
}
async function initializeChat(id1, id2) {
    try {
        const chat = await new Chat({
            participantids: [id1, id2],
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
        console.log(err);
        return undefined;
    }
}
async function addChatToUser(userid, chatid) {
    try {
        const match = await User.updateOne({ 'id': userid }, { $push: { 'chatids': chatid } });
        if (match.modifiedCount > 0) {
            return;
        }
        else {
            console.log('Chat add to user failed');
        }
    }
    catch (err) {
        console.log(err);
        throw err;
    }
}
export default router;
