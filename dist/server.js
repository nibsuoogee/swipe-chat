import createError from 'http-errors';
import express from "express";
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import passport from 'passport';
import session from 'express-session';
import indexRouter from './routes/index.js';
const app = express();
import User from './models/User.js';
import mongoose from 'mongoose';
const mongoDB = 'mongodb://127.0.0.1:27017/testdb';
mongoose.connect(mongoDB);
mongoose.Promise = Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error'));
async function getUserByEmail(email) {
    try {
        const user = await User.findOne({ email: email });
        return user;
    }
    catch (err) {
        return null;
    }
}
async function getUserById(id) {
    try {
        const user = await User.findOne({ id: id });
        return user;
    }
    catch (err) {
        return null;
    }
}
import initializePassport from './passport-config.js';
initializePassport(passport, getUserByEmail, getUserById);
app.use(session({
    secret: '901ddf1114f4086b58366bf532ff5b6f6ce4db248f84cd835839f15c4d0827fff91e34e87d6b618f45097f3bb9ab5d1cad775e37507051fbe1aa28b0f6d62730',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
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
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/uploads', express.static(path.join(__dirname, '/public/uploads')));
app.use('/', indexRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    console.error(err);
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    return res.status(500).render('error');
});
export default app;
