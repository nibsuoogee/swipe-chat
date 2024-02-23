import { Router, Request, Response, NextFunction, ErrorRequestHandler } from 'express';
const router = Router();
import pug from 'pug';
import User, { IUser } from '../models/User.js'
import Chat, { IChat, IMessage } from '../models/Chat.js';
import bcrypt from 'bcrypt';
const saltRounds = 10;
import passport from 'passport';
import multer from 'multer';
import { upload } from '../middleware/upload.js';


router.get('/', checkAuthReturnIndex, function (req, res) {
  const user = req.user as IUser | null;
  if (user && user.user_name) {
    return res.render('index', { username: user.user_name });
  } else {
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
}))

router.get('/user/swipe', checkAuthReturnMarkup, function (req, res, next) {
  let template = pug.compileFile('views/swipe.pug');
  let markup;
  const user = req.user as IUser | null;
  if (user && user.user_name) {
    markup = template({ username: user.user_name });
  } else {
    markup = template({ username: 'Guest' });
  }
  return res.send(markup);
});

router.get('/user/new-swipe-profile', checkAuthReturnMarkup, function (req, res, next) {
  const user = req.user as IUser | null;
  if (!user || !user.id || !user.friends) {
    return res.send();
  }

  User.find({
    $and: [
      { 'id': { $nin: user.likes } },
      { 'id': { $nin: user.friends } },
      { 'id': { $ne: user.id } }]
  }).then((users) => {
    if (users.length > 0) {
      const random_profile = Math.floor(Math.random() * users.length);
      let template = pug.compileFile('views/swipe-profile.pug');
      let markup = template({ images: users[random_profile].images, username: users[random_profile].user_name, id: users[random_profile].id });
      return res.send(markup);
    } else {
      let template = pug.compileFile('views/swipe-profile-error.pug');
      let markup = template();
      return res.send(markup);
    }
  }).catch((err) => { console.log(err); return next(err); });
});

router.get('/user/like/:id', checkAuthReturnMarkup, function (req, res, next) {
  res.set('HX-Location', JSON.stringify({ 'path': '/user/new-swipe-profile', 'target': '.swipe-profile' }));
  const user = req.user as IUser | null;
  if (!user || !user.id) {
    return res.send();
  }

  User.findOne({ 'id': req.params.id }).then((friend) => {
    if (friend) {
      User.updateOne({ 'id': user.id },
        {
          $push: { 'likes': friend.id }
        }).catch((err) => {
          console.log(err);
          return next(err);
        });
      const match = friend.likes.includes(user.id);
      if (match) {
        User.updateOne({ 'id': user.id },
          {
            $push: { 'friends': friend.id }
          }).catch((err) => {
            console.log(err);
            return next(err);
          });
        User.updateOne({ 'id': friend.id },
          {
            $push: { 'friends': user.id }
          }).catch((err) => {
            console.log(err);
            return next(err);
          });
        initializeChat(user.id, friend.id);
      }
    } else {
      console.log('user not found')
    }
  }).catch((err) => { console.log(err); return next(err); });
  return res.send();
});

router.post('/user/remove-match/:id', checkAuthReturnMarkup, async function (req, res, next) {
  console.log(req.params.id)
  const user = req.user as IUser | null;
  if (!user || !user.id) {
    return res.send();
  }

  User.findOne({ 'id': req.params.id }).then((friend) => {
    if (friend) {
      User.updateOne({ 'id': user.id },
        {
          $pull: { 'likes': friend.id }
        }).catch((err) => {
          console.log(err);
          return next(err);
        });
      const match = friend.likes.includes(user.id);
      if (match) {
        User.updateOne({ 'id': user.id },
          {
            $pull: { 'friends': friend.id }
          }).catch((err) => {
            console.log(err);
            return next(err);
          });
        User.updateOne({ 'id': friend.id },
          {
            $pull: { 'friends': user.id }
          }).catch((err) => {
            console.log(err);
            return next(err);
          });
        removeChat(user.id, friend.id);
      }
    } else {
      console.log('user not found')
    }
  }).catch((err) => { console.log(err); return next(err); });
});

