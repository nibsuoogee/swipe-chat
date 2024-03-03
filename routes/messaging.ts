import { Router, Request, Response, NextFunction } from 'express';
const router = Router();
import pug from 'pug';
import User, { IUser } from '../models/User.js'
import Chat, { IChat, IMessage } from '../models/Chat.js';
import { checkAuthReturnMarkup, getUserById } from '../middleware/checkAuth.js';
import { Types } from 'mongoose';
import i18next from '../i18n.js';

router.get('/', checkAuthReturnMarkup, function (req, res, next) {
  let template = pug.compileFile('views/messaging.pug');
  let markup = template({ t: i18next.t });
  return res.send(markup);
});

router.get('/jump-to-chat/:id', checkAuthReturnMarkup,
  function (req, res, next) {
    let template = pug.compileFile('views/messaging.pug');
    let markup = template({ t: i18next.t, friend_id: req.params.id });
    return res.send(markup);
  });

router.get('/chats/:currentPage', checkAuthReturnMarkup,
  async function (req, res, next) {
    const PAGE_SIZE = 10;
    let currentPage = 1;

    let pagerTemplate = pug.compileFile('views/chat-pager.pug');
    let template = pug.compileFile('views/chat.pug');
    let markup = '';
    const user = req.user as IUser | null;
    if (!user || !user._id) {
      let markup = template({ t: i18next.t });
      return res.send(markup);
    }

    const friendCount = user.friends.length;
    const pages = Math.ceil(friendCount / PAGE_SIZE);

    if (req.params.currentPage && !isNaN(Number(req.params.currentPage))) {
      currentPage = Number(req.params.currentPage);
    }

    let prev_page_num = currentPage > 1 ? currentPage - 1 : undefined;
    let next_page_num = currentPage < pages ? currentPage + 1 : undefined;

    // Add optional pager to chats list if friends exceed page limit
    if (friendCount > PAGE_SIZE) {
      markup += pagerTemplate({
        t: i18next.t,
        current_page: currentPage,
        max_page: pages,
        prev_page_num,
        next_page_num
      })
    }

    try {
      let friends: (IUser | null)[] = Array(PAGE_SIZE).fill(null);
      let promises = user.friends.map(async (id, index) => {

        // Filter matches for by current page number
        if (index < PAGE_SIZE * (currentPage - 1)) { return; }
        if (index > PAGE_SIZE * currentPage - 1) { return; }
        const friend = await User.findOne({ _id: id });
        if (friend) {
          friends[index - PAGE_SIZE * (currentPage - 1)] = friend;
        }
      });
      await Promise.all(promises);

      friends.forEach(friend => {
        if (friend === null) { return; }
        const image = friend.images && friend.images.length > 0 ?
          friend.images[0] : 'default.png';
        markup += template({
          t: i18next.t,
          image: image,
          username: friend.user_name,
          id: friend._id
        });
      });
    } catch (err) {
      return next(err);
    }

    // Add optional pager again to bottom of list
    if (friendCount > PAGE_SIZE) {
      markup += pagerTemplate({
        t: i18next.t,
        current_page: currentPage,
        max_page: pages,
        prev_page_num,
        next_page_num
      })
    }
    return res.send(markup);
  });

router.get('/chat/:id', checkAuthReturnMarkup, async function (req, res, next) {
  let template = pug.compileFile('views/chat-area.pug');
  let last_edited: Date | null = null;
  const user = req.user as IUser | null;
  if (!user || !user._id) {
    let markup = template({ t: i18next.t, username: '' });
    return res.send(markup);
  }

  await Chat.findOne({ participant_ids: { $all: [user._id, req.params.id] } }
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
          t: i18next.t,
          friend: friend.user_name,
          friend_id: friend._id,
          last_edited: last_edited.toLocaleDateString('en-GB') + ' ' +
            last_edited.toTimeString().split(' ')[0].slice(0, 5)
        });
        return res.send(markup);
      } else {
        let markup = template({
          t: i18next.t,
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
      let markup = template({ t: i18next.t });
      return res.send(markup);
    } catch (error) {
      next(error);
    }
  });

router.get('/messages/:id', checkAuthReturnMarkup,
  async function (req, res, next) {
    let filter = '';
    getMessages(filter, req, res, next);
  })

router.post('/messages-filter/:id', checkAuthReturnMarkup,
  async function (req, res, next) {
    let filter = '';
    if (req.body.searchInput) {
      filter = req.body.searchInput;
    }
    getMessages(filter, req, res, next);
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

export async function getMessages(filter: string, req: Request, res: Response,
  next: NextFunction) {
  const template = pug.compileFile('views/message.pug');
  let markup = '';

  const user = req.user as IUser | null;
  const friend: IUser | null = await getUserById(req.params.id as any);
  if (!user || !user._id || !friend || !friend._id) {
    let markup = template({ t: i18next.t, username: '' });
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
          if (!message.text.includes(filter)) { return; }
          let is_own_message = false;
          if (message.sender_id.equals(user._id)) {
            is_own_message = true;
          }
          const time = message.date.toTimeString().split(' ')[0].slice(0, 5);
          if (time) {
            markup += template({
              t: i18next.t,
              is_own_message: is_own_message,
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
}

/*
* Returns without waiting when match has been removed from initiator's matches
*/
export async function removeMatch(userid: Types.ObjectId,
  friendid: Types.ObjectId, next: NextFunction) {

  await User.findOne({ _id: friendid }).then((friend) => {
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