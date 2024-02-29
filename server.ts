import createError from 'http-errors';
import express, { Express, Request, Response, NextFunction } from "express"
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import passport from 'passport';
import session from 'express-session';

import authRouter from './routes/auth.js';
import imagesRouter from './routes/images.js';
import indexRouter from './routes/index.js';
import messagingRouter from './routes/messaging.js';
import profileRouter from './routes/profile.js';
import swipeRouter from './routes/swipe.js';

import { getUserByEmail, getUserById } from './middleware/checkAuth.js';

const app: Express = express();

import mongoose from 'mongoose';
const mongoDB = 'mongodb://127.0.0.1:27017/testdb';
mongoose.connect(mongoDB);
mongoose.Promise = Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error'));

import initializePassport from './passport-config.js';
initializePassport(passport, getUserByEmail, getUserById);

app.use(session({
  secret: '901ddf1114f4086b58366bf532ff5b6f6ce4db248f84cd835839f15c4d0827fff91e34e87d6b618f45097f3bb9ab5d1cad775e37507051fbe1aa28b0f6d62730',
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

// view engine setup
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, '/public')));
app.use('/assets', express.static(path.join(__dirname, '/public/assets')));
app.use('/javascripts', express.static(path.join(__dirname, '/javascripts')));
app.use('/uploads', express.static(path.join(__dirname, '/public/uploads')));

app.use('/auth', authRouter);
app.use('/images', imagesRouter);
app.use('/', indexRouter);
app.use('/messaging', messagingRouter);
app.use('/profile', profileRouter);
app.use('/swipe', swipeRouter);

// catch 404 and forward to error handler
app.use(function (req: Request, res: Response, next: NextFunction) {
  next(createError(404));
});

// error handler
app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(err);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  return res.status(500).render('error');
});

export default app;
