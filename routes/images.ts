import { Router } from 'express';
const router = Router();
import pug from 'pug';
import User, { IUser } from '../models/User.js'
import multer from 'multer';
import { upload } from '../middleware/upload.js';
import {
  checkAuthReturnMarkup,
  getUserById
} from '../middleware/checkAuth.js';

router.get('/', checkAuthReturnMarkup, function (req, res, next) {
  let template = pug.compileFile('views/image.pug');
  const user = req.user as IUser | null;
  if (!user || !user.images) {
    let markup = template({ images: [] });
    return res.send(markup);
  }
  let markup = template({ images: user.images });
  return res.send(markup);
});

router.post('/upload-image', checkAuthReturnMarkup, (req, res, next) => {
  const template = pug.compileFile('views/image.pug');
  const user = req.user as IUser | null;
  if (!user || !user.user_name || !user._id) {
    let markup = template({ status_message: 'Image upload failed' });
    return res.send(markup);
  }

  try {
    upload(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        const markup = template({
          images: user.images,
          status_message: 'Image upload failed: ' + err.code
        });
        return res.send(markup);
      }

      if (!req.file || !req.file.filename) {
        throw new Error('Image upload failed req.file');
      }

      await User.updateOne({ _id: user._id },
        { $push: { 'images': req.file.filename } });
      const updated_user = await getUserById(user._id);
      if (!updated_user) {
        throw new Error('Failed to fetch user');
      }
      const markup = template({
        images: updated_user.images,
        status_message: 'Image uploaded'
      });
      return res.send(markup);

    });
  } catch (err) {
    const markup = template({
      images: user.images,
      status_message: 'Image upload failed'
    });
    return res.send(markup);
  }
});

router.post('/remove-image/:image', checkAuthReturnMarkup,
  async (req, res, next) => {
    const template = pug.compileFile('views/image.pug');
    try {
      let user = req.user as IUser | null;
      if (!user || !user._id) {
        throw new Error('Invalid user or user ID');
      }
      await User.updateOne({ _id: user._id },
        { $pull: { 'images': req.params.image } });
      user = await getUserById(user._id);
      if (!user) {
        throw new Error('Failed to fetch user');
      }
      const markup = template({
        images: user.images,
        status_message: 'Image removed'
      });
      return res.send(markup);
    } catch (err) {
      const markup = template({ status_message: 'Image removal failed' });
      return res.send(markup);
    }
  });

export default router;