router.post('/user/logout', checkAuthReturnMarkup, function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      console.log(err)
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
  const user = req.user as IUser | null;
  if (!user || !user.id) {
    let markup = template();
    return res.send(markup);
  }

  try {
    let promises = user.friends.map(async id => {
      const friend = await User.findOne({ 'id': id });
      if (friend && friend.images && friend.images.length > 0) {
        markup += template({ image: friend.images[0], username: friend.user_name, id: friend.id });
      } else if (friend) {
        markup += template({ image: 'default.png', username: friend.user_name, id: friend.id });
      }
    });
    await Promise.all(promises);
    return res.send(markup);
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

router.get('/user/chat/:id', checkAuthReturnMarkup, async function (req, res, next) {
  User.findOne({ 'id': req.params.id }).then((friend) => {
    if (friend) {
      let template = pug.compileFile('views/chat-area.pug');
      let markup = template({ friend: friend.user_name, friend_id: friend.id });
      return res.send(markup);
    } else {
      console.log('user not found')
    }
  }).catch((err) => { console.log(err); return next(err); });
});

router.get('/user/messages/:id', checkAuthReturnMarkup, async function (req, res, next) {
  const template = pug.compileFile('views/message.pug');
  let markup = '';

  const user = req.user as IUser | null;
  const friend: IUser | null = await getUserById(req.params.id);
  if (!user || !user.id || !friend || !friend.id) {
    let markup = template({ username: '' });
    return res.send(markup);
  }

  const name_dict: Record<string, string> = {}
  name_dict[user.id] = user.user_name;
  name_dict[friend.id] = friend.user_name;

  Chat.findOne({ participant_ids: { $all: [user.id, req.params.id] } }).then((chat) => {
    if (chat) {
      try {
        chat.messages.forEach((message: IMessage) => {
          markup += template({ sender_name: name_dict[message.sender_id], text: message.text, date: message.date });
        });
        return res.send(markup);
      } catch (err) {
        console.error(err);
        return next(err);
      }
    } else {
      console.log('chat not found')
    }
  }).catch((err: Error) => { console.log(err); return next(err); });
});

router.post('/user/send-chat/:id', checkAuthReturnMarkup, async function (req, res, next) {
  res.set('HX-Location', JSON.stringify({
    'path': `/user/messages/${req.params.id}`,
    'target': '.chat-feed',
    'swap': 'innerHTML'
  }));

  const user = req.user as IUser | null;
  if (!user || !user.user_name || !user.id) {
    return res.send();
  }

  const date = new Date();
  const message: IMessage = {
    text: req.body.chatInput,
    sender_id: user.id,
    date: date
  }

  Chat.updateOne({ participant_ids: { $all: [user.id, req.params.id] } },
    { $push: { 'messages': message } }
  ).catch((err: Error) => {
    console.log(err); return next(err);
  });
  Chat.updateOne({ participant_ids: { $all: [user.id, req.params.id] } },
    { $set: { 'last_edited': date } }
  ).catch((err: Error) => {
    console.log(err); return next(err);
  });

  return res.send();
});

router.get('/user/profile', checkAuthReturnMarkup, function (req, res, next) {
  let template = pug.compileFile('views/profile.pug');
  const user = req.user as IUser | null;
  if (!user || !user.user_name) {
    let markup = template({ username: '' });
    return res.send(markup);
  }
  let markup = template({ username: user.user_name });
  return res.send(markup);
});

router.get('/user/image', checkAuthReturnMarkup, function (req, res, next) {
  let template = pug.compileFile('views/image.pug');
  const user = req.user as IUser | null;
  if (!user || !user.images) {
    let markup = template({ images: [] });
    return res.send(markup);
  }
  let markup = template({ images: user.images });
  return res.send(markup);
});

router.post('/user/upload-image', checkAuthReturnMarkup, (req, res, next) => {
  const template = pug.compileFile('views/image.pug');
  const user = req.user as IUser | null;
  if (!user || !user.user_name || !user.id) {
    let markup = template({ status_message: 'Image upload failed' });
    return res.send(markup);
  }

  try {
    upload(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        const markup = template({ images: user.images, status_message: 'Image upload failed: ' + err.code });
        return res.send(markup);
      }
      try {
        if (!req.file || !req.file.filename) {
          throw new Error('Image upload failed req.file');
        }

        await User.updateOne({ id: user.id }, { $push: { 'images': req.file.filename } });
        const updated_user = await getUserById(user.id);
        if (!updated_user) {
          throw new Error('Failed to fetch user');
        }
        const markup = template({ images: updated_user.images, status_message: 'Image uploaded' });
        return res.send(markup);
      } catch (err) {
        console.error(err);
        const markup = template({ images: user.images, status_message: 'Image upload failed' });
        return res.send(markup);
      }
    });
  } catch (err) {
    console.error(err);
    const markup = template({ images: user.images, status_message: 'Image upload failed' });
    return res.send(markup);
  }
});

