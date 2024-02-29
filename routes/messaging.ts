import { Router, NextFunction } from 'express';
const router = Router();
import pug from 'pug';
import User, { IUser } from '../models/User.js'
import Chat, { IChat, IMessage } from '../models/Chat.js';
import { checkAuthReturnMarkup, getUserById } from '../middleware/checkAuth.js';
import { Types } from 'mongoose';

router.get('/', checkAuthReturnMarkup, function (req, res, next) {
  let template = pug.compileFile('views/messaging.pug');
  let markup = template();
  return res.send(markup);
});

router.get('/jump-to-chat/:id', checkAuthReturnMarkup,
  function (req, res, next) {
    let template = pug.compileFile('views/messaging.pug');
    let markup = template({ friend_id: req.params.id });
    return res.send(markup);
  });

router.get('/chats', checkAuthReturnMarkup,
  async function (req, res, next) {
    let template = pug.compileFile('views/chat.pug');
    let markup = '';
    const user = req.user as IUser | null;
    if (!user || !user._id) {
      let markup = template();
      return res.send(markup);
    }

    try {
      let promises = user.friends.map(async id => {
        const friend = await User.findOne({ _id: id });
        if (friend && friend.images && friend.images.length > 0) {
          markup += template({
            image: friend.images[0],
            username: friend.user_name, id: friend._id
          });
        } else if (friend) {
          markup += template({
            image: 'default.png',
            username: friend.user_name,
            id: friend._id
          });
        }
      });
      await Promise.all(promises);
      return res.send(markup);
    } catch (err) {
      return next(err);
    }
  });

router.get('/chat/:id', checkAuthReturnMarkup, async function (req, res, next) {
  let template = pug.compileFile('views/chat-area.pug');
  let last_edited: Date | null = null;
  const user = req.user as IUser | null;
  if (!user || !user._id) {
    let markup = template({ username: '' });
    return res.send(markup);
  }

  Chat.findOne({ participant_ids: { $all: [user._id, req.params.id] } }
  ).then((chat) => {
    if (chat) {
      last_edited = chat.last_edited;
    } else {
      const error = new Error('Chat not found');
      return next(error);
    }
  }).catch((err: Error) => { return next(err); });

  User.findOne({ _id: req.params.id }).then((friend) => {
    if (friend) {
      if (last_edited) {
        let markup = template({
          friend: friend.user_name,
          friend_id: friend._id,
          last_edited: last_edited.toLocaleDateString('en-GB') + ' ' +
            last_edited.toTimeString().split(' ')[0].slice(0, 5)
        });
        return res.send(markup);
      } else {
        let markup = template({
          friend: friend.user_name,
          friend_id: friend._id
        });
        return res.send(markup);
      }
    } else {
      const error = new Error('User not found');
      return next(error);
    }
  }).catch((err) => { return next(err); });
});

router.post('/remove-match/:id', checkAuthReturnMarkup,
  async function (req, res, next) {
    const user = req.user as IUser | null;
    if (!user || !user._id) {
      return res.send();
    }
    try {
      await removeMatch(user._id, req.params.id as any, next);
      let template = pug.compileFile('views/messaging.pug');
      let markup = template();
      return res.send(markup);
    } catch (error) {
      next(error);
    }
  });

router.get('/messages/:id', checkAuthReturnMarkup,
  async function (req, res, next) {
    const template = pug.compileFile('views/message.pug');
    let markup = '';

    const user = req.user as IUser | null;
    const friend: IUser | null = await getUserById(req.params.id as any);
    if (!user || !user._id || !friend || !friend._id) {
      let markup = template({ username: '' });
      return res.send(markup);
    }

    const name_dict: Record<string, string> = {}
    name_dict[user._id.toString()] = user.user_name;
    name_dict[friend._id.toString()] = friend.user_name;

    Chat.findOne({ participant_ids: { $all: [user._id, req.params.id] } }
    ).then((chat) => {
      if (chat) {
        try {
          chat.messages.forEach((message: IMessage) => {
            const time = message.date.toTimeString().split(' ')[0].slice(0, 5);
            if (time) {
              markup += template({
                sender_name: name_dict[message.sender_id.toString()],
                text: message.text,
                date: time
              });
            }
          });
          return res.send(markup);
        } catch (err) {
          return next(err);
        }
      } else {
        const error = new Error('chat not found');
        return next(error);
      }
    }).catch((err) => { return next(err); });
  });

router.post('/send-chat/:id', checkAuthReturnMarkup,
  async function (req, res, next) {
    res.set('HX-Location', JSON.stringify({
      'path': `/messaging/messages/${req.params.id}`,
      'target': '.chat-feed',
      'swap': 'innerHTML'
    }));

    const user = req.user as IUser | null;
    if (!user || !user.user_name || !user._id) {
      return res.send();
    }

    const date = new Date();
    const message: IMessage = {
      text: req.body.chatInput,
      sender_id: user._id,
      date: date
    }

    Chat.updateOne({ participant_ids: { $all: [user._id, req.params.id] } },
      { $push: { 'messages': message } }
    ).catch((err: Error) => {
      return next(err);
    });
    Chat.updateOne({ participant_ids: { $all: [user._id, req.params.id] } },
      { $set: { 'last_edited': date } }
    ).catch((err: Error) => {
      return next(err);
    });

    return res.send();
  });

export async function removeMatch(userid: Types.ObjectId,
  friendid: Types.ObjectId, next: NextFunction) {
  User.findOne({ _id: friendid }).then((friend) => {
    if (friend) {
      User.updateOne({ _id: userid }, {
        $pull: { 'likes': friend._id }
      }).catch((err) => {
        return next(err);
      });
      const match = friend.likes.includes(userid);
      if (match) {
        User.updateOne({ _id: userid }, {
          $pull: { 'friends': friend._id }
        }).then(() => {
          return;
        }).catch((err) => {
          return next(err);
        });
        User.updateOne({ _id: friend._id }, {
          $pull: { 'friends': userid }
        }).catch((err) => {
          return next(err);
        });
        removeChat(userid, friendid);
      }
    } else {
      next(new Error('user not found'));
    }
  }).catch((err) => { return next(err); });
}

export async function removeChat(id1: Types.ObjectId, id2: Types.ObjectId) {
  try {
    const chat = await Chat.findOne({ participant_ids: { $all: [id1, id2] } });
    if (!chat || !chat._id) {
      throw new Error('chat not found');
    }
    removeChatFromUser(id1, chat.id);
    removeChatFromUser(id2, chat.id);
    Chat.deleteOne({ _id: chat._id }
    ).catch((err) => {
      throw err;
    });
  } catch (err) {
    throw err;
  }
}

export async function removeChatFromUser(userid: Types.ObjectId,
  chatid: Types.ObjectId) {
  try {
    await User.updateOne({ _id: userid }, { $pull: { 'chat_ids': chatid } });
  } catch (err) {
    throw err;
  }
}

export default router;