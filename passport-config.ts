import { Strategy as LocalStrategy } from "passport-local";

import bcrypt from 'bcrypt';
import { PassportStatic, DoneCallback } from 'passport';
import User, { IUser } from './models/User.js'
import { Types } from 'mongoose';

function initialize(passport: PassportStatic,
  getUserByEmail: (email: string) => Promise<IUser | null>,
  getUserById: (_id: Types.ObjectId) => Promise<IUser | null>) {
  const verifyCallback = async (email: string, password: string, done: any) => {
    const user: IUser | null = await getUserByEmail(email);
    if (!user) {
      return done(null, false, { message: 'Incorrect username or password.' })
    }
    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user)
      } else {
        return done(null, false, { message: 'Incorrect username or password.' })
      }
    } catch (e) {
      return done(e)
    }
  }

  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, verifyCallback))
  passport.serializeUser(function (user: any, done) {
    done(null, user._id);
  });
  passport.deserializeUser(async function (_id: Types.ObjectId, done) {
    try {
      const user = await getUserById(_id);
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  });
}

export default initialize;