router.post('/user/remove-image/:image', checkAuthReturnMarkup, async (req, res, next) => {
  const template = pug.compileFile('views/image.pug');
  try {
    let user = req.user as IUser | null;
    if (!user || !user.id) {
      throw new Error('Invalid user or user ID');
    }
    await User.updateOne({ id: user.id }, { $pull: { 'images': req.params.image } });
    user = await getUserById(user.id);
    if (!user) {
      throw new Error('Failed to fetch user');
    }
    const markup = template({ images: user.images, status_message: 'Image removed' });
    return res.send(markup);
  } catch (err) {
    console.error(err);
    const markup = template({ status_message: 'Image removal failed' });
    return res.send(markup);
  }
});

router.post('/user/edit-username/', checkAuthReturnMarkup, async function (req, res, next) {
  let template = pug.compileFile('views/profile.pug');
  const user = req.user as IUser | null;
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
    console.log(err); return next(err);
  });
  User.updateOne({ id: user.id },
    { $set: { 'user_name': req.body.username } }
  ).catch((err) => {
    console.log(err); return next(err);
  });
  let markup = template({ username: user.user_name });
  return res.send(markup);
});

router.post('/user/edit-password/', checkAuthReturnMarkup, async function (req, res, next) {
  let template = pug.compileFile('views/profile.pug');
  const user = req.user as IUser | null;
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
      User.updateOne({ id: user.id },
        { $set: { 'password': hash } }
      ).catch((err) => {
        console.log(err); return next(err);
      });
    });
  });
  let markup = template();
  return res.send(markup);
});

function checkAuthReturnIndex(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next()
  }
  return res.render('login_index');
}

function checkAuthReturnMarkup(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next()
  }
  let template = pug.compileFile('views/login.pug');
  let markup = template();
  return res.send(markup);
}

function checkNotAuthReturnIndex(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return res.render('index');
  }
  return next()
}

function checkNotAuthReturnMarkup(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    let template = pug.compileFile('views/swipe.pug');
    let markup = template();
    return res.send(markup);
  }
  return next()
}

async function initializeChat(id1: string, id2: string) {
  try {
    const chat = await new Chat({
      id: Math.floor(Math.random() * 1000),
      participant_ids: [id1, id2],
      messages: [],
      last_edited: new Date()
    }).save();

    await Promise.all([
      addChatToUser(id1, chat.id),
      addChatToUser(id2, chat.id)
    ]);
    return chat.id;
  } catch (err) {
    console.log(err);
    return undefined;
  }
}

async function addChatToUser(userid: string, chatid: string) {
  try {
    const match = await User.updateOne({ 'id': userid }, { $push: { 'chat_ids': chatid } });
    if (match.modifiedCount > 0) {
      return;
    } else {
      console.log('Chat add to user failed')
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function removeChat(id1: string, id2: string) {
  const chat = await Chat.findOne({ participant_ids: { $all: [id1, id2] } });
  if (!chat || !chat.id) {
    console.error('chat.id not defined')
    return;
  }
  removeChatFromUser(id1, chat.id);
  removeChatFromUser(id2, chat.id);
  Chat.deleteOne({ id: chat.id }
  ).catch((err) => {
    console.log(err);
  });

  return;
}

async function removeChatFromUser(userid: string, chatid: string) {
  try {
    const match = await User.updateOne({ 'id': userid }, { $pull: { 'chat_ids': chatid } });
    if (match.modifiedCount > 0) {
      return;
    } else {
      console.log('Chat remove from user failed')
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function getUserById(id: string) {
  try {
    const user: IUser | null = await User.findOne({ id: id });
    return user;
  } catch (err) {
    return null;
  }
}

export default router;